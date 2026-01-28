/**
 * Upgraded AuthPanel - Medical Professional Registration & Login
 * Integrates with backend API /api/auth/*
 */

import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Building2, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { registerUser, loginUser, simpleAdminLogin } from '../services/authService';
import type { RegistrationInput } from '../api/types/registration';

type AuthMode = 'login' | 'register' | 'simple-admin';
type LicenseType = 'doctor' | 'specialist' | 'nurse' | 'midwife' | 'admin';

interface AuthPanelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration state
  const [registerData, setRegisterData] = useState<RegistrationInput>({
    email: '',
    fullName: '',
    licenseType: 'doctor',
    licenseNumber: '',
    institutionName: '',
    phoneNumber: '',
    password: ''
  });

  // Simple admin state (backward compatibility)
  const [simpleAdminData, setSimpleAdminData] = useState({
    username: 'doc',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginUser(loginData.email, loginData.password);

      if (result.success) {
        setSuccess('Login berhasil! Redirecting...');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result.error?.message || 'Login gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await registerUser(registerData);

      if (result.success) {
        setSuccess(
          'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.'
        );
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
        }, 3000);
      } else {
        if (result.error?.details) {
          // Show first validation error
          const firstError = result.error.details[0];
          setError(firstError.message);
        } else {
          setError(result.error?.message || 'Registrasi gagal');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpleAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const isValid = simpleAdminLogin(
        simpleAdminData.username,
        simpleAdminData.password
      );

      if (isValid) {
        setSuccess('Admin login berhasil!');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setError('Kredensial admin salah');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-[400px] bg-white/50 shadow-lg rounded-2xl border border-slate-200/40 p-5 backdrop-blur-md z-30 animate-auth-pop">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-black text-oxford uppercase tracking-[0.2em] font-display">
          {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Admin Access'}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-oxford transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === 'login'
              ? 'bg-white text-oxford shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === 'register'
              ? 'bg-white text-oxford shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => setMode('simple-admin')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === 'simple-admin'
              ? 'bg-white text-oxford shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Admin
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Mail size={14} className="text-slate-400" />
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="dr.john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Lock size={14} className="text-slate-400" />
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-oxford text-white py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-oxford/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      )}

      {/* Registration Form */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Full Name
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <User size={14} className="text-slate-400" />
              <input
                type="text"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="Dr. John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Mail size={14} className="text-slate-400" />
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="dr.john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              License Type
            </label>
            <select
              value={registerData.licenseType}
              onChange={(e) => setRegisterData({ ...registerData, licenseType: e.target.value as LicenseType })}
              className="w-full bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 text-[13px] outline-none"
              required
            >
              <option value="doctor">Doctor (SIP)</option>
              <option value="specialist">Specialist (SIPA)</option>
              <option value="nurse">Nurse (SIPP)</option>
              <option value="midwife">Midwife (SIPB)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              License Number
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <FileText size={14} className="text-slate-400" />
              <input
                type="text"
                value={registerData.licenseNumber}
                onChange={(e) => setRegisterData({ ...registerData, licenseNumber: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="SIP.123456"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Format: SIP.xxx (Doctor), SIPA.xxx (Specialist), SIPP.xxx (Nurse), SIPB.xxx (Midwife)
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Institution/Hospital
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Building2 size={14} className="text-slate-400" />
              <input
                type="text"
                value={registerData.institutionName}
                onChange={(e) => setRegisterData({ ...registerData, institutionName: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="RSUD Jakarta"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Phone Number
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Phone size={14} className="text-slate-400" />
              <input
                type="tel"
                value={registerData.phoneNumber}
                onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="08123456789"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Lock size={14} className="text-slate-400" />
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="Min 12 chars, uppercase, number, special"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Min 12 characters, uppercase, lowercase, number, special character
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-oxford text-white py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-oxford/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      )}

      {/* Simple Admin Form (Backward Compatibility) */}
      {mode === 'simple-admin' && (
        <form onSubmit={handleSimpleAdmin} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Username
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <User size={14} className="text-slate-400" />
              <input
                type="text"
                value={simpleAdminData.username}
                onChange={(e) => setSimpleAdminData({ ...simpleAdminData, username: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="doc"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <Lock size={14} className="text-slate-400" />
              <input
                type="password"
                value={simpleAdminData.password}
                onChange={(e) => setSimpleAdminData({ ...simpleAdminData, password: e.target.value })}
                className="flex-1 bg-transparent text-[13px] outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              'Admin Login'
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            Legacy admin access for existing system
          </p>
        </form>
      )}
    </div>
  );
};
