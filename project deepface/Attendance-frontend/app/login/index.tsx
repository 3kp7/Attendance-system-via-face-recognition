import React, { useState, useContext } from "react";
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { AuthContext } from "../contexts/authContext";
import { useRouter } from "expo-router";

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const result = await signIn(username, password);
    setLoading(false);

    if (!result.success) {
      alert(result.error);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center text-[#0f0D32] mb-8">Login</Text>

      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-base"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-base"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity
          className="bg-[#0f0D32] py-3 rounded-md items-center"
          onPress={handleLogin}
        >
          <Text className="text-white text-lg font-semibold">Log In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LoginScreen;
