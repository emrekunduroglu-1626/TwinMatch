import React from 'react';

const mockSubscriptions = [
  { id: 's1', user: 'Ahmet K.', plan: 'Premium', price: '999 TL/ay', status: 'active', start: '2026-05-01', end: '2026-06-01' },
  { id: 's2', user: 'Ayşe Y.', plan: 'VIP', price: '499 TL/ay', status: 'active', start: '2026-04-15', end: '2026-07-15' },
  { id: 's3', user: 'Mehmet S.', plan: 'Freemium', price: '0 TL', status: 'active', start: '2026-06-01', end: '-' },
  { id: 's4', user: 'Zeynep A.', plan: 'VIP', price: '4.999 TL/yıl', status: 'active', start: '2026-01-10', end: '2027-01-10' },
  { id: 's5', user: 'Can D.', plan: 'Premium', price: '999 TL/ay', status: 'cancelled', start: '2026-03-01', end: '2026-06-01' },
];

const planColors: Record<string, string> = {
  Freemium: '#999999',
  VIP: '#FF6600',
  Premium: '#FFD700',
};

export default function SubscriptionsPage() {
  const totalRevenue = 999 + 499 + 0 + 4999 + 999;
  const distribution = { Freemium: 60, VIP: 25, Premium: 15 };

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 16 }}>Abonelikler</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 20, flex: 1 }}>
          <div style={{ color: '#999', fontSize: 14 }}>Aylık Toplam Gelir</div>
          <div style={{ color: '#33CC33', fontSize: 28, fontWeight: 'bold' }}>₺{totalRevenue.toLocaleString()}</div>
        </div>
        {Object.entries(distribution).map(([plan, pct]) => (
          <div key={plan} style={{ background: '#1A1A1A', borderRadius: 12, padding: 20, flex: 1 }}>
            <div style={{ color: '#999', fontSize: 14 }}>{plan}</div>
            <div style={{ color: planColors[plan], fontSize: 28, fontWeight: 'bold' }}>%{pct}</div>
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF6600' }}>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Kullanıcı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Plan</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Fiyat</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Durum</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Başlangıç</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Bitiş</th>
          </tr>
        </thead>
        <tbody>
          {mockSubscriptions.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 10, color: '#FFF' }}>{s.user}</td>
              <td style={{ padding: 10, color: planColors[s.plan] }}>{s.plan}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{s.price}</td>
              <td style={{ padding: 10, color: s.status === 'active' ? '#33CC33' : '#FF3333' }}>
                {s.status === 'active' ? 'Aktif' : 'İptal'}
              </td>
              <td style={{ padding: 10, color: '#999' }}>{s.start}</td>
              <td style={{ padding: 10, color: '#999' }}>{s.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
