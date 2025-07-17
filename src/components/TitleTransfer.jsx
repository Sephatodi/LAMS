/** @jsxRuntime classic */
/** @jsx React.createElement */


import React, { useState } from 'react';
import { useBlockchain } from '../../hooks/useBlockchain';
import BiometricAuth from '../../security/auth/BiometricAuth';
import OTPService from '../../security/auth/OTPService';
import './TitleTransfer.css';

const TitleTransfer = ({ titleId, currentOwner }) => {
  const [newOwner, setNewOwner] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { transferTitle } = useBlockchain();

  const handleInitiateTransfer = async () => {
    setLoading(true);
    try {
      // First verify identity
      await BiometricAuth.authenticate(
        'Verify identity to initiate transfer'
      );
      
      // Send OTP to current owner
      await OTPService.generateOTP(currentOwner, 'sms');
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      // Verify OTP
      const { isValid } = await OTPService.verifyOTP(currentOwner, otp);
      if (!isValid) {
        throw new Error('Invalid OTP provided');
      }

      // Execute blockchain transfer
      await transferTitle(titleId, newOwner);
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="transfer-container">
      <h2>Transfer Title Ownership</h2>
      <div className="transfer-steps">
        {step === 1 && (
          <div className="step-initiate">
            <p>Current Owner: <strong>{currentOwner}</strong></p>
            <div className="form-group">
              <label htmlFor="newOwner">New Owner ID:</label>
              <input
                type="text"
                id="newOwner"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter new owner's national ID"
              />
            </div>
            <button
              className="btn-initiate"
              onClick={handleInitiateTransfer}
              disabled={!newOwner || loading}
            >
              {loading ? 'Processing...' : 'Initiate Transfer'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-confirm">
            <p>OTP sent to registered mobile number for {currentOwner}</p>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP:</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength="6"
              />
            </div>
            <button
              className="btn-confirm"
              onClick={handleConfirmTransfer}
              disabled={!otp || otp.length < 6 || loading}
            >
              {loading ? 'Processing...' : 'Confirm Transfer'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="step-complete">
            <div className="success-message">
              <h3>Transfer Successful!</h3>
              <p>
                Title {titleId} has been transferred to {newOwner}
              </p>
              <p>A copy of the transfer deed has been sent to both parties.</p>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TitleTransfer;