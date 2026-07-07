import React from 'react';

const initialVenues = [
  { id: 'v1', name: 'Nicole Restaurant', category: 'Restoran', district: 'Beşiktaş', rating: 4.6, safetyScore: 9, sponsored: true, safeDateSpot: true, active: true, discount: '%15 indirim', perk: 'Ücretsiz aperatif tabağı' },
  { id: 'v2', name: 'Mikla', category: 'Restoran', district: 'Beyoğlu', rating: 4.7, safetyScore: 8, sponsored: false, safeDateSpot: true, active: true, discount: '-', perk: '-' },
  { id: 'v3', name: 'Petra Roasting Co.', category: 'Kafe', district: 'Kadıköy', rating: 4.5, safetyScore: 8, sponsored: true, safeDateSpot: true, active: true, discount: '%10 indirim', perk: 'İkinci kahve hediye' },
  { id: 'v4', name: 'Karga Bar', category: 'Bar', district: 'Beyoğlu', rating: 4.2, safetyScore: 5, sponsored: false, safeDateSpot: false, active: true, discount: '-', perk: '-' },
  { id: 'v5', name: 'Cihangir Sahil Parkı', category: 'Park', district: 'Beyoğlu', rating: 4.4, safetyScore: 9, sponsored: false, safeDateSpot: true, active: true, discount: '-', perk: '-' },
  { id: 'v6', name: 'Zorlu PSM Sanat Merkezi', category: 'Kültür', district: 'Beşiktaş', rating: 4.8, safetyScore: 9, sponsored: true, safeDateSpot: true, active: true, discount: '%20 bilet indirimi', perk: 'Öncelikli rezervasyon' },
  { id: 'v7', name: 'Reina', category: 'Gece Kulübü', district: 'Beşiktaş', rating: 3.9, safetyScore: 3, sponsored: false, safeDateSpot: false, active: true, discount: '-', perk: '-' },
  { id: 'v8', name: 'Moda Sahili', category: 'Park', district: 'Kadıköy', rating: 4.5, safetyScore: 8, sponsored: false, safeDateSpot: true, active: true, discount: '-', perk: '-' },
  { id: 'v9', name: 'Kilyos Plaj Kulübü', category: 'Plaj', district: 'Sarıyer', rating: 4.1, safetyScore: 6, sponsored: true, safeDateSpot: false, active: true, discount: '%25 giriş indirimi', perk: 'Ücretsiz şezlong' },
  { id: 'v10', name: 'Emirgan Korusu', category: 'Park', district: 'Sarıyer', rating: 4.7, safetyScore: 9, sponsored: false, safeDateSpot: true, active: true, discount: '-', perk: '-' },
];

const categories = ['Tümü', 'Restoran', 'Kafe', 'Bar', 'Park', 'Kültür', 'Gece Kulübü', 'Plaj'];

function safetyColor(score: number) {
  if (score >= 7) return '#33CC33';
  if (score >= 4) return '#FFCC00';
  return '#FF3333';
}

export default function VenuesPage() {
  const [venues, setVenues] = React.useState(initialVenues);
  const [categoryFilter, setCategoryFilter] = React.useState('Tümü');
  const [sponsoredFilter, setSponsoredFilter] = React.useState('all');
  const [safeDateFilter, setSafeDateFilter] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingSponsor, setEditingSponsor] = React.useState<string | null>(null);
  const [sponsorDraft, setSponsorDraft] = React.useState({ discount: '', perk: '' });
  const [newVenue, setNewVenue] = React.useState({ name: '', category: 'Restoran', district: '' });

  const filtered = venues.filter(v => {
    if (categoryFilter !== 'Tümü' && v.category !== categoryFilter) return false;
    if (sponsoredFilter === 'sponsored' && !v.sponsored) return false;
    if (sponsoredFilter === 'not_sponsored' && v.sponsored) return false;
    if (safeDateFilter && !v.safeDateSpot) return false;
    return true;
  });

  const toggleActive = (id: string) => {
    setVenues(prev => prev.map(v => (v.id === id ? { ...v, active: !v.active } : v)));
  };

  const startEditSponsor = (v: typeof initialVenues[0]) => {
    setEditingSponsor(v.id);
    setSponsorDraft({ discount: v.discount === '-' ? '' : v.discount, perk: v.perk === '-' ? '' : v.perk });
  };

  const saveSponsor = (id: string) => {
    setVenues(prev => prev.map(v => (v.id === id
      ? { ...v, sponsored: true, discount: sponsorDraft.discount || '-', perk: sponsorDraft.perk || '-' }
      : v)));
    setEditingSponsor(null);
  };

  const handleAddVenue = () => {
    if (!newVenue.name.trim()) return;
    setVenues(prev => [
      ...prev,
      {
        id: `v${prev.length + 1}`,
        name: newVenue.name,
        category: newVenue.category,
        district: newVenue.district,
        rating: 0,
        safetyScore: 5,
        sponsored: false,
        safeDateSpot: false,
        active: true,
        discount: '-',
        perk: '-',
      },
    ]);
    setNewVenue({ name: '', category: 'Restoran', district: '' });
    setShowAddForm(false);
  };

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 16 }}>Mekanlar</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', background: '#1A1A1A', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sponsoredFilter}
          onChange={e => setSponsoredFilter(e.target.value)}
          style={{ padding: '8px 12px', background: '#1A1A1A', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
        >
          <option value="all">Tümü (Sponsorlu/Değil)</option>
          <option value="sponsored">Sadece Sponsorlu</option>
          <option value="not_sponsored">Sadece Sponsorsuz</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFF', fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={safeDateFilter}
            onChange={e => setSafeDateFilter(e.target.checked)}
          />
          Sadece Safe Date Spot
        </label>

        <button
          onClick={() => setShowAddForm(v => !v)}
          style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto' }}
        >
          + Mekan Ekle
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: '#FF6600', marginTop: 0, marginBottom: 16 }}>Yeni Mekan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <input
              placeholder="Mekan Adı"
              value={newVenue.name}
              onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
            <select
              value={newVenue.category}
              onChange={e => setNewVenue({ ...newVenue, category: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            >
              {categories.filter(c => c !== 'Tümü').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="İlçe"
              value={newVenue.district}
              onChange={e => setNewVenue({ ...newVenue, district: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleAddVenue}
              style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Kaydet
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ padding: '10px 20px', background: '#333', color: '#FFF', border: '1px solid #666', borderRadius: 8, cursor: 'pointer' }}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF6600' }}>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Mekan Adı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Kategori</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>İlçe</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Google Puanı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Güvenlik Skoru</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Sponsorlu</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(v => (
            <React.Fragment key={v.id}>
              <tr style={{ borderBottom: editingSponsor === v.id ? 'none' : '1px solid #333' }}>
                <td style={{ padding: 10, color: '#FFF' }}>
                  {v.name}
                  {v.safeDateSpot && (
                    <span title="Safe Date Spot" style={{ color: '#33CC33', marginLeft: 8, fontSize: 12 }}>🛡️</span>
                  )}
                </td>
                <td style={{ padding: 10, color: '#999' }}>{v.category}</td>
                <td style={{ padding: 10, color: '#999' }}>{v.district}</td>
                <td style={{ padding: 10, color: '#FFD700' }}>★ {v.rating.toFixed(1)}</td>
                <td style={{ padding: 10 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: 12, color: '#000', fontWeight: 'bold',
                    background: safetyColor(v.safetyScore),
                  }}>
                    {v.safetyScore}/10
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  {v.sponsored ? (
                    <button
                      onClick={() => startEditSponsor(v)}
                      style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer', border: 'none', color: '#FFF', background: '#FF6600' }}
                    >
                      Sponsorlu — Düzenle
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditSponsor(v)}
                      style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer', border: '1px solid #666', color: '#999', background: 'transparent' }}
                    >
                      Sponsor Yap
                    </button>
                  )}
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => toggleActive(v.id)}
                    style={{
                      padding: '4px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer',
                      border: 'none', color: '#FFF',
                      background: v.active ? '#33CC33' : '#666',
                    }}
                  >
                    {v.active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
              </tr>
              {editingSponsor === v.id && (
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td colSpan={7} style={{ padding: 16, background: '#1A1A1A' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        placeholder="İndirim (örn. %15 indirim)"
                        value={sponsorDraft.discount}
                        onChange={e => setSponsorDraft({ ...sponsorDraft, discount: e.target.value })}
                        style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6, flex: 1 }}
                      />
                      <input
                        placeholder="Avantaj (örn. Ücretsiz aperatif)"
                        value={sponsorDraft.perk}
                        onChange={e => setSponsorDraft({ ...sponsorDraft, perk: e.target.value })}
                        style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6, flex: 1 }}
                      />
                      <button
                        onClick={() => saveSponsor(v.id)}
                        style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingSponsor(null)}
                        style={{ padding: '10px 20px', background: '#333', color: '#FFF', border: '1px solid #666', borderRadius: 8, cursor: 'pointer' }}
                      >
                        İptal
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
