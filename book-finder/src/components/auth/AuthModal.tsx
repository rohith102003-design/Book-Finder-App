import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Sparkles,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface AuthModalProps {
  darkMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ darkMode = false }) => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unverifiedLoginAttempt, setUnverifiedLoginAttempt] = useState<boolean>(false);

  // Forgot password sub-step: 'request' | 'reset' | 'completed'
  const [forgotStep, setForgotStep] = useState<'request' | 'reset' | 'completed'>('request');

  // Reset form inputs when modal opens or tab changes
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalTab !== 'forgot-password' && authModalTab !== 'verify-email') {
        setEmail('');
      }
      setUsername('');
      setPassword('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setShowPassword(false);
      setShowNewPassword(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      setIsResending(false);
      setUnverifiedLoginAttempt(false);
      setForgotStep('request');
    }
  }, [isAuthModalOpen, authModalTab]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Password validation checks for registration / new password
  const targetPassword = authModalTab === 'forgot-password' ? newPassword : password;
  const hasMinLength = targetPassword.length >= 8 && targetPassword.length <= 64;
  const hasUpper = /[A-Z]/.test(targetPassword);
  const hasLower = /[a-z]/.test(targetPassword);
  const hasNumber = /\d/.test(targetPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=]/.test(targetPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Email format check
  const isValidEmail = (addr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.trim());
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setUnverifiedLoginAttempt(false);

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email presence and format
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (authModalTab === 'register') {
      const trimmedUsername = username.trim();
      if (!trimmedUsername || trimmedUsername.length < 3) {
        setErrorMessage('Username must be at least 3 characters long.');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
        setErrorMessage('Username may only contain letters, numbers, underscores, and hyphens.');
        return;
      }
      if (!isPasswordValid) {
        setErrorMessage('Please meet all password requirements listed below.');
        return;
      }
    } else {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login(trimmedEmail, password);
      } else {
        const regRes = await register(trimmedEmail, username.trim(), password);
        // Switch to verification code screen
        setSuccessMessage(regRes.message || 'Verification code sent to your email.');
        openAuthModal('verify-email');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrorMessage('Unable to connect to authentication server. Please ensure the backend is running.');
        } else {
          const errCode = err.response.data?.error?.code;
          const backendMessage =
            err.response.data?.error?.message ||
            err.response.data?.detail ||
            'Authentication failed. Please check your credentials.';
          setErrorMessage(backendMessage);

          if (errCode === 'EMAIL_NOT_VERIFIED' || err.response.status === 403) {
            setUnverifiedLoginAttempt(true);
          }
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit 6-digit Email Verification Code
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = verificationCode.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!trimmedCode || trimmedCode.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(trimmedEmail, trimmedCode);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Invalid or expired verification code. Please try again.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to verify email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Verification Code
  const handleResendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    try {
      const msg = await resendVerification(trimmedEmail);
      setSuccessMessage(msg);
      setResendCooldown(60); // 60s cooldown
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Failed to resend verification code.'
        );
      } else {
        setErrorMessage('Failed to resend verification code.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // Step 1 of Forgot Password: Request reset code/token
  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setSuccessMessage('Password reset verification code generated!');
      setForgotStep('reset');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Unable to process password reset request.'
        );
      } else {
        setErrorMessage('Failed to request password reset code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 of Forgot Password: Submit new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!resetToken.trim()) {
      setErrorMessage('Please provide the reset verification code or token.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Please ensure your new password satisfies all requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(trimmedEmail, resetToken.trim(), newPassword);
      setSuccessMessage('Password updated successfully!');
      setForgotStep('completed');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Failed to reset password. Token may have expired.'
        );
      } else {
        setErrorMessage('Failed to reset password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with Soft Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          data-testid="auth-modal-backdrop"
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-all ${
            darkMode
              ? 'bg-[#0f172a] border-gray-800 text-gray-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Brand Icon */}
          <div className="px-6 pt-7 pb-3 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              {authModalTab === 'verify-email' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : authModalTab === 'forgot-password' ? (
                <KeyRound className="w-6 h-6" />
              ) : (
                <BookOpen className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-extrabold tracking-tight">
                {authModalTab === 'verify-email'
                  ? 'Verify Your Email'
                  : authModalTab === 'forgot-password'
                  ? 'Reset Password'
                  : authModalTab === 'login'
                  ? 'Welcome Back'
                  : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {authModalTab === 'verify-email'
                  ? 'Enter the 6-digit code sent to your email to activate your account.'
                  : authModalTab === 'forgot-password'
                  ? 'Recover your BiblioTrack reading account securely.'
                  : authModalTab === 'login'
                  ? 'Sign in with your verified email account to restore your reading progress.'
                  : 'Join the BiblioTrack reading hub and save your personal library.'}
              </p>
            </div>
          </div>

          {/* Tab Switcher (Only on login / register) */}
          {authModalTab === 'login' || authModalTab === 'register' ? (
            <div className="px-6 pb-2">
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700/60 flex items-center">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    authModalTab === 'login'
                      ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    authModalTab === 'register'
                      ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
          ) : (
            /* Back to Sign In Link */
            <div className="px-6 pb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

          {/* 1. EMAIL VERIFICATION WORKFLOW */}
          {authModalTab === 'verify-email' ? (
            <form onSubmit={handleVerifyEmailSubmit} className="px-6 pb-6 pt-2 space-y-3">
              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-2xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Target Email display / input */}
              <div className="space-y-1">
                <label
                  htmlFor="verify-email-input"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="verify-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* 6-Digit Code Input */}
              <div className="space-y-1">
                <label
                  htmlFor="verify-code-input"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="verify-code-input"
                  type="text"
                  required
                  maxLength={10}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\s+/g, ''))}
                  placeholder="123456"
                  className={`w-full px-4 py-3 rounded-2xl text-center text-lg sm:text-xl font-mono tracking-widest font-black border focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? 'bg-gray-800/80 border-gray-700 text-indigo-400 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-600'
                      : 'bg-slate-50 border-slate-200 text-indigo-600 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-300'
                  }`}
                />
              </div>

              {/* Submit Activation Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Activate Account</span>
                  </>
                )}
              </button>

              {/* Resend Code Section */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Did not receive code? Resend'}
                  </span>
                </button>
              </div>
            </form>
          ) : authModalTab === 'forgot-password' ? (
            /* 2. FORGOT PASSWORD WORKFLOW */
            <div className="px-6 pb-6 pt-2 space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-2xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && forgotStep !== 'completed' && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {forgotStep === 'request' ? (
                /* Step 1: Enter email */
                <form onSubmit={handleRequestResetToken} className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="forgot-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                          darkMode
                            ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Request Password Reset</span>
                      </>
                    )}
                  </button>
                </form>
              ) : forgotStep === 'reset' ? (
                /* Step 2: Enter new password */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  {/* Target Email display */}
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-xs flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Resetting:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>
                  </div>

                  {/* Reset Token / Code */}
                  <div className="space-y-1">
                    <label
                      htmlFor="reset-token"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Reset Verification Code / Token
                    </label>
                    <input
                      id="reset-token"
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste reset token or code"
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="new-password"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full pl-10 pr-11 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                          darkMode
                            ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="confirm-password"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                          darkMode
                            ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  {newPassword.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/60 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p className="font-bold text-[10px] uppercase tracking-wider mb-1 text-indigo-500">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span className={hasMinLength ? 'text-emerald-500 font-semibold' : ''}>
                          {hasMinLength ? '✓' : '○'} 8-64 characters
                        </span>
                        <span className={hasUpper ? 'text-emerald-500 font-semibold' : ''}>
                          {hasUpper ? '✓' : '○'} 1 uppercase
                        </span>
                        <span className={hasLower ? 'text-emerald-500 font-semibold' : ''}>
                          {hasLower ? '✓' : '○'} 1 lowercase
                        </span>
                        <span className={hasNumber ? 'text-emerald-500 font-semibold' : ''}>
                          {hasNumber ? '✓' : '○'} 1 number
                        </span>
                        <span className={`col-span-2 ${hasSpecial ? 'text-emerald-500 font-semibold' : ''}`}>
                          {hasSpecial ? '✓' : '○'} 1 special character (!@#$%^&*()_+-=)
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save New Password</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 3: Success Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Password Reset Complete!
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                      Your password has been securely updated in the database. You can now sign in with your new credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    Sign In Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 3. STANDARD LOGIN & REGISTRATION FORMS */
            <form onSubmit={handleStandardSubmit} className="px-6 pb-6 pt-2 space-y-3">
              {/* Error Notification */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  {unverifiedLoginAttempt && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('verify-email')}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enter Verification Code →</span>
                    </button>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label
                  htmlFor="auth-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Username Field (Registration Only) */}
              {authModalTab === 'register' && (
                <div className="space-y-1">
                  <label
                    htmlFor="auth-username"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="auth-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="booklover42"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Password
                  </label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('forgot-password')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
                      darkMode
                        ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist (Register Only) */}
              {authModalTab === 'register' && password.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/60 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-bold text-[10px] uppercase tracking-wider mb-1 text-indigo-500">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span className={hasMinLength ? 'text-emerald-500 font-semibold' : ''}>
                      {hasMinLength ? '✓' : '○'} 8-64 characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-500 font-semibold' : ''}>
                      {hasUpper ? '✓' : '○'} 1 uppercase
                    </span>
                    <span className={hasLower ? 'text-emerald-500 font-semibold' : ''}>
                      {hasLower ? '✓' : '○'} 1 lowercase
                    </span>
                    <span className={hasNumber ? 'text-emerald-500 font-semibold' : ''}>
                      {hasNumber ? '✓' : '○'} 1 number
                    </span>
                    <span className={`col-span-2 ${hasSpecial ? 'text-emerald-500 font-semibold' : ''}`}>
                      {hasSpecial ? '✓' : '○'} 1 special character (!@#$%^&*()_+-=)
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{authModalTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
