import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { FaWhatsapp, FaSms, FaCheckCircle, FaClock } from 'react-icons/fa';

const OrderProcessingPopup = ({ isOpen, onComplete, orderDetails, onStepUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState({
    order: 'pending',
    sms: 'pending',
    whatsapp: 'pending',
    confirmation: 'pending'
  });

  // Function to update step status externally
  const updateStepStatus = (stepId, status) => {
    setStepStatus(prev => ({
      ...prev,
      [stepId]: status
    }));
  };

  // Expose update function to parent
  useEffect(() => {
    if (onStepUpdate) {
      onStepUpdate(updateStepStatus);
    }
  }, [onStepUpdate]);

  const steps = [
    {
      id: 'order',
      title: 'Processing Order',
      description: 'Saving your order details...',
      icon: FaClock,
      duration: 2000
    },
    {
      id: 'sms',
      title: 'Sending mail',
      description: 'Sending order confirmation via mail...',
      icon: FaSms,
      duration: 3000
    },
    {
      id: 'whatsapp',
      title: 'Sending WhatsApp',
      description: 'Sending detailed order info via WhatsApp...',
      icon: FaWhatsapp,
      duration: 4000
    },
    {
      id: 'confirmation',
      title: 'Final Confirmation',
      description: 'Confirming your order...',
      icon: FaCheckCircle,
      duration: 2000
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setStepStatus({
        order: 'pending',
        sms: 'pending',
        whatsapp: 'pending',
        confirmation: 'pending'
      });
      return;
    }

    // If onStepUpdate is provided, use external control
    if (onStepUpdate) {
      return;
    }

    // Otherwise, use internal simulation
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Update current step
        setCurrentStep(i);
        setStepStatus(prev => ({
          ...prev,
          [step.id]: 'processing'
        }));

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, step.duration));

        // Mark step as completed
        setStepStatus(prev => ({
          ...prev,
          [step.id]: 'completed'
        }));
      }

      // Wait a bit before completing
      setTimeout(() => {
        onComplete();
      }, 1000);
    };

    processSteps();
  }, [isOpen, onStepUpdate]);

  // Reset when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setStepStatus({
        order: 'pending',
        sms: 'pending',
        whatsapp: 'pending',
        confirmation: 'pending'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircularProgress size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Processing Your Order
          </h2>
          <p className="text-gray-600 text-sm">
            Please wait while we process your order and send notifications...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = stepStatus[step.id];
            const isCurrent = currentStep === index;
            const isCompleted = status === 'completed';
            const isProcessing = status === 'processing';

            return (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isProcessing
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : isProcessing
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isProcessing ? (
                    <CircularProgress size={20} className="text-blue-600" />
                  ) : isCompleted ? (
                    <FaCheckCircle size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`font-medium text-sm ${
                    isCompleted ? 'text-green-800' : isProcessing ? 'text-blue-800' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${
                    isCompleted ? 'text-green-600' : isProcessing ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="ml-2">
                  {isCompleted && (
                    <FaCheckCircle className="text-green-600" size={16} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Estimated time: ~{Math.ceil(steps.reduce((acc, step) => acc + step.duration, 0) / 1000)} seconds
          </p>
        </div>

        {/* Order Details Preview */}
        {orderDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Order Summary:</p>
            <p className="text-sm font-medium text-gray-800">
              Total: ₹{orderDetails.totalAmt || orderDetails.totalAmount || 'N/A'}
            </p>
            <p className="text-xs text-gray-600">
              Items: {orderDetails.products?.length || 0} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessingPopup;
