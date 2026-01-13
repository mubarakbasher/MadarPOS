"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch: {
        branch_id: number;
        branch_name: string;
        location: string | null;
        phone: string | null;
    } | null;
    onSuccess: () => void;
}

export default function EditBranchModal({ isOpen, onClose, branch, onSuccess }: EditBranchModalProps) {
    const [branchName, setBranchName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (branch && isOpen) {
            setBranchName(branch.branch_name);
            setLocation(branch.location || '');
            setPhone(branch.phone || '');
        }
    }, [branch, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`/api/branches/${branch?.branch_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branch_name: branchName,
                    location: location || null,
                    phone: phone || null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update branch');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !branch) return null;

    return (
        <>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    color: #6b7280;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #f3f4f6;
                    color: #111827;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-footer {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                    border-radius: 0 0 12px 12px;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    transition: all 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .alert {
                    padding: 0.875rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }

                .alert-error {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
            `}</style>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title">Edit Branch</h2>
                        <button onClick={onClose} className="modal-close">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Branch Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location / Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Branch'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
