import { useEffect, useState } from "react";

import { getMatchStatsTyped, MatchStatsPayload } from "../services/api";

const mockMatches = [
  { match_id: "m1", user_a: "ornek-a@mock.dev", user_b: "ornek-b@mock.dev", overall_score: 92, status: "completed" },
  { match_id: "m2", user_a: "ornek-c@mock.dev", user_b: "ornek-d@mock.dev", overall_score: 78, status: "active" },
];

const STAGE_LABELS: Record<string, string> = {
  candidate: "Aday",
  twin_chat: "İkiz Sohbeti",
  ready_to_reveal: "Açılıma Hazır",
  revealed: "Kimlik Açıldı",
};

export default function MatchesPage() {
  const [data, setData] = useState<MatchStatsPayload | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    getMatchStatsTyped()
      .then((payload) => {
        setData(payload);
        setLive(true);
      })
      .catch(() => setLive(false));
  }, []);

  const pairs = data?.top_pairs ?? mockMatches;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Eşleşme operasyonu</p>
          <h2>Eşlemeler</h2>
        </div>
        <span className={live ? "badge badge-live" : "badge badge-mock"}>
          {live ? "● Canlı veri" : "○ Örnek veri (backend kapalı)"}
        </span>
      </div>

      {data && (
        <div className="metric-grid">
          <article className="card metric-card"><span className="muted">Toplam</span><strong>{data.total_matches}</strong></article>
          <article className="card metric-card"><span className="muted">Aktif</span><strong>{data.active_matches}</strong></article>
          <article className="card metric-card"><span className="muted">Kimlik açıldı</span><strong>{data.revealed_matches}</strong></article>
          <article className="card metric-card"><span className="muted">Ortalama skor</span><strong>{data.average_score}</strong></article>
        </div>
      )}

      {data && (
        <article className="card">
          <h3>Aşama dağılımı</h3>
          <div className="stack">
            {Object.entries(data.stage_breakdown).map(([stage, count]) => (
              <div key={stage} className="row">
                <span>{STAGE_LABELS[stage] ?? stage}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>
      )}

      <article className="card">
        <h3>En yüksek skorlu eşleşmeler</h3>
        <table className="table">
          <thead>
            <tr><th>Kullanıcı A</th><th>Kullanıcı B</th><th>Skor</th><th>Durum</th></tr>
          </thead>
          <tbody>
            {pairs.map((m) => (
              <tr key={m.match_id}>
                <td>{m.user_a}</td>
                <td>{m.user_b}</td>
                <td>{m.overall_score ?? "—"}</td>
                <td>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
