import { reports } from "../services/mockData";

export function ReportsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Risk ve kalite</p>
          <h2>Operasyon raporları</h2>
        </div>
      </div>

      <div className="metric-grid">
        {reports.map((report) => (
          <article key={report.title} className={`card report-card ${report.severity}`}>
            <span className="muted">{report.title}</span>
            <strong>{report.value}</strong>
          </article>
        ))}
      </div>

      <article className="card">
        <h3>Aksiyon önerileri</h3>
        <ul className="checklist">
          <li>Bekleyen selfie kayıtları için 24 saat SLA alarmı kur</li>
          <li>Düşük skor eşleşmeleri için ürün ekibine segment export et</li>
          <li>Şikayet yoğunluğu artan kullanıcıları geçici olarak pasife al</li>
        </ul>
      </article>
    </section>
  );
}