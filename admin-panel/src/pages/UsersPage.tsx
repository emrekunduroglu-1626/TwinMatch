import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AdminUserRow, ENABLE_MOCK_FALLBACK, getUsers, setUserStatus } from "../services/api";
import { users as mockUsers } from "../services/mockData";

export function UsersPage() {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = (q?: string) => {
    getUsers(q)
      .then((data) => {
        setRows(data.results);
        setLive(true);
      })
      .catch(() => { setLive(false); if (!ENABLE_MOCK_FALLBACK) setRows([]); });
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (user: AdminUserRow) => {
    setBusy(user.id);
    try {
      await setUserStatus(user.id, !user.is_active);
      load(query || undefined);
    } catch {
      /* hata durumunda mevcut liste korunur */
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kullanıcı yönetimi</p>
          <h2>Kullanıcılar</h2>
        </div>
        <span className={live ? "badge badge-live" : "badge badge-mock"}>
          {live ? "● Canlı veri" : ENABLE_MOCK_FALLBACK ? "○ Örnek veri (backend kapalı)" : "⚠ Backend bağlantısı yok"}
        </span>
      </div>

      {(live || !ENABLE_MOCK_FALLBACK) && (
        <div className="search-row">
          <input
            type="search"
            placeholder="E-posta veya telefon ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(query || undefined)}
          />
          <button className="btn-secondary" onClick={() => load(query || undefined)}>
            Ara
          </button>
        </div>
      )}

      <article className="card">
        {live && rows ? (
          <table className="table">
            <thead>
              <tr>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>Tel. Doğrulama</th>
                <th>Kayıt</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/users/${user.id}`}>{user.email}</Link>
                  </td>
                  <td>{user.phone ?? "—"}</td>
                  <td>{user.is_active ? "Aktif" : "Pasif"}</td>
                  <td>{user.is_phone_verified ? "✓" : "—"}</td>
                  <td>{new Date(user.date_joined).toLocaleDateString("tr-TR")}</td>
                  <td>
                    <button
                      className="btn-small"
                      disabled={busy === user.id}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.is_active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : ENABLE_MOCK_FALLBACK ? (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Şehir</th>
                <th>Durum</th>
                <th>Doğrulama</th>
                <th>Paket</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.city}</td>
                  <td>{user.status}</td>
                  <td>{user.verification}</td>
                  <td>{user.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">Backend bağlantısı yok. UAT ortamında mock veri kapalı olduğu için örnek kullanıcı gösterilmiyor.</div>
        )}
      </article>
    </section>
  );
}
