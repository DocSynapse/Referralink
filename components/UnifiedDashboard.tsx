/**
 * Unified Dashboard - For All Medical Professionals
 * Role-based tabs: Regular users get basic tabs, Admin gets extra tabs
 */

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Building2, Phone, Key, FileText,
  Users, TrendingUp, Activity, AlertCircle, UserCheck, UserPlus,
  Printer, Calendar, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { getUserRole, getSessionToken, logoutUser } from '../services/authService';
import { AdminPanelExtended } from './AdminPanelExtended';

type DashboardTab = 'profile' | 'referrals' | 'network' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  licenseType: string;
  licenseNumber: string;
  institutionName: string;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
  licenseVerified: boolean;
  onboardingCompleted: boolean;
  apiKey?: string;
}

export const UnifiedDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin' || userRole === 'admin_user';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const sessionToken = getSessionToken();

      if (!sessionToken) {
        return;
      }

      // TODO: Implement API call to get user profile
      // const response = await fetch('/api/user/profile', {
      //   headers: { 'Authorization': `Bearer ${sessionToken}` }
      // });

      // Mock profile for now
      setUserProfile({
        id: '1',
        email: localStorage.getItem('userEmail') || 'user@example.com',
        fullName: localStorage.getItem('userName') || 'Medical Professional',
        licenseType: 'doctor',
        licenseNumber: 'SIP.123456',
        institutionName: 'Hospital Name',
        phoneNumber: '08123456789',
        role: userRole || 'clinical_user',
        emailVerified: true,
        licenseVerified: true,
        onboardingCompleted: true,
        apiKey: 'sk_live_' + Math.random().toString(36).substring(2, 15)
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin_user':
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'clinical_user':
        return 'bg-blue-100 text-blue-700';
      case 'specialist_user':
        return 'bg-green-100 text-green-700';
      case 'nurse_user':
        return 'bg-pink-100 text-pink-700';
      case 'maternal_care_user':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin_user':
      case 'admin':
        return 'Administrator';
      case 'clinical_user':
        return 'Clinical User';
      case 'specialist_user':
        return 'Specialist';
      case 'nurse_user':
        return 'Nurse';
      case 'maternal_care_user':
        return 'Maternal Care';
      default:
        return 'User';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-oxford border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0E5EC]">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-black text-oxford uppercase tracking-wider">
                {userProfile?.fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getRoleBadgeColor(userProfile?.role || '')}`}>
                  {getRoleDisplayName(userProfile?.role || '')}
                </span>
                {isAdmin && (
                  <span className="px-2 py-1 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-700">
                    ⚡ ADMIN ACCESS
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:bg-white/70 transition-all border border-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 p-1.5 bg-[#D1D9E6] rounded-2xl mb-6 shadow-inner">
          <button
            onClick={() => setActiveTab('profile')}
            className={`
              flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
              transition-all duration-200
              ${activeTab === 'profile'
                ? 'bg-[#E0E5EC] text-oxford shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
              }
            `}
          >
            <User size={14} className="inline mr-1" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`
              flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
              transition-all duration-200
              ${activeTab === 'referrals'
                ? 'bg-[#E0E5EC] text-oxford shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
              }
            `}
          >
            <FileText size={14} className="inline mr-1" />
            Referrals
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`
              flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
              transition-all duration-200
              ${activeTab === 'network'
                ? 'bg-[#E0E5EC] text-oxford shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
              }
            `}
          >
            <Building2 size={14} className="inline mr-1" />
            Network
          </button>

          {/* Admin Tab - Only visible to admins */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`
                flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
                transition-all duration-200
                ${activeTab === 'admin'
                  ? 'bg-[#E0E5EC] text-purple-600 shadow-md scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
                }
              `}
            >
              <Shield size={14} className="inline mr-1" />
              Admin
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="neu-flat p-6 rounded-2xl">
                <h2 className="text-[14px] font-black text-oxford uppercase tracking-wider mb-6">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <User size={16} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-oxford">{userProfile?.fullName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <Mail size={16} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-oxford">{userProfile?.email}</span>
                      {userProfile?.emailVerified && (
                        <CheckCircle size={14} className="text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      License Number
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <Shield size={16} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-oxford">{userProfile?.licenseNumber}</span>
                      {userProfile?.licenseVerified && (
                        <CheckCircle size={14} className="text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Institution
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <Building2 size={16} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-oxford">{userProfile?.institutionName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-[14px] font-bold text-oxford">{userProfile?.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Role
                    </label>
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3">
                      <Activity size={16} className="text-slate-400" />
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getRoleBadgeColor(userProfile?.role || '')}`}>
                        {getRoleDisplayName(userProfile?.role || '')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Key Section */}
              <div className="neu-flat p-6 rounded-2xl">
                <h2 className="text-[14px] font-black text-oxford uppercase tracking-wider mb-4">
                  API Access
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-slate-600">Your API key for system integration</p>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] font-bold uppercase tracking-wider text-oxford hover:text-accent transition-colors"
                    >
                      {showApiKey ? 'Hide' : 'Show'} Key
                    </button>
                  </div>
                  {showApiKey && (
                    <div className="neu-pressed px-4 py-3 rounded-xl flex items-center gap-3 bg-slate-900">
                      <Key size={16} className="text-green-400" />
                      <code className="text-[12px] font-mono text-green-400 flex-1 select-all">
                        {userProfile?.apiKey}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="neu-flat p-8 rounded-2xl text-center">
              <FileText size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-[16px] font-black text-oxford uppercase tracking-wider mb-2">
                Referral System
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                Coming soon: Create and manage patient referrals
              </p>
              <div className="inline-block px-4 py-2 bg-slate-200 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Phase 2 - In Development
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="neu-flat p-8 rounded-2xl text-center">
              <Building2 size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-[16px] font-black text-oxford uppercase tracking-wider mb-2">
                Hospital Network
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                Coming soon: Find specialists and hospitals in your network
              </p>
              <div className="inline-block px-4 py-2 bg-slate-200 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Phase 2 - In Development
              </div>
            </div>
          )}

          {/* Admin Tab - Only visible to admins */}
          {activeTab === 'admin' && isAdmin && (
            <div className="h-[calc(100vh-280px)]">
              <AdminPanelExtended />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
