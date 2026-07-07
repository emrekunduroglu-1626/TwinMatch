export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
  AgeConfirm: undefined;
  Login: undefined;
  SetupFlow: undefined;
};

export type SetupStackParamList = {
  SelfieVerification: undefined;
  ProfileInfo: undefined;
  PhotoUpload: undefined;
  VideoUpload: undefined;
  DigitalTwinSurvey: undefined;
  PartnerPreferences: undefined;
  CommunicationStyle: undefined;
  DigitalTwinCreation: undefined;
};

export type MainStackParamList = {
  Discover: undefined;
  ProfileDetail: { profileId: string };
  TwinChat: { profileId: string };
  MatchProcess: { profileId: string };
  CompatibilityReport: { profileId: string };
  IdentityReveal: { profileId: string };
  Calendar: { profileId: string };
  Premium: undefined;
  Inbox: undefined;
  Notifications: undefined;
  Settings: undefined;
  Success: { title?: string; description?: string; ctaLabel?: string; targetScreen?: keyof MainStackParamList; profileId?: string };
  GiftSettings: undefined;
  AddressVault: undefined;
  GiftCatalog: undefined;
  GiftDetail: { productId: string };
  GiftCheckout: { productId: string };
  GiftNotification: undefined;
  GiftTracking: undefined;
  VenueList: undefined;
  VenueDetail: { venueId: string };
  SafeDateSpots: undefined;
};