import { create } from 'zustand';
import { apiFetch, Paginated } from '../services/api';

export type GiftReceivePermission = 'none' | 'matchesOnly' | 'approvedOnly' | 'afterFirstDate';

type BackendGiftSetting = {
  can_receive: boolean;
  can_send: boolean;
  receive_from: 'nobody' | 'matches_only' | 'approved_only' | 'after_first_date';
  blocked_senders: string[];
};

type BackendGiftProduct = {
  id: string;
  name: string;
  category: { name: string };
  description: string;
  price: string;
  service_fee: string;
  total_price: string;
  image_url: string;
  tier_required: 'gold' | 'platinum';
};

type BackendGiftOrder = {
  id: string;
  product: BackendGiftProduct;
  sender: string;
  receiver: string;
  status: string;
  gift_note: string;
};

type BackendGiftNotification = {
  id: string;
  order: string;
  notification_type: string;
  message: string;
};

export type GiftSettingsState = {
  canReceiveGifts: boolean;
  canSendGifts: boolean;
  receivePermission: GiftReceivePermission;
  blockedSenders: string[];
};

export type AddressVault = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
  maskedPhone: string;
  saved: boolean;
  verified?: boolean;
};

export type GiftCategory = 'Çiçek' | 'Çikolata' | 'Kahve' | 'Kitap' | 'Pelüş' | 'Mum' | 'Kozmetik' | 'Kupa' | 'Aksesuar' | 'Özel Gün' | string;

export type GiftProduct = {
  id: string;
  name: string;
  category: GiftCategory;
  description: string;
  price: number;
  serviceFee: number;
  tier: 'Gold' | 'Platinum';
  image: string;
};

export type GiftOrderStatus = 'Onay Bekliyor' | 'Hazırlanıyor' | 'Yola Çıktı' | 'Teslim Edildi' | 'Reddedildi' | 'İptal Edildi';

export type GiftOrder = {
  id: string;
  productId: string;
  productName: string;
  image: string;
  direction: 'sent' | 'received';
  counterpartName: string;
  status: GiftOrderStatus;
  note?: string;
};

export type GiftNotificationRequest = {
  id: string;
  senderName: string;
  category: GiftCategory;
  estimatedValueRange: string;
  note: string;
  orderId?: string;
};

type GiftState = {
  giftSettings: GiftSettingsState;
  addressVault: AddressVault;
  catalog: GiftProduct[];
  orders: GiftOrder[];
  notifications: GiftNotificationRequest[];
  userTier: 'Freemium' | 'Gold' | 'Platinum';
  updateGiftSettings: (payload: Partial<GiftSettingsState>) => void;
  syncGiftSettings: () => Promise<void>;
  toggleBlockedSender: (name: string) => void;
  updateAddressVault: (payload: Partial<AddressVault>) => void;
  saveAddressVault: () => Promise<void> | void;
  fetchCatalog: () => Promise<GiftProduct[]>;
  sendGift: (productId: string, recipientId: string, note?: string) => Promise<GiftOrder>;
  acceptGift: (notificationId: string) => Promise<void>;
  rejectGift: (notificationId: string) => Promise<void> | void;
  fetchOrders: () => Promise<GiftOrder[]>;
  fetchNotifications: () => Promise<GiftNotificationRequest[]>;
};

const receiveToBackend: Record<GiftReceivePermission, BackendGiftSetting['receive_from']> = {
  none: 'nobody',
  matchesOnly: 'matches_only',
  approvedOnly: 'approved_only',
  afterFirstDate: 'after_first_date',
};

const receiveFromBackend: Record<BackendGiftSetting['receive_from'], GiftReceivePermission> = {
  nobody: 'none',
  matches_only: 'matchesOnly',
  approved_only: 'approvedOnly',
  after_first_date: 'afterFirstDate',
};

const defaultGiftSettings: GiftSettingsState = {
  canReceiveGifts: false,
  canSendGifts: false,
  receivePermission: 'none',
  blockedSenders: [],
};

const defaultAddressVault: AddressVault = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  postalCode: '',
  maskedPhone: '',
  saved: false,
  verified: false,
};

function mapProduct(product: BackendGiftProduct): GiftProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category?.name ?? 'Hediye',
    description: product.description,
    price: Number(product.price),
    serviceFee: Number(product.service_fee),
    tier: product.tier_required === 'platinum' ? 'Platinum' : 'Gold',
    image: product.image_url || product.name,
  };
}

function mapOrder(order: BackendGiftOrder): GiftOrder {
  const statusMap: Record<string, GiftOrderStatus> = {
    pending_approval: 'Onay Bekliyor',
    approved: 'Hazırlanıyor',
    preparing: 'Hazırlanıyor',
    shipped: 'Yola Çıktı',
    delivered: 'Teslim Edildi',
    rejected: 'Reddedildi',
    cancelled: 'İptal Edildi',
  };
  return {
    id: order.id,
    productId: order.product?.id ?? '',
    productName: order.product?.name ?? 'Hediye',
    image: order.product?.image_url ?? order.product?.name ?? '',
    direction: 'sent',
    counterpartName: 'Anonim eşleşme',
    status: statusMap[order.status] ?? 'Onay Bekliyor',
    note: order.gift_note,
  };
}

export const useGiftStore = create<GiftState>((set, get) => ({
  giftSettings: defaultGiftSettings,
  addressVault: defaultAddressVault,
  catalog: [],
  orders: [],
  notifications: [],
  userTier: 'Freemium',
  updateGiftSettings: (payload) => {
    const next = { ...get().giftSettings, ...payload };
    set({ giftSettings: next });
    apiFetch<BackendGiftSetting>('/gifts/settings/', {
      method: 'PATCH',
      body: JSON.stringify({
        can_receive: next.canReceiveGifts,
        can_send: next.canSendGifts,
        receive_from: receiveToBackend[next.receivePermission],
      }),
    }).catch(() => undefined);
  },
  syncGiftSettings: async () => {
    const data = await apiFetch<BackendGiftSetting>('/gifts/settings/');
    set({
      giftSettings: {
        canReceiveGifts: data.can_receive,
        canSendGifts: data.can_send,
        receivePermission: receiveFromBackend[data.receive_from],
        blockedSenders: data.blocked_senders ?? [],
      },
    });
  },
  toggleBlockedSender: (name) =>
    set((state) => ({
      giftSettings: {
        ...state.giftSettings,
        blockedSenders: state.giftSettings.blockedSenders.includes(name)
          ? state.giftSettings.blockedSenders.filter((sender) => sender !== name)
          : [...state.giftSettings.blockedSenders, name],
      },
    })),
  updateAddressVault: (payload) =>
    set((state) => ({
      addressVault: {
        ...state.addressVault,
        ...payload,
      },
    })),
  saveAddressVault: async () => {
    const vault = get().addressVault;
    const data = await apiFetch<any>('/gifts/address/', {
      method: 'PATCH',
      body: JSON.stringify({
        address_line1: vault.addressLine1,
        address_line2: vault.addressLine2,
        city: vault.city,
        district: vault.district,
        postal_code: vault.postalCode,
        phone_masked: vault.maskedPhone,
      }),
    });
    set({
      addressVault: {
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        district: data.district,
        postalCode: data.postal_code,
        maskedPhone: data.phone_masked,
        saved: true,
        verified: data.is_verified,
      },
    });
  },
  fetchCatalog: async () => {
    const response = await apiFetch<Paginated<BackendGiftProduct>>('/gifts/catalog/?page_size=100');
    const catalog = response.results.map(mapProduct);
    set({ catalog });
    return catalog;
  },
  sendGift: async (productId, recipientId, note) => {
    const order = await apiFetch<BackendGiftOrder>('/gifts/orders/', {
      method: 'POST',
      body: JSON.stringify({ product: productId, receiver: recipientId, gift_note: note ?? '' }),
    });
    const mapped = mapOrder(order);
    set((state) => ({ orders: [mapped, ...state.orders] }));
    return mapped;
  },
  acceptGift: async (notificationId) => {
    const notification = get().notifications.find((item) => item.id === notificationId);
    if (!notification?.orderId) return;
    await apiFetch(`/gifts/orders/${notification.orderId}/accept/`, { method: 'POST', body: JSON.stringify({}) });
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== notificationId) }));
  },
  rejectGift: async (notificationId) => {
    const notification = get().notifications.find((item) => item.id === notificationId);
    if (notification?.orderId) {
      await apiFetch(`/gifts/orders/${notification.orderId}/reject/`, { method: 'POST', body: JSON.stringify({ rejection_reason: 'Kullanıcı reddetti.' }) }).catch(() => undefined);
    }
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== notificationId) }));
  },
  fetchOrders: async () => {
    const response = await apiFetch<Paginated<BackendGiftOrder>>('/gifts/orders/');
    const orders = response.results.map(mapOrder);
    set({ orders });
    return orders;
  },
  fetchNotifications: async () => {
    const response = await apiFetch<Paginated<BackendGiftNotification>>('/gifts/notifications/');
    const notifications = response.results.map((item) => ({
      id: item.id,
      senderName: 'Anonim gönderen',
      category: 'Hediye',
      estimatedValueRange: 'Gizli',
      note: item.message,
      orderId: item.order,
    }));
    set({ notifications });
    return notifications;
  },
}));
