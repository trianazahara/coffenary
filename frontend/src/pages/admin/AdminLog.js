import React from 'react';
import { History } from 'lucide-react';

const AdminLog = () => {
    const styles = {
        container: { textAlign: 'center', paddingTop: '4rem' },
        icon: { width: '4rem', height: '4rem', margin: '0 auto', color: '#9ca3af' },
        title: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '1rem' },
        subtitle: { color: '#6b7280', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto' },
    };

    return (
        <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' }}>Log Aktivitas</h1>
            <div style={styles.container}>
                <History style={styles.icon} />
                <h2 style={styles.title}>Fitur Belum Tersedia</h2>
                <p style={styles.subtitle}>
                    Halaman ini akan menampilkan riwayat aktivitas penting yang terjadi di sistem.
                    Untuk mengaktifkannya, diperlukan tabel `log_aktivitas` di database.
                </p>
            </div>
        </div>
    );
};

export default AdminLog;