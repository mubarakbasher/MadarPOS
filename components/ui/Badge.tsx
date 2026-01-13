
import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'neutral';
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
    const getColors = () => {
        switch (variant) {
            case 'success': return { bg: 'rgba(var(--success-hue), 90%, 90%, 0.2)', text: 'var(--success)' }; // simplified for now
            case 'warning': return { bg: '#FEF3C7', text: '#D97706' };
            case 'danger': return { bg: '#FEE2E2', text: '#DC2626' };
            default: return { bg: 'var(--surface-hover)', text: 'var(--text-muted)' };
        }
    }

    const styles = getColors();

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: styles.bg,
            color: styles.text,
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
}
