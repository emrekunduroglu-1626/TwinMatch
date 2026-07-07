import React from 'react';

const mockOrders = [
  { id: 'ORD-2041', sender: 'Ahmet K.', receiver: 'Ayşe Y.', product: 'Kırmızı Gül Buketi (12 adet)', amount: 400, status: 'delivered', date: '2026-06-18', address: 'Kadıköy, İstanbul - Moda Cd. No:14 D:3', note: 'Kapıya bırakılabilir' },
  { id: 'ORD-2042', sender: 'Mehmet S.', receiver: 'Zeynep A.', product: 'Chanel No.5 Parfüm 50ml', amount: 4100, status: 'shipped', date: '2026-06-19', address: 'Çankaya, Ankara - Tunalı Hilmi Cd. No:55', note: '-' },
  { id: 'ORD-2043', sender: 'Can D.', receiver: 'Elif T.', product: 'Teddy Bear Peluş Ayı', amount: 320, status: 'preparing', date: '2026-06-20', address: 'Bornova, İzmir - Kazımdirik Mah. No:8', note: 'Hediye paketi istendi' },
  { id: 'ORD-2044', sender: 'Burak E.', receiver: 'Selin M.', product: 'Gümüş Kalp Kolye', amount: 1350, status: 'pending', date: '2026-06-20', address: 'Beşiktaş, İstanbul - Barbaros Bulvarı No:22', note: '-' },
  { id: 'ORD-2045', sender: 'Emre G.', receiver: 'Deniz K.', product: 'Organik Nemlendirici Set', amount: 590, status: 'cancelled', date: '2026-06-17', address: 'Nilüfer, Bursa - FSM Bulvarı No:100', note: 'Kullanıcı iptal etti' },
  { id: 'ORD-2046', sender: 'Ayşe Y.', receiver: 'Ahmet K.', product: 'Altın Kaplama Bileklik', amount: 2300, status: 'delivered', date: '2026-06-14', address: 'Şişli, İstanbul - Halaskargazi Cd. No:180', note: '-' },
  { id: 'ORD-2047', sender: 'Zeynep A.', receiver: 'Mehmet S.', product: 'El Yapımı Çikolata Kutusu', amount: 510, status: 'shipped', date: '2026-06-19', address: 'Konak, İzmir - Alsancak Mah. No:33', note: 'Doğum günü hediyesi' },
];

const statusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: 'Onay Bekliyor', color: '#999999' },
  preparing: { label: 'Hazırlanıyor', color: '#FF6600' },
  shipped: { label: 'Yola Çıktı', color: '#3399FF' },
  delivered: { label: 'Teslim Edildi', color: '#33CC33' },
  cancelled: { label: 'İptal', color: '#FF3333' },
};

const filters = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Onay Bekliyor' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Yola Çıktı' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'cancelled', label: 'İptal' },
];

export default function GiftOrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedOrder, setSelectedOrder] = React.useState<typeof mockOrders[0] | null>(null);

  const filtered = statusFilter === 'all' ? mockOrders : mockOrders.filter(o => o.status === statusFilter);

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 16 }}>Hediye Siparişleri</h2>

      <div style={{ marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', background: '#1A1A1A', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
        >
          {filters.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF6600' }}>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Sipariş ID</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Gönderen</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Alıcı</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Ürün</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tutar</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Durum</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(o => (
            <tr
              key={o.id}
              onClick={() => setSelectedOrder(o)}
              style={{ borderBottom: '1px solid #333', cursor: 'pointer' }}
            >
              <td style={{ padding: 10, color: '#999' }}>{o.id}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{o.sender}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{o.receiver}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{o.product}</td>
              <td style={{ padding: 10, color: '#FFF' }}>₺{o.amount.toLocaleString('tr-TR')}</td>
              <td style={{ padding: 10 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 12, fontSize: 12, color: '#FFF',
                  background: statusMeta[o.status].color,
                }}>
                  {statusMeta[o.status].label}
                </span>
              </td>
              <td style={{ padding: 10, color: '#999' }}>{o.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1A1A1A', borderRadius: 12, padding: 24, width: 480, maxWidth: '90%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#FF6600', margin: 0 }}>{selectedOrder.id} — Sipariş Detayı</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', color: '#999', fontSize: 20, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Gönderen</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.sender}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Alıcı</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.receiver}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Ürün</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.product}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Tutar</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>₺{selectedOrder.amount.toLocaleString('tr-TR')}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Durum</div>
                <div style={{ color: statusMeta[selectedOrder.status].color, fontSize: 14 }}>
                  {statusMeta[selectedOrder.status].label}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Tarih</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.date}</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#666', fontSize: 12 }}>Teslimat Adresi</div>
              <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.address}</div>
            </div>

            {selectedOrder.note !== '-' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#666', fontSize: 12 }}>Not</div>
                <div style={{ color: '#FFF', fontSize: 14 }}>{selectedOrder.note}</div>
              </div>
            )}

            <div style={{
              background: '#2A1A00', border: '1px solid #FF6600', borderRadius: 8,
              padding: '10px 14px', color: '#FFB366', fontSize: 12,
            }}>
              ⚠️ Gizlilik: Bu adres bilgisi sadece admin panelde görüntülenir. Alıcının adresi
              gönderen kullanıcıya (kimlik açılsa bile) UYGULAMADA ASLA gösterilmez.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
