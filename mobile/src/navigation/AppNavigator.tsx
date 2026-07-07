import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList, MainStackParamList, SetupStackParamList } from './types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { AgeConfirmScreen } from '../screens/auth/AgeConfirmScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SelfieVerificationScreen } from '../screens/setup/SelfieVerificationScreen';
import { ProfileInfoScreen } from '../screens/setup/ProfileInfoScreen';
import { PhotoUploadScreen } from '../screens/setup/PhotoUploadScreen';
import { VideoUploadScreen } from '../screens/setup/VideoUploadScreen';
import { DigitalTwinSurveyScreen } from '../screens/setup/DigitalTwinSurveyScreen';
import { PartnerPreferencesScreen } from '../screens/setup/PartnerPreferencesScreen';
import { CommunicationStyleScreen } from '../screens/setup/CommunicationStyleScreen';
import { DigitalTwinCreationScreen } from '../screens/setup/DigitalTwinCreationScreen';
import { DiscoverScreen } from '../screens/main/DiscoverScreen';
import { ProfileDetailScreen } from '../screens/main/ProfileDetailScreen';
import { TwinChatScreen } from '../screens/main/TwinChatScreen';
import { MatchProcessScreen } from '../screens/main/MatchProcessScreen';
import { CompatibilityReportScreen } from '../screens/main/CompatibilityReportScreen';
import { IdentityRevealScreen } from '../screens/main/IdentityRevealScreen';
import { CalendarScreen } from '../screens/main/CalendarScreen';
import { PremiumScreen } from '../screens/main/PremiumScreen';
import { InboxScreen } from '../screens/main/InboxScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { SuccessScreen } from '../screens/main/SuccessScreen';
import { GiftSettingsScreen } from '../screens/main/GiftSettingsScreen';
import { AddressVaultScreen } from '../screens/main/AddressVaultScreen';
import { GiftCatalogScreen } from '../screens/main/GiftCatalogScreen';
import { GiftDetailScreen } from '../screens/main/GiftDetailScreen';
import { GiftCheckoutScreen } from '../screens/main/GiftCheckoutScreen';
import { GiftNotificationScreen } from '../screens/main/GiftNotificationScreen';
import { GiftTrackingScreen } from '../screens/main/GiftTrackingScreen';
import { VenueListScreen } from '../screens/main/VenueListScreen';
import { VenueDetailScreen } from '../screens/main/VenueDetailScreen';
import { SafeDateSpotsScreen } from '../screens/main/SafeDateSpotsScreen';
import { useSetupStore } from '../store/setupStore';

type RootStackParamList = Omit<AuthStackParamList, 'SetupFlow'> & {
  SetupFlow: NavigatorScreenParams<SetupStackParamList> | undefined;
  MainFlow: NavigatorScreenParams<MainStackParamList> | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SetupStack = createNativeStackNavigator<SetupStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function SetupNavigator() {
  return (
    <SetupStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <SetupStack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
      <SetupStack.Screen name="ProfileInfo" component={ProfileInfoScreen} />
      <SetupStack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
      <SetupStack.Screen name="VideoUpload" component={VideoUploadScreen} />
      <SetupStack.Screen name="DigitalTwinSurvey" component={DigitalTwinSurveyScreen} />
      <SetupStack.Screen name="PartnerPreferences" component={PartnerPreferencesScreen} />
      <SetupStack.Screen name="CommunicationStyle" component={CommunicationStyleScreen} />
      <SetupStack.Screen name="DigitalTwinCreation" component={DigitalTwinCreationScreen} />
    </SetupStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen name="Discover" component={DiscoverScreen} />
      <MainStack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <MainStack.Screen name="TwinChat" component={TwinChatScreen} />
      <MainStack.Screen name="MatchProcess" component={MatchProcessScreen} />
      <MainStack.Screen name="CompatibilityReport" component={CompatibilityReportScreen} />
      <MainStack.Screen name="IdentityReveal" component={IdentityRevealScreen} />
      <MainStack.Screen name="Calendar" component={CalendarScreen} />
      <MainStack.Screen name="Premium" component={PremiumScreen} />
      <MainStack.Screen name="Inbox" component={InboxScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="Success" component={SuccessScreen} />
      <MainStack.Screen name="GiftSettings" component={GiftSettingsScreen} />
      <MainStack.Screen name="AddressVault" component={AddressVaultScreen} />
      <MainStack.Screen name="GiftCatalog" component={GiftCatalogScreen} />
      <MainStack.Screen name="GiftDetail" component={GiftDetailScreen} />
      <MainStack.Screen name="GiftCheckout" component={GiftCheckoutScreen} />
      <MainStack.Screen name="GiftNotification" component={GiftNotificationScreen} />
      <MainStack.Screen name="GiftTracking" component={GiftTrackingScreen} />
      <MainStack.Screen name="VenueList" component={VenueListScreen} />
      <MainStack.Screen name="VenueDetail" component={VenueDetailScreen} />
      <MainStack.Screen name="SafeDateSpots" component={SafeDateSpotsScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedSetup = useSetupStore((state) => state.hasCompletedSetup);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      {!hasCompletedOnboarding && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="AgeConfirm" component={AgeConfirmScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      {isAuthenticated && !hasCompletedSetup && <Stack.Screen name="SetupFlow" component={SetupNavigator} options={{ headerShown: false }} />}
      {isAuthenticated && hasCompletedSetup && <Stack.Screen name="MainFlow" component={MainNavigator} options={{ headerShown: false }} />}
    </Stack.Navigator>
  );
}