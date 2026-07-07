import { useEffect, useState } from "react";

import { DashboardPayload, ENABLE_MOCK_FALLBACK, getDashboard } from "../services/api";
import { dashboardMetrics, funnel } from "../services/mockData";

export function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setLive(true);
        }
      })
      .catch(() => {
        if (!ENABLE_MOCK_FALLBACK && !cancelled) setData(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = data
    ? [
        { label: "Toplam kullanıcı", value: data.users_total.toLocaleString("tr-TR") },
        { label: "Aktif eşleşme", value: data.matches_active.toLocaleString("tr-TR") },
        { label: "Aktif abonelik", value: data.subscriptions_active.toLocaleString("tr-TR") },
        { label: "Aylık gelir", value: `₺${Number(data.monthly_revenue).toLocaleString("tr-TR")}` },
      ]
    : ENABLE_MOCK_FALLBACK ? dashboardMetrics : [];

  const liveFunnel = data
    ? [
        { stage: "Kayıt", count: data.users_total },
        { stage: "Profil tamamlandı", count: data.profiles_completed },
        { stage: "Dijital ikiz aktif", count: data.digital_twins_active },
        { stage: "Eşleşme başladı", count: data.matches_total },
        { stage: "Kimlik açılımı", count: data.matches_revealed },
      ]
    : ENABLE_MOCK_FALLBACK ? funnel : [];

  const maxCount = Math.max(liveFunnel[0]?.count ?? 1, 1);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Genel görünüm</p>
          <h2>Operasyon dashboard</h2>
        </div>
        <span className={live ? "badge badge-live" : "badge badge-mock"}>
          {loading ? "Yükleniyor…" : live ? "● Canlı veri" : ENABLE_MOCK_FALLBACK ? "○ Örnek veri (backend kapalı)" : "⚠ Backend bağlantısı yok"}
        </span>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <span className="muted">{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="two-column">
        <article className="card">
          <h3>Dönüşüm hunisi</h3>
          <div className="stack">
            {liveFunnel.map((item) => (
              <div key={item.stage}>
                <div className="row">
                  <span>{item.stage}</span>
                  <strong>{item.count.toLocaleString("tr-TR")}</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Operasyon durumu</h3>
          <ul className="checklist">
            <li>{data ? `${data.pending_reports} bekleyen doğrulama` : "Bekleyen doğrulama verisi yok"}</li>
            <li>{data ? `${data.conversations_total} toplam sohbet` : "Sohbet verisi yok"}</li>
            <li>{data ? `${data.messages_total} toplam mesaj` : "Mesaj verisi yok"}</li>
            <li>{data ? `${data.users_verified} doğrulanmış kullanıcı` : "Doğrulama verisi yok"}</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
