
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";
import { Plus, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";

export default function ProductsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Products" />

            <div style={{ padding: '0 2rem 2rem 2rem' }}>

                {/* Action Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2" style={{
                            background: 'var(--surface)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                        }}>
                            <Filter size={18} className="text-muted" />
                            <span className="text-sm font-medium">Filter</span>
                        </div>
                        {/* Categories Pills */}
                        <div className="flex gap-2">
                            {['All', 'Electronics', 'Clothing', 'Groceries'].map((cat, i) => (
                                <button key={cat} style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: i === 0 ? 'var(--primary)' : 'transparent',
                                    color: i === 0 ? '#fff' : 'var(--text-muted)',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>

                {/* Products Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Product Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Price</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Wireless Headphones', cat: 'Electronics', price: '$129.00', stock: 45, status: 'success' },
                                { name: 'Cotton T-Shirt', cat: 'Clothing', price: '$24.50', stock: 120, status: 'success' },
                                { name: 'Smart Watch Gen 5', cat: 'Electronics', price: '$299.00', stock: 8, status: 'warning' },
                                { name: 'Organic Coffee Beans', cat: 'Groceries', price: '$18.00', stock: 0, status: 'danger' },
                                { name: 'Leather Wallet', cat: 'Accessories', price: '$45.00', stock: 22, status: 'success' },
                            ].map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: '32px', height: '32px', background: 'var(--surface-hover)', borderRadius: '6px' }}></div>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.cat}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item.price}</td>
                                    <td style={{ padding: '1rem' }}>{item.stock} units</td>
                                    <td style={{ padding: '1rem' }}>
                                        <Badge variant={item.status as any}>{item.stock === 0 ? 'Out of Stock' : item.stock < 10 ? 'Low Stock' : 'In Stock'}</Badge>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex gap-2">
                                            <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                                            <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Mock */}
                    <div className="flex justify-between items-center p-4" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                        <span className="text-sm text-muted">Showing 1-5 of 48 items</span>
                        <div className="flex gap-2">
                            <button className="btn btn-ghost" disabled style={{ opacity: 0.5 }}>Previous</button>
                            <button className="btn btn-ghost">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
