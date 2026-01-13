
"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import EditCustomerModal from '@/components/customers/EditCustomerModal';

interface Customer {
    customer_id: number;
    full_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    balance: number;
    created_at: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchCustomers();
    };

    const filteredCustomers = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="h3 mb-1">Customer Management</h1>
                    <p className="text-muted">Manage customer information and contacts</p>
                </div>
                <Link
                    href="/customers/add"
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
                    <Plus size={18} /> Add New Customer
                </Link>
            </div>

            {/* Content Card */}
            <div className="card">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        All Customers
                    </h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search customers..."
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
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Customer</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Contact</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Address</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Balance</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.95rem' }}>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading customers...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-muted">No customers found</td></tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.customer_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                width: '36px', height: '36px',
                                                borderRadius: '50%', background: 'var(--surface-hover)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--primary)', fontWeight: 'bold'
                                            }}>
                                                {customer.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{customer.full_name}</div>
                                                <div className="text-xs text-muted">ID: {customer.customer_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {customer.phone && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <Phone size={14} className="text-muted" />
                                                {customer.phone}
                                            </div>
                                        )}
                                        {customer.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-muted" />
                                                {customer.email}
                                            </div>
                                        )}
                                        {!customer.phone && !customer.email && (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {customer.address ? (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-muted" />
                                                {customer.address}
                                            </div>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: Number(customer.balance) > 0 ? 'var(--success)' : 'inherit'
                                        }}>
                                            ${Number(customer.balance).toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleEditCustomer(customer)}
                                            className="btn btn-icon btn-sm"
                                            title="Edit Customer"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <EditCustomerModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                customer={selectedCustomer}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
