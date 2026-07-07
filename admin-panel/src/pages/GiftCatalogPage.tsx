import React from 'react';

const FORBIDDEN_CATEGORIES = ['Alkol'];

const initialCatalog = [
  { id: 'g1', name: 'Kırmızı Gül Buketi (12 adet)', category: 'Çiçek', productPrice: 350, serviceFee: 50, supplier: 'Çiçek Sepeti', tier: 'Freemium', active: true },
  { id: 'g2', name: 'El Yapımı Çikolata Kutusu', category: 'Çikolata', productPrice: 450, serviceFee: 60, supplier: 'Godiva', tier: 'Freemium', active: true },
  { id: 'g3', name: 'Gümüş Kalp Kolye', category: 'Takı', productPrice: 1200, serviceFee: 150, supplier: 'Atasay', tier: 'VIP', active: true },
  { id: 'g4', name: 'Chanel No.5 Parfüm 50ml', category: 'Parfüm', productPrice: 3800, serviceFee: 300, supplier: 'Gratis', tier: 'Premium', active: true },
  { id: 'g5', name: 'Teddy Bear Peluş Ayı', category: 'Oyuncak', productPrice: 280, serviceFee: 40, supplier: 'Toyzz Shop', tier: 'Freemium', active: true },
  { id: 'g6', name: 'Kırmızı Şarap (75cl)', category: 'Alkol', productPrice: 600, serviceFee: 80, supplier: 'Meywine', tier: 'Premium', active: false },
  { id: 'g7', name: 'Organik Nemlendirici Set', category: 'Kozmetik', productPrice: 520, serviceFee: 70, supplier: 'The Body Shop', tier: 'VIP', active: true },
  { id: 'g8', name: 'Altın Kaplama Bileklik', category: 'Takı', productPrice: 2100, serviceFee: 200, supplier: 'Atasay', tier: 'Premium', active: true },
];

const tierColors: Record<string, string> = {
  Freemium: '#999999',
  VIP: '#FF6600',
  Premium: '#FFD700',
};

const categories = ['Tümü', 'Çiçek', 'Çikolata', 'Takı', 'Parfüm', 'Oyuncak', 'Alkol', 'Kozmetik'];

export default function GiftCatalogPage() {
  const [catalog, setCatalog] = React.useState(initialCatalog);
  const [categoryFilter, setCategoryFilter] = React.useState('Tümü');
  const [showForm, setShowForm] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    category: 'Çiçek',
    productPrice: '',
    serviceFee: '',
    supplier: '',
    tier: 'Freemium',
  });

  const filtered = categoryFilter === 'Tümü'
    ? catalog
    : catalog.filter(p => p.category === categoryFilter);

  const toggleActive = (id: string) => {
    setCatalog(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return;
    setCatalog(prev => [
      ...prev,
      {
        id: `g${prev.length + 1}`,
        name: newProduct.name,
        category: newProduct.category,
        productPrice: Number(newProduct.productPrice) || 0,
        serviceFee: Number(newProduct.serviceFee) || 0,
        supplier: newProduct.supplier,
        tier: newProduct.tier,
        active: true,
      },
    ]);
    setNewProduct({ name: '', category: 'Çiçek', productPrice: '', serviceFee: '', supplier: '', tier: 'Freemium' });
    setShowForm(false);
  };

  const isForbidden = (category: string) => FORBIDDEN_CATEGORIES.includes(category);

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 16 }}>Hediye Kataloğu</h2>

      <div style={{
        background: '#2A1A00', border: '1px solid #FF6600', borderRadius: 8,
        padding: '12px 16px', marginBottom: 20, color: '#FFB366', fontSize: 13,
      }}>
        ⚠️ Yasaklı kategoriler ({FORBIDDEN_CATEGORIES.join(', ')}) katalogda görünse dahi gönderim akışında otomatik engellenir. Bu ürünler sadece pasif/arşiv amaçlıdır.
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', background: '#1A1A1A', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => setShowForm(v => !v)}
          style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto' }}
        >
          + Ürün Ekle
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: '#FF6600', marginTop: 0, marginBottom: 16 }}>Yeni Ürün</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <input
              placeholder="Ürün Adı"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
            <select
              value={newProduct.category}
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            >
              {categories.filter(c => c !== 'Tümü').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={newProduct.tier}
              onChange={e => setNewProduct({ ...newProduct, tier: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            >
              <option value="Freemium">Freemium</option>
              <option value="VIP">VIP</option>
              <option value="Premium">Premium</option>
            </select>
            <input
              placeholder="Ürün Fiyatı (TL)"
              type="number"
              value={newProduct.productPrice}
              onChange={e => setNewProduct({ ...newProduct, productPrice: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
            <input
              placeholder="Hizmet Bedeli (TL)"
              type="number"
              value={newProduct.serviceFee}
              onChange={e => setNewProduct({ ...newProduct, serviceFee: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
            <input
              placeholder="Tedarikçi"
              value={newProduct.supplier}
              onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}
              style={{ padding: 10, background: '#0D0D0D', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
            />
          </div>
          {isForbidden(newProduct.category) && (
            <div style={{ color: '#FF3333', fontSize: 13, marginBottom: 12 }}>
              ⚠️ Bu kategori yasaklıdır, ürün pasif olarak eklenecektir.
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleAddProduct}
              style={{ padding: '10px 20px', background: '#FF6600', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Kaydet
            </button>
            <button
              onClick={() => setShowForm(false)}
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
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Ürün Adı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Kategori</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Ürün Fiyatı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Hizmet Bedeli</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Toplam</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tedarikçi</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tier</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 10, color: '#FFF' }}>
                {p.name}
                {isForbidden(p.category) && (
                  <span title="Yasaklı kategori" style={{ color: '#FF3333', marginLeft: 8, fontSize: 12 }}>⚠️ Yasaklı</span>
                )}
              </td>
              <td style={{ padding: 10, color: isForbidden(p.category) ? '#FF3333' : '#999' }}>{p.category}</td>
              <td style={{ padding: 10, color: '#FFF' }}>₺{p.productPrice.toLocaleString('tr-TR')}</td>
              <td style={{ padding: 10, color: '#999' }}>₺{p.serviceFee.toLocaleString('tr-TR')}</td>
              <td style={{ padding: 10, color: '#33CC33', fontWeight: 'bold' }}>₺{(p.productPrice + p.serviceFee).toLocaleString('tr-TR')}</td>
              <td style={{ padding: 10, color: '#999' }}>{p.supplier}</td>
              <td style={{ padding: 10, color: tierColors[p.tier] }}>{p.tier}</td>
              <td style={{ padding: 10 }}>
                <button
                  onClick={() => toggleActive(p.id)}
                  style={{
                    padding: '4px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer',
                    border: 'none', color: '#FFF',
                    background: p.active ? '#33CC33' : '#666',
                  }}
                >
                  {p.active ? 'Aktif' : 'Pasif'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
