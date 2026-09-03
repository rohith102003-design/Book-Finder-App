import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    loginWithGoogle,
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleRendered, setIsGoogleRendered] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unverifiedLoginAttempt, setUnverifiedLoginAttempt] = useState<boolean>(false);

  // Reference for official Google Sign-In button container
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Forgot password sub-step: 'request' | 'reset' | 'completed'
  const [forgotStep, setForgotStep] = useState<'request' | 'reset' | 'completed'>('request');

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  // Google OAuth credential callback (strictly receives Google ID token JWT)
  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        setErrorMessage('Google authentication failed. No credential received.');
        setIsGoogleLoading(false);
        return;
      }

      setIsGoogleLoading(true);
      setErrorMessage(null);
      try {
        await loginWithGoogle(response.credential, googleClientId);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMessage(
            err.response?.data?.error?.message ||
              err.response?.data?.detail ||
              'Google authentication failed. Please try again.'
          );
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Google authentication failed. Please try again.');
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [googleClientId, loginWithGoogle]
  );

  // Initialize Google Identity Services SDK & Render Button
  useEffect(() => {
    if (!isAuthModalOpen || (authModalTab !== 'login' && authModalTab !== 'register')) {
      setIsGoogleRendered(false);
      return;
    }

    const initGoogle = () => {
      if (googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          cancel_on_tap_outside: true,
          auto_select: false,
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: darkMode ? 'filled_black' : 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            width: 320,
            logo_alignment: 'left',
          });
          setIsGoogleRendered(true);
        }
      }
    };

    // Dynamically load Google Identity Services script if not already on page
    const existingScript = document.getElementById('google-jssdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogle();
      };
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [isAuthModalOpen, authModalTab, googleClientId, darkMode, handleGoogleCredentialResponse]);

  // Handle "Continue with Google" fallback click
  const handleGoogleSignInClick = () => {
    setErrorMessage(null);

    if (!googleClientId) {
      setErrorMessage(
        'Google Sign-In is not configured yet. Please set REACT_APP_GOOGLE_CLIENT_ID in your environment.'
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      setErrorMessage('Google Sign-In service is initializing. Please try again in a moment.');
      return;
    }

    setIsGoogleLoading(true);

    try {
      // Programmatically trigger rendered button if available
      const renderedBtn = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
      if (renderedBtn) {
        renderedBtn.click();
        setIsGoogleLoading(false);
      } else {
        window.google.accounts.id.prompt((notification) => {
          setIsGoogleLoading(false);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setErrorMessage('Google popup was suppressed by browser. Please enable popups or use email sign-in.');
          }
        });
      }
    } catch {
      setIsGoogleLoading(false);
      setErrorMessage('Google authentication could not be opened. Please try again.');
    }
  };

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
      setIsGoogleLoading(false);
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

  // Gmail domain check
  const isValidGmail = (addr: string) => {
    const clean = addr.trim().toLowerCase();
    return clean.endsWith('@gmail.com') || clean.endsWith('@googlemail.com');
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

    // Validate Gmail domain requirement
    if (!isValidGmail(trimmedEmail)) {
      setErrorMessage('Please use a Gmail address (@gmail.com) to create an account or sign in.');
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
        await register(trimmedEmail, username.trim(), password);
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
        setErrorMessage('Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend Verification Code
  const handleResendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address to resend code.');
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
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Step 1: Request Password Reset Token
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      setSuccessMessage(res.message);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setForgotStep('reset');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Failed to request password reset.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit New Password with Token
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedToken = resetToken.trim();

    if (!trimmedToken) {
      setErrorMessage('Please enter or paste your reset token/code.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('New password does not meet the requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(trimmedEmail, trimmedToken, newPassword);
      setForgotStep('completed');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error?.message ||
            err.response?.data?.detail ||
            'Failed to reset password. The token may be invalid or expired.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          className={`relative w-full max-w-md my-8 rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            darkMode
              ? 'bg-gray-900/95 border-gray-800 text-white shadow-indigo-950/40'
              : 'bg-white/95 border-slate-100 text-slate-900 shadow-xl'
          } backdrop-blur-md z-10`}
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            aria-label="Close modal"
            className={`absolute top-5 right-5 p-2 rounded-full transition-all cursor-pointer ${
              darkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {authModalTab === 'forgot-password'
                ? 'Account Recovery'
                : authModalTab === 'verify-email'
                ? 'Verify Email Address'
                : authModalTab === 'login'
                ? 'Welcome Back'
                : 'Create Account'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {authModalTab === 'forgot-password'
                ? 'Reset your password to regain access'
                : authModalTab === 'verify-email'
                ? 'Enter the 6-digit code to activate your account'
                : authModalTab === 'login'
                ? 'Sign in to access your personal bookshelf & progress'
                : 'Join BiblioTrack with your Gmail account'}
            </p>
          </div>

          {/* Tab Switcher (Login / Register) */}
          {(authModalTab === 'login' || authModalTab === 'register') && (
            <div className="flex rounded-2xl p-1 mb-5 bg-slate-100 dark:bg-gray-800/60 border border-slate-200/50 dark:border-gray-700/40">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  authModalTab === 'login'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  authModalTab === 'register'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Global Alert Messages */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TAB: EMAIL VERIFICATION VIEW                             */}
          {/* ======================================================== */}
          {authModalTab === 'verify-email' ? (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Activation Code Required</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-600/90 dark:text-indigo-300/80">
                  Please enter the 6-digit verification code dispatched to{' '}
                  <strong className="font-bold text-indigo-800 dark:text-indigo-200">{email || 'your email'}</strong>.
                </p>
              </div>

              {/* Email (Readonly or Editable) */}
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
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="verify-code-input"
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-mono tracking-widest font-bold border focus:outline-none focus:ring-2 transition-all text-center ${
                      darkMode
                        ? 'bg-gray-800/80 border-gray-700 text-indigo-400 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-600'
                        : 'bg-slate-50 border-slate-200 text-indigo-600 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length < 4}
                className="w-full mt-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activate Account & Sign In</span>
                  </>
                )}
              </button>

              {/* Resend Code Action */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <button
                  type="button"
                  disabled={isResending || resendCooldown > 0}
                  onClick={handleResendCode}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : authModalTab === 'forgot-password' ? (
            /* ======================================================== */
            /* TAB: FORGOT PASSWORD FLOW                                */
            /* ======================================================== */
            <div className="space-y-4">
              {forgotStep === 'completed' ? (
                /* Step 3: Completed */
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold">Password Reset Complete!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your password has been updated. You can now log in with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full mt-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              ) : forgotStep === 'request' ? (
                /* Step 1: Request Email */
                <form onSubmit={handleForgotPasswordRequest} className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="forgot-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Registered Gmail Address
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
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Request Password Reset</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Reset Password Form */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-xs flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Resetting:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="reset-token"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Reset Token / Code
                    </label>
                    <input
                      id="reset-token"
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste reset token here"
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                          ? 'bg-gray-800/80 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-gray-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder-slate-400'
                      }`}
                    />
                  </div>

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
                        <ShieldCheck className="w-4 h-4" />
                        <span>Set New Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* TAB: NORMAL LOGIN & REGISTRATION FLOW                    */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Option 2: Google Sign-In Button */}
              <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
                <div
                  ref={googleButtonRef}
                  className={`w-full flex justify-center ${isGoogleRendered ? 'block' : 'hidden'}`}
                />
                {!isGoogleRendered && (
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isGoogleLoading || isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-2xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] ${
                      darkMode
                        ? 'bg-gray-800 hover:bg-gray-750 border-gray-700 text-white hover:border-gray-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="grow border-t border-slate-200 dark:border-gray-800" />
                <span className="shrink-0 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  or with email
                </span>
                <div className="grow border-t border-slate-200 dark:border-gray-800" />
              </div>

              {/* Option 1: Normal Gmail & Password Form */}
              <form onSubmit={handleStandardSubmit} className="space-y-3.5">
                {/* Unverified prompt if mandatory verification is re-enabled */}
                {unverifiedLoginAttempt && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs space-y-2">
                    <p className="font-medium">This account requires email verification.</p>
                    <button
                      type="button"
                      onClick={() => openAuthModal('verify-email')}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enter Verification Code →</span>
                    </button>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="auth-email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Gmail Address
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
                  disabled={isSubmitting || isGoogleLoading}
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
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
