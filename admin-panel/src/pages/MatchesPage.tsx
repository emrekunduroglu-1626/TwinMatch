import React from 'react';

const mockMatches = [
  { id: 'm1', userA: 'Ahmet K.', userB: 'Ayşe Y.', score: 92, stage: 3, status: 'completed', date: '2026-06-15' },
  { id: 'm2', userA: 'Mehmet S.', userB: 'Zeynep A.', score: 78, stage: 2, status: 'in_progress', date: '2026-06-18' },
  { id: 'm3', userA: 'Can D.', userB: 'Elif T.', score: 45, stage: 1, status: 'failed', date: '2026-06-19' },
  { id: 'm4', userA: 'Burak E.', userB: 'Selin M.', score: 88, stage: 3, status: 'revealed', date: '2026-06-12' },
  { id: 'm5', userA: 'Emre G.', userB: 'Deniz K.', score: 71, stage: 2, status: 'in_progress', date: '2026-06-20' },
];

const statusColors: Record<string, string> = {
  completed: '#33CC33',
  in_progress: '#FF6600',
  failed: '#FF3333',
  revealed: '#6699FF',
};

const statusLabels: Record<string, string> = {
  completed: 'Tamamlandı',
  in_progress: 'Devam Ediyor',
  failed: 'Başarısız',
  revealed: 'Kimlik Açıldı',
};

export default function MatchesPage() {
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? mockMatches : mockMatches.filter(m => m.status === filter);

  return (
    <div>
      <h2 style={{ color: '#FF6600', marginBottom: 16 }}>Eşlemeler</h2>
      <div style={{ marginBottom: 16 }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 12px', background: '#1A1A1A', color: '#FFF', border: '1px solid #333', borderRadius: 6 }}
        >
          <option value="all">Tümü</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
          <option value="failed">Başarısız</option>
          <option value="revealed">Kimlik Açıldı</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF6600' }}>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>ID</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Kullanıcı A</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Kullanıcı B</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Skor</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Aşama</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Durum</th>
            <th style={{ padding: 10, textAlign: 'left', color: '#FF6600' }}>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 10, color: '#999' }}>{m.id}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{m.userA}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{m.userB}</td>
              <td style={{ padding: 10, color: m.score >= 70 ? '#33CC33' : '#FF3333' }}>%{m.score}</td>
              <td style={{ padding: 10, color: '#FFF' }}>{m.stage}/3</td>
              <td style={{ padding: 10, color: statusColors[m.status] }}>{statusLabels[m.status]}</td>
              <td style={{ padding: 10, color: '#999' }}>{m.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
