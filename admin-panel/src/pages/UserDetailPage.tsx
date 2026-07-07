import React from 'react';

const mockUser = {
  id: 'u1',
  name: 'Ahmet Kaya',
  email: 'ahmet@example.com',
  phone: '+90 532 XXX XX XX',
  gender: 'Erkek',
  age: 28,
  city: 'İstanbul',
  plan: 'Premium',
  verified: true,
  joinDate: '2026-03-15',
  lastActive: '2026-06-20',
  matchCount: 12,
  twinScore: 87,
  photos: 4,
  reports: 0,
};

const mockActivity = [
  { date: '2026-06-20', action: 'Eşleme tamamlandı', detail: 'Ayşe Y. ile Aşama 3 tamamlandı' },
  { date: '2026-06-19', action: 'Sohbet başlatıldı', detail: 'AI-to-AI sohbet #142' },
  { date: '2026-06-18', action: 'Profil güncellendi', detail: 'Yeni fotoğraf eklendi' },
  { date: '2026-06-15', action: 'Premium satın alındı', detail: '999 TL/ay — İyzico' },
];

export default function UserDetailPage() {
  // In real app, get user ID from URL params
  const user = mockUser;

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 24 }}>Kullanıcı Detayı</h2>

      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {/* Profile Card */}
        <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 24, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#FF6600',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFF', fontSize: 24, fontWeight: 'bold'
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ color: '#999', fontSize: 14 }}>{user.email}</div>
            </div>
            {user.verified && (
              <span style={{ background: '#33CC33', color: '#FFF', padding: '4px 10px', borderRadius: 12, fontSize: 12, marginLeft: 'auto' }}>
                ✓ Doğrulanmış
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Telefon', user.phone],
              ['Cinsiyet', user.gender],
              ['Yaş', user.age],
              ['Şehir', user.city],
              ['Plan', user.plan],
              ['Kayıt', user.joinDate],
              ['Son Aktiflik', user.lastActive],
              ['Fotoğraf', user.photos],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div style={{ color: '#666', fontSize: 12 }}>{label}</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 200 }}>
          {[
            ['Eşlemeler', user.matchCount, '#FF6600'],
            ['İkiz Skoru', `%${user.twinScore}`, '#33CC33'],
            ['Raporlar', user.reports, user.reports > 0 ? '#FF3333' : '#999'],
          ].map(([label, value, color]) => (
            <div key={String(label)} style={{ background: '#1A1A1A', borderRadius: 12, padding: 20 }}>
              <div style={{ color: '#999', fontSize: 12 }}>{label}</div>
              <div style={{ color: String(color), fontSize: 28, fontWeight: 'bold' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <h3 style={{ color: '#FF6600', marginBottom: 12 }}>Son Aktiviteler</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF6600' }}>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tarih</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>İşlem</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Detay</th>
          </tr>
        </thead>
        <tbody>
          {mockActivity.map((a, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 10, color: '#999' }}>{a.date}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{a.action}</td>
              <td style={{ padding: 10, color: '#999' }}>{a.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Kullanıcıyı Askıya Al
        </button>
        <button style={{ padding: '10px 20px', background: '#333', color: '#FFF', border: '1px solid #666', borderRadius: 8, cursor: 'pointer' }}>
          Mesaj Gönder
        </button>
      </div>
    </div>
  );
}
