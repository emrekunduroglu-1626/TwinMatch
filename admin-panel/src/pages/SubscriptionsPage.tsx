import { useEffect, useState } from "react";

import { getSubscriptionStatsTyped, SubscriptionStatsPayload } from "../services/api";

const PLAN_LABELS: Record<string, string> = { basic: "Basic", plus: "Plus", premium: "Premium" };
const PAYMENT_LABELS: Record<string, string> = { pending: "Bekliyor", paid: "Ödendi", failed: "Başarısız", refunded: "İade" };

export default function SubscriptionsPage() {
  const [data, setData] = useState<SubscriptionStatsPayload | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    getSubscriptionStatsTyped()
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
          <p className="eyebrow">Gelir operasyonu</p>
          <h2>Abonelikler</h2>
        </div>
        <span className={live ? "badge badge-live" : "badge badge-mock"}>
          {live ? "● Canlı veri" : "○ Örnek veri (backend kapalı)"}
        </span>
      </div>

      {data ? (
        <>
          <div className="metric-grid">
            <article className="card metric-card"><span className="muted">Aktif abonelik</span><strong>{data.active_subscriptions}</strong></article>
            <article className="card metric-card"><span className="muted">Yıllık plan</span><strong>{data.annual_subscriptions}</strong></article>
            <article className="card metric-card"><span className="muted">Bu ay gelir</span><strong>₺{Number(data.monthly_revenue).toLocaleString("tr-TR")}</strong></article>
          </div>

          <div className="two-column">
            <article className="card">
              <h3>Plan dağılımı</h3>
              <div className="stack">
                {Object.entries(data.plan_breakdown).length === 0 && <p className="muted">Aktif abonelik yok</p>}
                {Object.entries(data.plan_breakdown).map(([plan, count]) => (
                  <div key={plan} className="row"><span>{PLAN_LABELS[plan] ?? plan}</span><strong>{count}</strong></div>
                ))}
              </div>
            </article>
            <article className="card">
              <h3>Ödeme durumları</h3>
              <div className="stack">
                {Object.entries(data.payment_status_breakdown).map(([st, count]) => (
                  <div key={st} className="row"><span>{PAYMENT_LABELS[st] ?? st}</span><strong>{count}</strong></div>
                ))}
              </div>
            </article>
          </div>
        </>
      ) : (
        <article className="card"><p className="muted">Canlı veri için backend'i başlatın ve admin girişi yapın.</p></article>
      )}
    </section>
  );
}
