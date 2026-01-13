"use client";

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, MapPin, Phone, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EditBranchModal from '@/components/branches/EditBranchModal';

interface Branch {
    branch_id: number;
    branch_name: string;
    location: string | null;
    phone: string | null;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await fetch('/api/branches');
            if (res.ok) {
                const data = await res.json();
                setBranches(data);
            }
        } catch (error) {
            console.error('Failed to fetch branches', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this branch?')) return;

        try {
            const res = await fetch(`/api/branches/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchBranches();
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Failed to delete branch');
            }
        } catch (error) {
            console.error('Failed to delete branch', error);
        }
    };

    const handleEditBranch = (branch: Branch) => {
        setSelectedBranch(branch);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchBranches();
    };

    const filteredBranches = branches.filter(branch =>
        branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (branch.location && branch.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="h3 mb-1">Branch Management</h1>
                    <p className="text-muted">Manage store locations and outlets</p>
                </div>
                <Link
                    href="/branches/add"
                    className="btn btn-primary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.9375rem',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} /> Add New Branch
                </Link>
            </div>

            {/* Content Card */}
            <div className="card">
                <div className="p-4 border-b flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Package size={20} className="text-primary" />
                        All Branches
                    </h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem'
                            }}
                            className="input"
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--background)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Branch Name</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Location</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Phone</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.95rem' }}>
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center" style={{ padding: '2rem' }}>Loading branches...</td></tr>
                            ) : filteredBranches.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-muted" style={{ padding: '2rem' }}>No branches found</td></tr>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <tr key={branch.branch_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="font-bold">{branch.branch_name}</div>
                                            <div className="text-xs text-muted">ID: {branch.branch_id}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-muted" />
                                                {branch.location || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-muted" />
                                                {branch.phone || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditBranch(branch)}
                                                    className="btn btn-icon btn-sm"
                                                    title="Edit Branch"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="text-muted hover:text-danger p-1 transition-colors"
                                                    onClick={() => handleDelete(branch.branch_id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <EditBranchModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                branch={selectedBranch}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
