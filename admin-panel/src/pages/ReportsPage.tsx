import { useEffect, useState } from "react";

import { getReportStatsTyped, ReportStatsPayload } from "../services/api";

const LABELS: [keyof ReportStatsPayload, string, string][] = [
  ["pending_user_reports", "Bekleyen kullanıcı şikayeti", "İncelenmemiş şikayet sayısı"],
  ["pending_verifications", "Bekleyen doğrulama", "Selfie/kimlik onay kuyruğu"],
  ["rejected_verifications", "Reddedilen doğrulama", "Yeniden deneme gerektirir"],
  ["incomplete_profiles", "Tamamlanmamış profil", "Onboarding'i bitirmeyenler"],
  ["inactive_digital_twins", "Pasif dijital ikiz", "Eşleşmeye kapalı ikizler"],
  ["low_score_matches", "Düşük skorlu eşleşme", "Skor < 50 olan eşleşmeler"],
];

export function ReportsPage() {
  const [data, setData] = useState<ReportStatsPayload | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    getReportStatsTyped()
      .then((payload) => {
        setData(payload);
        setLive(true);
      })
      .catch(() => setLive(false));
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Moderasyon &amp; kalite</p>
          <h2>Raporlar</h2>
        </div>
        <span className={live ? "badge badge-live" : "badge badge-mock"}>
          {live ? "● Canlı veri" : "○ Örnek veri (backend kapalı)"}
        </span>
      </div>

      {data ? (
        <div className="metric-grid">
          {LABELS.map(([key, title, hint]) => (
            <article key={key} className="card metric-card">
              <span className="muted">{title}</span>
              <strong>{data[key]}</strong>
              <span className="muted" style={{ fontSize: 12 }}>{hint}</span>
            </article>
          ))}
        </div>
      ) : (
        <article className="card"><p className="muted">Canlı veri için backend'i başlatın ve admin girişi yapın.</p></article>
      )}
    </section>
  );
}
