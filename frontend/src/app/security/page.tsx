'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  KeyIcon,
  GlobeAltIcon,
  BellIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SecurityLog {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'suspicious' | '2fa_enabled' | 'device_new' | 'withdrawal' | 'failed_login';
  message: string;
  location: string;
  device: string;
  ip: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'danger';
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: Date;
  isCurrent: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  withdrawalNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number;
  passwordLastChanged: Date;
  securityQuestions: boolean;
}

const mockSecurityLogs: SecurityLog[] = [
  {
    id: '1',
    type: 'login',
    message: 'Successful login',
    location: 'New York, USA',
    device: 'Chrome on Windows',
    ip: '192.168.1.100',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'success'
  },
  {
    id: '2',
    type: 'withdrawal',
    message: 'Withdrawal request for $150.00',
    location: 'New York, USA',
    device: 'Chrome on Windows',
    ip: '192.168.1.100',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'warning'
  },
  {
    id: '3',
    type: 'failed_login',
    message: 'Failed login attempt',
    location: 'Unknown',
    device: 'Unknown Browser',
    ip: '185.220.101.45',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'danger'
  },
  {
    id: '4',
    type: '2fa_enabled',
    message: '2FA authentication enabled',
    location: 'New York, USA',
    device: 'Chrome on Windows',
    ip: '192.168.1.100',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success'
  }
];

const mockActiveSessions: ActiveSession[] = [
  {
    id: '1',
    device: 'Windows PC',
    browser: 'Chrome 119.0',
    location: 'New York, USA',
    ip: '192.168.1.100',
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    isCurrent: true
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    location: 'New York, USA',
    ip: '192.168.1.105',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isCurrent: false
  },
  {
    id: '3',
    device: 'MacBook Pro',
    browser: 'Firefox 118.0',
    location: 'California, USA',
    ip: '10.0.0.50',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isCurrent: false
  }
];

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'sessions' | 'logs'>('overview');
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    loginNotifications: true,
    withdrawalNotifications: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    securityQuestions: false
  });
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(mockSecurityLogs);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(mockActiveSessions);
  const [showQRCode, setShowQRCode] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 30;
    if (securitySettings.loginNotifications) score += 15;
    if (securitySettings.withdrawalNotifications) score += 15;
    if (securitySettings.suspiciousActivityAlerts) score += 10;
    if (securitySettings.securityQuestions) score += 20;
    if (Date.now() - securitySettings.passwordLastChanged.getTime() < 90 * 24 * 60 * 60 * 1000) score += 10;
    return score;
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-400 bg-green-500/20' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-400 bg-blue-500/20' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-400 bg-yellow-500/20' };
    return { level: 'Poor', color: 'text-red-400 bg-red-500/20' };
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserIcon className="w-4 h-4" />;
      case 'logout': return <UserIcon className="w-4 h-4" />;
      case 'password_change': return <KeyIcon className="w-4 h-4" />;
      case 'suspicious': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case '2fa_enabled': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'device_new': return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'withdrawal': return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'failed_login': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'danger': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const terminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const terminateAllSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.isCurrent));
  };

  const enable2FA = () => {
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
    setShow2FASetup(false);
    setTwoFactorCode('');
    
    // Add log entry
    const newLog: SecurityLog = {
      id: (securityLogs.length + 1).toString(),
      type: '2fa_enabled',
      message: '2FA authentication enabled',
      location: 'New York, USA',
      device: 'Chrome on Windows',
      ip: '192.168.1.100',
      timestamp: new Date(),
      status: 'success'
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const disable2FA = () => {
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Security Center
          </h1>
          <p className="text-gray-400">Protect your account with advanced security features</p>
        </motion.div>

        {/* Security Score */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gaming-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold">Security Score</h3>
                <p className="text-gray-400">Your account security rating</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{securityScore}/100</div>
              <span className={`px-3 py-1 rounded-full text-sm ${securityLevel.color}`}>
                {securityLevel.level}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className={`text-lg font-bold ${securitySettings.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {securitySettings.twoFactorEnabled ? '✓' : '✗'}
              </div>
              <div className="text-gray-400">2FA Enabled</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${securitySettings.loginNotifications ? 'text-green-400' : 'text-red-400'}`}>
                {securitySettings.loginNotifications ? '✓' : '✗'}
              </div>
              <div className="text-gray-400">Login Alerts</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${securitySettings.securityQuestions ? 'text-green-400' : 'text-red-400'}`}>
                {securitySettings.securityQuestions ? '✓' : '✗'}
              </div>
              <div className="text-gray-400">Security Questions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{activeSessions.length}</div>
              <div className="text-gray-400">Active Sessions</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8 overflow-x-auto"
        >
          <div className="gaming-card p-2 flex gap-2 min-w-max">
            {[
              { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
              { id: 'sessions', name: 'Sessions', icon: ComputerDesktopIcon },
              { id: 'logs', name: 'Activity Logs', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="gaming-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <LockClosedIcon className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold">Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <button className="gaming-button w-full text-left">
                      Change Password
                    </button>
                    <button 
                      onClick={() => setShow2FASetup(true)}
                      className="gaming-button w-full text-left"
                    >
                      {securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                    <button className="gaming-button w-full text-left">
                      Download Backup Codes
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="gaming-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ClockIcon className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {securityLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 text-sm">
                        <div className={`p-1.5 rounded ${getStatusColor(log.status)}`}>
                          {getLogIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{log.message}</p>
                          <p className="text-gray-400 text-xs">{log.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Recommendations */}
                <div className="gaming-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-bold">Recommendations</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {!securitySettings.securityQuestions && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 font-medium">Set up security questions</p>
                        <p className="text-gray-300">Add an extra layer of protection</p>
                      </div>
                    )}
                    {Date.now() - securitySettings.passwordLastChanged.getTime() > 90 * 24 * 60 * 60 * 1000 && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-400 font-medium">Update your password</p>
                        <p className="text-gray-300">Your password is over 90 days old</p>
                      </div>
                    )}
                    {activeSessions.length > 3 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 font-medium">Review active sessions</p>
                        <p className="text-gray-300">You have {activeSessions.length} active sessions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Authentication Settings */}
                <div className="gaming-card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                    Authentication
                  </h3>
                  
                  <div className="space-y-6">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">Add an extra layer of security</p>
                      </div>
                      <button
                        onClick={() => securitySettings.twoFactorEnabled ? disable2FA() : setShow2FASetup(true)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Security Questions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Security Questions</h4>
                        <p className="text-sm text-gray-400">Backup authentication method</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings(prev => ({ ...prev, securityQuestions: !prev.securityQuestions }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.securityQuestions ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.securityQuestions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Session Timeout */}
                    <div>
                      <label className="block font-medium mb-2">Session Timeout</label>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="gaming-input w-full"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="gaming-card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <BellIcon className="w-6 h-6 text-green-400" />
                    Notifications
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Login Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Login Notifications</h4>
                        <p className="text-sm text-gray-400">Get notified of new logins</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings(prev => ({ ...prev, loginNotifications: !prev.loginNotifications }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.loginNotifications ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Withdrawal Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Withdrawal Notifications</h4>
                        <p className="text-sm text-gray-400">Get notified of withdrawal requests</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings(prev => ({ ...prev, withdrawalNotifications: !prev.withdrawalNotifications }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.withdrawalNotifications ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.withdrawalNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Suspicious Activity Alerts */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Suspicious Activity Alerts</h4>
                        <p className="text-sm text-gray-400">Get notified of unusual activity</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings(prev => ({ ...prev, suspiciousActivityAlerts: !prev.suspiciousActivityAlerts }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.suspiciousActivityAlerts ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.suspiciousActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Active Sessions</h3>
                <button 
                  onClick={terminateAllSessions}
                  className="gaming-button bg-red-600 hover:bg-red-700"
                >
                  Terminate All Other Sessions
                </button>
              </div>

              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gaming-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <ComputerDesktopIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {session.device}
                            {session.isCurrent && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Current Session
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400">{session.browser}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <GlobeAltIcon className="w-4 h-4" />
                              {session.location}
                            </span>
                            <span>IP: {session.ip}</span>
                            <span>Last active: {session.lastActive.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="gaming-button bg-red-600 hover:bg-red-700 text-sm"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Security Activity Log</h3>
                <button className="gaming-button bg-blue-600 hover:bg-blue-700">
                  Export Logs
                </button>
              </div>

              <div className="space-y-4">
                {securityLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="gaming-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                          {getLogIcon(log.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{log.message}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>{log.device}</span>
                            <span>{log.location}</span>
                            <span>IP: {log.ip}</span>
                            <span>{log.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2FA Setup Modal */}
        <AnimatePresence>
          {show2FASetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShow2FASetup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="gaming-card p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Enable Two-Factor Authentication</h3>
                  <button
                    onClick={() => setShow2FASetup(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-black text-xs">QR Code Placeholder</div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter verification code
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="000000"
                      className="gaming-input w-full text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="gaming-button bg-gray-600 hover:bg-gray-700 flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={enable2FA}
                      disabled={twoFactorCode.length !== 6}
                      className="gaming-button bg-green-600 hover:bg-green-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 