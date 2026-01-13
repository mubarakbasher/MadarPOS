
"use client";

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building2, DollarSign, Percent } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        systemName: '',
        currency: 'USD',
        taxRate: 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    systemName: data.system_name || '',
                    currency: data.currency || 'USD',
                    taxRate: data.tax_rate || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update settings');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 0.5rem 0;
                }

                .page-subtitle {
                    font-size: 0.9375rem;
                    color: #6b7280;
                    margin: 0;
                }

                .settings-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .card-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f9fafb;
                }

                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .card-body {
                    padding: 2rem;
                }

                .form-group {
                    margin-bottom: 1.75rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .form-description {
                    display: block;
                    font-size: 0.8125rem;
                    color: #6b7280;
                    margin-top: 0.375rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                }

                .form-input {
                    width: 100%;
                    padding: 0.625rem 0.875rem 0.625rem 2.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    transition: all 0.2s;
                    background: white;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .form-select {
                    width: 100%;
                    padding: 0.625rem 0.875rem 0.625rem 2.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    transition: all 0.2s;
                    background: white;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                }

                .form-select:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .alert {
                    padding: 0.875rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                }

                .alert-success {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }

                .alert-error {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }

                .form-footer {
                    display: flex;
                    justify-content: flex-end;
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                }

                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1.5rem;
                    background: #6366f1;
                    color: white;
                    border: 1px solid #6366f1;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #4f46e5;
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .loading-container {
                    padding: 3rem;
                    text-align: center;
                    color: #6b7280;
                }
            `}</style>

            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">System Settings</h1>
                    <p className="page-subtitle">Configure your system preferences and business information</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        Loading settings...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="settings-card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <SettingsIcon size={20} />
                                    General Settings
                                </h2>
                            </div>

                            <div className="card-body">
                                {message.text && (
                                    <div className={`alert alert-${message.type}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">System Name</label>
                                    <div className="input-wrapper">
                                        <Building2 size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.systemName}
                                            onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                                            placeholder="e.g. MADAR POS"
                                            required
                                        />
                                    </div>
                                    <small className="form-description">
                                        This name will appear on receipts and throughout the system
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Currency</label>
                                    <div className="input-wrapper">
                                        <DollarSign size={18} className="input-icon" />
                                        <select
                                            className="form-select"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="SAR">SAR (﷼)</option>
                                            <option value="AED">AED (د.إ)</option>
                                            <option value="EGP">EGP (£)</option>
                                            <option value="SDN">SDN (ج.س)</option>
                                        </select>
                                    </div>
                                    <small className="form-description">
                                        Select the default currency for transactions
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tax Rate (%)</label>
                                    <div className="input-wrapper">
                                        <Percent size={18} className="input-icon" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <small className="form-description">
                                        Default tax rate applied to sales (e.g., 15 for 15%)
                                    </small>
                                </div>
                            </div>

                            <div className="form-footer">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save size={18} /> Save Settings
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
