// src/Pages/Verify/index.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MyContext } from '../../App';
import OtpInput from 'react-otp-input';
import Button from '@mui/material/Button';
import { postData } from '../../utils/api'; // We'll use this to register the user on our backend

const Verify = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const context = useContext(MyContext);

    const phoneNumber = location.state?.phoneNumber;

    if (!phoneNumber) {
        navigate('/login');
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length < 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        context.setLoading(true);
        try {
            const confirmationResult = window.confirmationResult;
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // User is signed in with Firebase. Now, let's get a token from our own backend.
            // This is a common pattern: authenticate with Firebase, then get a session token from your server.
            const firebaseToken = await user.getIdToken();
            const backendRes = await postData('/user/firebase-login', { token: firebaseToken });

            context.setLoading(false);

            if (backendRes.error) {
                setError(backendRes.error);
            } else {
                 // Login successful on our backend as well
                context.handleLogin(backendRes.token, backendRes.refreshToken);
                navigate('/');
            }

        } catch (error) {
            context.setLoading(false);
            console.error("Firebase OTP verification error:", error);
            setError("Verification failed. Incorrect code or the code has expired.");
        }
    };

    return (
        <section className='loginSection'>
            <div className='container'>
                <div className='box'>
                    <form onSubmit={handleVerify}>
                        <h2>Verify Your Phone Number</h2>
                        <p>An OTP has been sent to <strong>{phoneNumber}</strong></p>
                        
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}

                        <div className='form-group otp-input-container d-flex justify-content-center'>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                separator={<span>-</span>}
                                inputStyle={{
                                    width: '3rem',
                                    height: '3rem',
                                    margin: '0 0.5rem',
                                    fontSize: '1.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                }}
                                renderInput={(props) => <input {...props} />}
                            />
                        </div>
                        
                        <div className='form-group mt-4'>
                            <Button type="submit" className='btn-blue btn-lg w-100'>Verify & Login</Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Verify;