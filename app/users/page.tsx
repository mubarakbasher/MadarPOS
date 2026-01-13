
"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Shield, Mail, Edit, Key } from 'lucide-react';
import Link from 'next/link';
import EditUserModal from '@/components/users/EditUserModal';
import ChangePasswordModal from '@/components/users/ChangePasswordModal';

interface User {
    user_id: number;
    full_name: string;
    email: string;
    role: {
        role_id: number;
        role_name: string;
    };
    status: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleChangePassword = (user: User) => {
        setSelectedUser(user);
        setShowPasswordModal(true);
    };

    const handleEditSuccess = () => {
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="h3 mb-1">User Management</h1>
                    <p className="text-muted">Manage system access and roles</p>
                </div>
                <Link
                    href="/users/add"
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
                    <Plus size={18} /> Add New User
                </Link>
            </div>

            {/* Content Card */}
            <div className="card">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        System Users
                    </h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--background)', color: 'var(--foreground-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>User</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Role</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Joined</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.95rem' }}>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-muted">No users found</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                width: '36px', height: '36px',
                                                borderRadius: '50%', background: 'var(--surface-hover)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--primary)', fontWeight: 'bold'
                                            }}>
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.full_name}</div>
                                                <div className="text-xs text-muted flex items-center gap-1">
                                                    <Mail size={10} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '2px 8px', borderRadius: '12px',
                                            background: user.role.role_name === 'Admin' ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface)',
                                            color: user.role.role_name === 'Admin' ? 'var(--primary)' : 'inherit',
                                            fontSize: '0.85rem', border: '1px solid var(--border)'
                                        }}>
                                            <Shield size={12} />
                                            {user.role.role_name}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: user.status === 'active' ? 'var(--success)' : 'var(--muted)',
                                            fontSize: '0.85rem', fontWeight: 500
                                        }}>
                                            {user.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="btn btn-icon btn-sm"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleChangePassword(user)}
                                                className="btn btn-icon btn-sm"
                                                title="Change Password"
                                            >
                                                <Key size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <EditUserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSuccess={handleEditSuccess}
            />

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                userId={selectedUser?.user_id || 0}
                userName={selectedUser?.full_name || ''}
            />
        </div>
    );
}
