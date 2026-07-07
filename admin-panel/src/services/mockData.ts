export const dashboardMetrics = [
  { label: "Toplam kullanıcı", value: "12.480", delta: "+8.4%" },
  { label: "Aktif eşleşme", value: "1.284", delta: "+5.1%" },
  { label: "Aktif abonelik", value: "842", delta: "+12.7%" },
  { label: "Aylık gelir", value: "₺418.000", delta: "+9.9%" },
];

export const funnel = [
  { stage: "Kayıt", count: 12480 },
  { stage: "Profil tamamlandı", count: 9780 },
  { stage: "Dijital ikiz aktif", count: 7310 },
  { stage: "Eşleşme başladı", count: 2840 },
  { stage: "Kimlik açılımı", count: 412 },
];

export const users = [
  {
    id: "USR-1024",
    name: "Ayşe Demir",
    city: "İstanbul",
    status: "Aktif",
    verification: "Onaylı",
    plan: "Premium",
  },
  {
    id: "USR-1025",
    name: "Mert Kaya",
    city: "Ankara",
    status: "İncelemede",
    verification: "Bekliyor",
    plan: "VIP",
  },
  {
    id: "USR-1026",
    name: "Selin Aras",
    city: "İzmir",
    status: "Pasif",
    verification: "Reddedildi",
    plan: "Freemium",
  },
];

export const reports = [
  { title: "Bekleyen selfie doğrulamaları", value: 38, severity: "warning" },
  { title: "Düşük skor eşleşmeler", value: 17, severity: "neutral" },
  { title: "İncelenecek kullanıcı şikayetleri", value: 9, severity: "danger" },
];