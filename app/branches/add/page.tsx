
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Phone, Building2 } from 'lucide-react';

export default function AddBranchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        branch_name: '',
        location: '',
        phone: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.branch_name) {
            setError('Branch name is required');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/branches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/branches');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create branch');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .header-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #6b7280;
                }

                .back-button:hover {
                    background: #f9fafb;
                    border-color: #d1d5db;
                    color: #111827;
                }

                .header-content {
                    flex: 1;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 0.25rem 0;
                }

                .page-subtitle {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                }

                .form-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .required-mark {
                    color: #ef4444;
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

                .alert-error {
                    padding: 0.875rem 1rem;
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                }

                .form-footer {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1.25rem;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-secondary {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-secondary:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .btn-primary {
                    background: #6366f1;
                    color: white;
                    border: 1px solid #6366f1;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #4f46e5;
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="page-container">
                <div className="header-section">
                    <button onClick={() => router.back()} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content">
                        <h1 className="page-title">Add New Branch</h1>
                        <p className="page-subtitle">Create a new location for inventory and sales tracking</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-card">
                    {error && (
                        <div className="alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Branch Name <span className="required-mark">*</span>
                        </label>
                        <div className="input-wrapper">
                            <Building2 size={18} className="input-icon" />
                            <input
                                type="text"
                                required
                                className="form-input"
                                placeholder="e.g. Downtown Store"
                                value={formData.branch_name}
                                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location / Address</label>
                        <div className="input-wrapper">
                            <MapPin size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 123 Main St, New York, NY"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. +1 234 567 890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-footer">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <Save size={18} /> Create Branch
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
