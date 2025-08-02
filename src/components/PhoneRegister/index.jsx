import React, { useState, useContext } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import CountrySelector from "../CountrySelector";

const PhoneRegister = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP input, 3: name input
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-register', {
        'size': 'normal',
        'callback': (response) => {
          console.log('reCAPTCHA verified');
        }
      });
    }
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
      setStep(3);
      context.alertBox("success", "Phone verified! Please enter your name.");
    } catch (error) {
      console.error('Error verifying OTP:', error);
      context.alertBox("error", "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!name.trim()) {
      context.alertBox("error", "Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number with selected country code for backend
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        // Remove any leading zeros and add country code
        const cleanPhone = phone.replace(/^0+/, '');
        formattedPhone = `${selectedCountry.dialCode}${cleanPhone}`;
      }
      
      console.log('Completing registration with data:', {
        phone: formattedPhone,
        name: name.trim(),
        firebaseUid: confirmationResult.user?.uid
      });
      
      // Call backend to register user
      const response = await postData("/api/user/authWithPhone", {
        phone: formattedPhone,
        name: name.trim(),
        firebaseUid: confirmationResult.user?.uid
      });

      console.log('Registration response:', response);

      if (response?.error === false && response?.data?.accesstoken) {
        context.alertBox("success", response?.message || "Registration successful!");
        
        console.log('Storing tokens:', { 
          accesstoken: response.data.accesstoken ? 'present' : 'missing',
          refreshToken: response.data.refreshToken ? 'present' : 'missing'
        });
        
        // Store tokens
        localStorage.setItem("accessToken", response.data.accesstoken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        
        // Call success callback
        onSuccess && onSuccess(response.data);
      } else {
        console.error('Registration failed:', response);
        context.alertBox("error", response?.message || "Registration failed");
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      context.alertBox("error", "Registration failed. Please try again.");
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
          
          <div id="recaptcha-container-register" className="flex justify-center"></div>
          
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
            Back to Register Options
          </Button>
        </div>
      ) : step === 2 ? (
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
      ) : (
        <div className="space-y-4">
          <div className="form-group w-full">
            <TextField
              type="text"
              id="name"
              label="Full Name"
              variant="outlined"
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={completeRegistration} 
            disabled={isLoading || !name.trim()} 
            className="btn-org btn-lg w-full flex gap-3"
          >
            {isLoading ? <CircularProgress color="inherit" /> : 'Complete Registration'}
          </Button>
          
          <Button 
            onClick={() => setStep(2)} 
            className="w-full !text-gray-600"
            disabled={isLoading}
          >
            Back to OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhoneRegister; 