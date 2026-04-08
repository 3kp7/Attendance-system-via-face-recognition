// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // 🛡️ Import SafeArea
import { AuthProvider, AuthContext } from "./contexts/authContext";
import "./globals.css";

function InnerLayout() {
  const { user } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "login";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && inTabsGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="Courses/[id]" />
        <Stack.Screen name="screens/attendance" />
        <Stack.Screen name="screens/subjects" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InnerLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
