/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import CryptoJS from 'crypto-js';

class OTPService {
  constructor() {
    this.otpApiUrl = process.env.REACT_APP_OTP_API_URL || 'https://auth.gov.bw/api/otp';
    this.otpExpiry = 300; // 5 minutes in seconds
    this.otpLength = 6;
    this.otpCache = new Map();
  }

  async generateOTP(userId, channel = 'sms') {
    try {
      // Generate cryptographically secure OTP (simplified for example)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + this.otpExpiry * 1000;

      // Hash the OTP before sending/storing
      const hashedOTP = CryptoJS.SHA256(otp).toString();

      // Store in cache (in production, use a secure server-side cache)
      this.otpCache.set(userId, { otp: hashedOTP, expiry });

      // Send OTP to user (simulated)
      if (channel === 'sms') {
        await this._sendSMSOTP(userId, otp);
      } else {
        await this._sendEmailOTP(userId, otp);
      }

      return { success: true, otpId: CryptoJS.SHA256(userId).toString() };
    } catch (error) {
      console.error('Failed to generate OTP:', error);
      throw error;
    }
  }

  async verifyOTP(userId, otp) {
    try {
      const storedOTP = this.otpCache.get(userId);

      if (!storedOTP) {
        throw new Error('OTP not found or expired');
      }

      if (Date.now() > storedOTP.expiry) {
        this.otpCache.delete(userId);
        throw new Error('OTP expired');
      }

      const hashedInput = CryptoJS.SHA256(otp).toString();
      const isValid = hashedInput === storedOTP.otp;

      if (isValid) {
        this.otpCache.delete(userId);
      }

      return { isValid };
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  async _sendSMSOTP(userId, otp) {
    // In production, integrate with Botswana's SMS gateway
    console.log(`[SMS] OTP for ${userId}: ${otp}`);
    return { success: true };
  }

  async _sendEmailOTP(userId, otp) {
    // In production, integrate with email service
    console.log(`[Email] OTP for ${userId}: ${otp}`);
    return { success: true };
  }

  async resendOTP(userId, channel = 'sms') {
    try {
      // Clear existing OTP if any
      this.otpCache.delete(userId);
      return await this.generateOTP(userId, channel);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      throw error;
    }
  }
}

export default OTPService();