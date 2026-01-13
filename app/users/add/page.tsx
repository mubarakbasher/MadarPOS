
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Shield, Save, ArrowLeft } from 'lucide-react';

export default function AddUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        roleId: '4' // Default to Staff (4 from seed)
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create user');
            }

            // Success
            router.push('/users');
            router.refresh();

        } catch (error: any) {
            alert(error.message);
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

                .form-hint {
                    display: block;
                    font-size: 0.8125rem;
                    color: #6b7280;
                    margin-top: 0.375rem;
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
                        <h1 className="page-title">Add New User</h1>
                        <p className="page-subtitle">Create a staff account</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-card">
                    {/* Full Name */}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                name="fullName"
                                required
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="form-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                            />
                        </div>
                        <small className="form-hint">Minimum 6 characters</small>
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <div className="input-wrapper">
                            <Shield size={18} className="input-icon" />
                            <select
                                name="roleId"
                                className="form-input"
                                value={formData.roleId}
                                onChange={handleChange}
                            >
                                <option value="1">Admin</option>
                                <option value="2">Manager</option>
                                <option value="3">Cashier</option>
                                <option value="4">Staff</option>
                            </select>
                        </div>
                        <small className="form-hint">
                            Admins have full access. Managers can manage inventory. Staff/Cashiers are limited to POS.
                        </small>
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
                                    <Save size={18} /> Create User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
