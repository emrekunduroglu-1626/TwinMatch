import { create } from 'zustand';

type SubscriptionPlan = 'Freemium' | 'VIP' | 'Premium';

type ProfileInfo = {
  displayName: string;
  birthDate: string;
  city: string;
  occupation: string;
  education: string;
  zodiacSign: string;
  bio: string;
};

type PartnerPreferences = {
  ageRange: [number, number];
  preferredCity: string;
  education: string;
  smokingPreference: string;
  childrenPreference: string;
};

type DiscoveryProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  compatibilityScore: number;
  headline: string;
  bio: string;
  interests: string[];
  communicationStyle: string;
  matchReasons: string[];
  reportSummary: string[];
};

type CalendarSlot = {
  id: string;
  label: string;
  date: string;
  timeRange: string;
  available: boolean;
};

type InboxThread = {
  id: string;
  profileId: string;
  title: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

type SettingsState = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  profileVisible: boolean;
};

type SetupState = {
  hasCompletedSetup: boolean;
  selfieVerified: boolean;
  profileInfo: ProfileInfo;
  photos: string[];
  introVideo: string | null;
  surveyAnswers: Record<number, number>;
  partnerPreferences: PartnerPreferences;
  communicationStyle: string | null;
  discoveryProfiles: DiscoveryProfile[];
  identityUnlockedProfiles: string[];
  selectedCalendarSlotId: string | null;
  calendarSlots: CalendarSlot[];
  subscriptionPlan: SubscriptionPlan;
  inboxThreads: InboxThread[];
  notifications: NotificationItem[];
  settings: SettingsState;
  verifySelfie: () => void;
  updateProfileInfo: (payload: Partial<ProfileInfo>) => void;
  addPhoto: (photo: string) => void;
  removePhoto: (photo: string) => void;
  setIntroVideo: (video: string | null) => void;
  answerSurvey: (questionId: number, answer: number) => void;
  updatePartnerPreferences: (payload: Partial<PartnerPreferences>) => void;
  setCommunicationStyle: (style: string) => void;
  unlockIdentity: (profileId: string) => void;
  selectCalendarSlot: (slotId: string) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  markNotificationRead: (notificationId: string) => void;
  updateSettings: (payload: Partial<SettingsState>) => void;
  completeSetup: () => void;
};

const defaultProfileInfo: ProfileInfo = {
  displayName: '',
  birthDate: '',
  city: '',
  occupation: '',
  education: '',
  zodiacSign: '',
  bio: '',
};

const defaultPartnerPreferences: PartnerPreferences = {
  ageRange: [24, 34],
  preferredCity: '',
  education: '',
  smokingPreference: 'Farketmez',
  childrenPreference: 'Kararsız',
};

const defaultDiscoveryProfiles: DiscoveryProfile[] = [
  {
    id: 'selin-01',
    name: 'Selin',
    age: 29,
    city: 'İstanbul',
    compatibilityScore: 92,
    headline: 'Sanat, kahve ve derin sohbetleri seven ürün tasarımcısı',
    bio: 'Hafta içi yoğun çalışıp hafta sonu sergi, sahil yürüyüşü ve yeni kahveciler keşfetmeyi seviyorum.',
    interests: ['Modern sanat', 'Pilates', 'Specialty coffee', 'Hafta sonu kaçamakları'],
    communicationStyle: 'Sıcak ama net',
    matchReasons: ['Benzer yaşam temposu', 'Yüksek iletişim uyumu', 'Ortak sosyal ilgi alanları'],
    reportSummary: ['İlk mesajlarda akıcı iletişim bekleniyor.', 'Ortak deneyim odaklı buluşmalar daha başarılı olabilir.', 'Duygusal açıklık seviyesi dengeli görünüyor.'],
  },
  {
    id: 'mert-02',
    name: 'Mert',
    age: 31,
    city: 'Ankara',
    compatibilityScore: 87,
    headline: 'Teknoloji, koşu ve spontan planlarla motive olan yazılımcı',
    bio: 'Yeni yerler denemeyi, sabah koşularını ve akşam uzun sohbetleri seviyorum. Mizah benim için önemli.',
    interests: ['Koşu', 'Podcast', 'Canlı müzik', 'Hafta sonu roadtrip'],
    communicationStyle: 'Esprili ve enerjik',
    matchReasons: ['Yüksek enerji uyumu', 'Benzer gelecek beklentileri', 'Sohbet ritmi güçlü'],
    reportSummary: ['Hızlı bağ kurma potansiyeli var.', 'Planlama esnekliği ilişkiyi destekleyebilir.', 'Ortak aktivite bazlı buluşmalar öneriliyor.'],
  },
];

const defaultCalendarSlots: CalendarSlot[] = [
  {
    id: 'slot-1',
    label: 'Hızlı kahve buluşması',
    date: '24 Haziran Pazartesi',
    timeRange: '19:00 - 20:00',
    available: true,
  },
  {
    id: 'slot-2',
    label: 'Akşam yürüyüşü',
    date: '25 Haziran Salı',
    timeRange: '20:30 - 21:30',
    available: true,
  },
  {
    id: 'slot-3',
    label: 'Hafta sonu brunch',
    date: '29 Haziran Cumartesi',
    timeRange: '11:00 - 12:30',
    available: false,
  },
];

const defaultInboxThreads: InboxThread[] = [
  {
    id: 'thread-1',
    profileId: 'selin-01',
    title: 'Selin ile eşleşme özeti',
    preview: 'Dijital ikizler ilk buluşma için sergi + kahve önerdi.',
    timestamp: 'Bugün · 14:20',
    unreadCount: 2,
  },
  {
    id: 'thread-2',
    profileId: 'mert-02',
    title: 'Mert ile yeni öneri',
    preview: 'Ortak aktivite olarak hafta sonu koşusu öne çıktı.',
    timestamp: 'Dün · 21:05',
    unreadCount: 0,
  },
];

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Yeni uygun zaman bulundu',
    description: 'Selin ile ortak takviminde 24 Haziran için yeni bir slot açıldı.',
    timestamp: '10 dk önce',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Premium rapor hazır',
    description: 'Uyumluluk raporunun detaylı versiyonu görüntülenmeye hazır.',
    timestamp: '1 saat önce',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Kimlik açılımı tamamlandı',
    description: 'Karşılıklı onay sonrası gerçek isim paylaşımı aktif edildi.',
    timestamp: 'Dün',
    read: true,
  },
];

export const useSetupStore = create<SetupState>((set) => ({
  hasCompletedSetup: false,
  selfieVerified: false,
  profileInfo: defaultProfileInfo,
  photos: ['Studio portrait', 'Weekend outdoors'],
  introVideo: null,
  surveyAnswers: {},
  partnerPreferences: defaultPartnerPreferences,
  communicationStyle: null,
  discoveryProfiles: defaultDiscoveryProfiles,
  identityUnlockedProfiles: [],
  selectedCalendarSlotId: 'slot-1',
  calendarSlots: defaultCalendarSlots,
  subscriptionPlan: 'Freemium',
  inboxThreads: defaultInboxThreads,
  notifications: defaultNotifications,
  settings: {
    pushNotifications: true,
    emailNotifications: true,
    profileVisible: true,
  },
  verifySelfie: () => set({ selfieVerified: true }),
  updateProfileInfo: (payload) =>
    set((state) => ({
      profileInfo: {
        ...state.profileInfo,
        ...payload,
      },
    })),
  addPhoto: (photo) =>
    set((state) => ({
      photos: state.photos.includes(photo) ? state.photos : [...state.photos, photo],
    })),
  removePhoto: (photo) =>
    set((state) => ({
      photos: state.photos.filter((item) => item !== photo),
    })),
  setIntroVideo: (video) => set({ introVideo: video }),
  answerSurvey: (questionId, answer) =>
    set((state) => ({
      surveyAnswers: {
        ...state.surveyAnswers,
        [questionId]: answer,
      },
    })),
  updatePartnerPreferences: (payload) =>
    set((state) => ({
      partnerPreferences: {
        ...state.partnerPreferences,
        ...payload,
      },
    })),
  setCommunicationStyle: (style) => set({ communicationStyle: style }),
  unlockIdentity: (profileId) =>
    set((state) => ({
      identityUnlockedProfiles: state.identityUnlockedProfiles.includes(profileId)
        ? state.identityUnlockedProfiles
        : [...state.identityUnlockedProfiles, profileId],
    })),
  selectCalendarSlot: (slotId) => set({ selectedCalendarSlotId: slotId }),
  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    })),
  updateSettings: (payload) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...payload,
      },
    })),
  completeSetup: () => set({ hasCompletedSetup: true }),
}));