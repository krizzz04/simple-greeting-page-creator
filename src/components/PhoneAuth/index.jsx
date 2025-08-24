import React, { useState, useContext } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import CountrySelector from "../CountrySelector";

const PhoneAuth = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP input
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳'
  });
  const context = useContext(MyContext);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          // reCAPTCHA solved, allow sending SMS.
          console.log('reCAPTCHA verified');
        }
      });
    }
    setRecaptchaVerifier(window.recaptchaVerifier);
  };

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      context.alertBox("error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      setupRecaptcha();
      
      // Format phone number with selected country code
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        // Remove any leading zeros and add country code
        const cleanPhone = phone.replace(/^0+/, '');
        formattedPhone = `${selectedCountry.dialCode}${cleanPhone}`;
      }
      
      console.log('Sending OTP to:', formattedPhone);
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
      context.alertBox("success", "OTP sent successfully!");
    } catch (error) {
      console.error('Error sending OTP:', error);
      context.alertBox("error", error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      context.alertBox("error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log('Firebase user:', user);
      
      // Format phone number with selected country code for backend
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        // Remove any leading zeros and add country code
        const cleanPhone = phone.replace(/^0+/, '');
        formattedPhone = `${selectedCountry.dialCode}${cleanPhone}`;
      }
      
      console.log('Sending to backend:', formattedPhone);
      
      // Call backend to authenticate
      const response = await postData("/api/user/authWithPhone", {
        phone: formattedPhone,
        name: user.displayName || `User_${phone.slice(-4)}`,
        firebaseUid: user.uid
      });

      console.log('Backend response:', response);

      if (response?.error === false && response?.data?.accesstoken) {
        context.alertBox("success", response?.message || "Login successful!");
        
        console.log('Storing tokens:', { 
          accesstoken: response.data.accesstoken ? 'present' : 'missing',
          refreshToken: response.data.refreshToken ? 'present' : 'missing'
        });
        
        // Use the new handleLogin function to properly update auth state
        context.handleLogin(response.data.accesstoken, response.data.refreshToken);
        
        // Call success callback
        onSuccess && onSuccess(response.data);
      } else {
        console.error('Authentication failed:', response);
        context.alertBox("error", response?.message || "Authentication failed");
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      context.alertBox("error", "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    sendOTP();
  };

  return (
    <div className="w-full">
      {step === 1 ? (
        <div className="space-y-4">
          <div className="form-group w-full">
            <div className="flex gap-2">
              <CountrySelector 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              <TextField
                type="tel"
                id="phone"
                label="Phone Number"
                variant="outlined"
                className="flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                disabled={isLoading}
                helperText={`Enter your phone number for ${selectedCountry.name}`}
              />
            </div>
          </div>
          
          <div id="recaptcha-container" className="flex justify-center"></div>
          
          <Button 
            onClick={sendOTP} 
            disabled={isLoading || !phone} 
            className="btn-org btn-lg w-full flex gap-3"
          >
            {isLoading ? <CircularProgress color="inherit" /> : 'Send OTP'}
          </Button>
          
          <Button 
            onClick={onBack} 
            className="w-full !text-gray-600"
            disabled={isLoading}
          >
            Back to Login Options
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="form-group w-full">
            <TextField
              type="text"
              id="otp"
              label="Enter OTP"
              variant="outlined"
              className="w-full"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              disabled={isLoading}
              maxLength={6}
            />
          </div>
          
          <Button 
            onClick={verifyOTP} 
            disabled={isLoading || !otp} 
            className="btn-org btn-lg w-full flex gap-3"
          >
            {isLoading ? <CircularProgress color="inherit" /> : 'Verify OTP'}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setStep(1)} 
              className="flex-1 !text-gray-600"
              disabled={isLoading}
            >
              Change Phone
            </Button>
            <Button 
              onClick={resendOTP} 
              className="flex-1 !text-blue-600"
              disabled={isLoading}
            >
              Resend OTP
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneAuth; 