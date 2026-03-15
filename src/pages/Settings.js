import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { User, Bell, Shield, LogOut, ChevronRight, Check } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();
    const { userPreferences, savePreferences } = useData();
    const [activeTab, setActiveTab] = useState('account');

    const [prefs, setPrefs] = useState({
        emailAlerts: true,
        weeklyDigest: false,
        budgetWarnings: true,
        currency: 'INR'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userPreferences) {
            setPrefs(userPreferences);
        }
    }, [userPreferences]);

    const handleSavePrefs = async () => {
        setIsSaving(true);
        await savePreferences(prefs);
        setIsSaving(false);
        // Optional: Add a toast notification here later
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-text-secondary mt-1">Manage your account preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Navigation Sidebar for Settings */}
                <div className="md:col-span-1 space-y-2">
                    <button 
                        onClick={() => setActiveTab('account')}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            activeTab === 'account' 
                            ? 'bg-surface border-primary text-primary font-medium' 
                            : 'hover:bg-surface border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5" />
                            <span>Account</span>
                        </div>
                        {activeTab === 'account' && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            activeTab === 'notifications' 
                            ? 'bg-surface border-primary text-primary font-medium' 
                            : 'hover:bg-surface border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5" />
                            <span>Notifications</span>
                        </div>
                        {activeTab === 'notifications' && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            activeTab === 'security' 
                            ? 'bg-surface border-primary text-primary font-medium' 
                            : 'hover:bg-surface border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" />
                            <span>Security</span>
                        </div>
                        {activeTab === 'security' && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Main Settings Content */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* --- ACCOUNT TAB --- */}
                    {activeTab === 'account' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Profile Section */}
                            <div className="card space-y-6 mb-6">
                                <h2 className="text-xl font-bold border-b border-border pb-4">Profile Information</h2>
                                
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                                        <span className="text-3xl font-bold text-primary">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-text-primary">Logged in as</p>
                                        <p className="text-text-secondary">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="input bg-background/50 cursor-not-allowed" 
                                            value={user?.email || ''}
                                            disabled
                                        />
                                        <p className="text-xs text-text-secondary mt-1">Your email cannot be changed at this time.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="card space-y-6 mb-6">
                                <h2 className="text-xl font-bold border-b border-border pb-4">Preferences</h2>
                                
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h3 className="font-medium text-text-primary">Currency</h3>
                                        <p className="text-sm text-text-secondary">Used across all your budgets and expenses</p>
                                    </div>
                                    <select 
                                        className="input w-auto bg-surface" 
                                        value={prefs.currency}
                                        onChange={(e) => setPrefs({...prefs, currency: e.target.value})}
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h3 className="font-medium text-text-primary">Dark Mode</h3>
                                        <p className="text-sm text-text-secondary">Currently locked to dark theme.</p>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-border flex justify-end">
                                    <button 
                                        onClick={handleSavePrefs}
                                        disabled={isSaving}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="card border-danger/20 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-danger"></div>
                                <h2 className="text-xl font-bold text-danger border-b border-border pb-4">Danger Zone</h2>
                                
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                                    <div>
                                        <h3 className="font-medium text-text-primary">Sign Out</h3>
                                        <p className="text-sm text-text-secondary">Securely end your session.</p>
                                    </div>
                                    <button onClick={logout} className="btn-secondary text-text-primary hover:text-danger hover:border-danger transition-colors flex items-center gap-2 px-6 py-2">
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- NOTIFICATIONS TAB --- */}
                    {activeTab === 'notifications' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="card space-y-6">
                                <h2 className="text-xl font-bold border-b border-border pb-4">Notification Preferences</h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-text-primary">Email Alerts</h3>
                                            <p className="text-sm text-text-secondary mt-1">Receive notifications when major changes happen to your account or bills.</p>
                                        </div>
                                        <button 
                                            onClick={() => setPrefs({...prefs, emailAlerts: !prefs.emailAlerts})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.emailAlerts ? 'bg-primary' : 'bg-surface border border-border'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${prefs.emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-text-primary">Weekly Digest</h3>
                                            <p className="text-sm text-text-secondary mt-1">Get an email summary of your spending every Sunday.</p>
                                        </div>
                                        <button 
                                            onClick={() => setPrefs({...prefs, weeklyDigest: !prefs.weeklyDigest})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.weeklyDigest ? 'bg-primary' : 'bg-surface border border-border'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${prefs.weeklyDigest ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-text-primary">Budget Warnings</h3>
                                            <p className="text-sm text-text-secondary mt-1">Get notified when you exceed 90% of your weekly budget.</p>
                                        </div>
                                        <button 
                                            onClick={() => setPrefs({...prefs, budgetWarnings: !prefs.budgetWarnings})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.budgetWarnings ? 'bg-primary' : 'bg-surface border border-border'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${prefs.budgetWarnings ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="pt-6 mt-6 border-t border-border flex justify-end">
                                    <button 
                                        onClick={handleSavePrefs}
                                        disabled={isSaving}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}


                    {/* --- SECURITY TAB --- */}
                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="card space-y-6">
                                <h2 className="text-xl font-bold border-b border-border pb-4">Security Settings</h2>
                                
                                <div className="space-y-4">
                                    <h3 className="font-medium text-text-primary">Change Password</h3>
                                    <p className="text-sm text-text-secondary mb-4">You use Email/Password authentication for your account.</p>
                                    
                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                                            <input type="password" placeholder="••••••••" className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                                            <input type="password" placeholder="••••••••" className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                                            <input type="password" placeholder="••••••••" className="input" />
                                        </div>
                                        <button className="btn-primary w-full mt-2">Update Password</button>
                                    </div>
                                </div>
                             </div>

                             <div className="card space-y-6 mt-6">
                                <h2 className="text-xl font-bold border-b border-border pb-4">Active Sessions</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-primary/20">
                                        <div>
                                            <p className="font-medium text-text-primary flex items-center gap-2">
                                                Windows Desktop <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Current</span>
                                            </p>
                                            <p className="text-sm text-text-secondary mt-1">Chrome Browser • IP Address Hidden</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
