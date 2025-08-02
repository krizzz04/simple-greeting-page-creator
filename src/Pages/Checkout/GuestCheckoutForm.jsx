import React from 'react';
import TextField from "@mui/material/TextField";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const GuestCheckoutForm = ({ formFields, setFormsFields, phone, setPhone }) => {
    
    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormsFields((prevFields) => ({
            ...prevFields,
            [name]: value
        }));
    };

    return (
        <div className="card bg-white shadow-md p-5 rounded-md w-full">
            <h2 className="text-xl font-semibold">Guest Shipping Details</h2>
            <p className="text-gray-600 mb-6">Please provide your information to complete the order.</p>
            
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField fullWidth label="Full Name" name="name" value={formFields.name} onChange={onChangeInput} size="small" required />
                    <TextField fullWidth label="Email" name="email" type="email" value={formFields.email} onChange={onChangeInput} size="small" required />
                </div>

                <PhoneInput
                    defaultCountry="in"
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                    className="w-full"
                />

                <TextField fullWidth label="Address Line 1" name="address_line1" value={formFields.address_line1} onChange={onChangeInput} size="small" required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField fullWidth label="City" name="city" value={formFields.city} onChange={onChangeInput} size="small" required />
                    <TextField fullWidth label="State / Province" name="state" value={formFields.state} onChange={onChangeInput} size="small" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField fullWidth label="Pincode / ZIP" name="pincode" value={formFields.pincode} onChange={onChangeInput} size="small" required />
                    <TextField fullWidth label="Country" name="country" value={formFields.country} onChange={onChangeInput} size="small" required />
                </div>
            </div>
        </div>
    );
};

export default GuestCheckoutForm;