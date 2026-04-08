// api.ts

const DEV_LOCAL_IP = "192.168.1.106"; // Home Wi-Fi IP
const UNI_LOCAL_IP = "172.20.10.2"; // Uni Wi-Fi IP
const ANDROID_EMULATOR_IP = "10.0.2.2"; // Android Emulator IP
const PC = "localhost"; // PC IP

type NetworkEnvironment = "dev" | "uni" | "emulator" | "pc" | "docker";

const USE: NetworkEnvironment = "docker"; // Change this to "uni", "dev", or "emulator" as needed

const ipMap: Record<NetworkEnvironment, string> = {
  dev: `http://${DEV_LOCAL_IP}:8000`,
  uni: `http://${UNI_LOCAL_IP}:8000`,
  emulator: `http://${ANDROID_EMULATOR_IP}:8000`,
  pc: `http://${PC}:8000`,
  docker: process.env.API_BASE_URL || `http://${PC}:8000`,
};

export const API_BASE_URL = ipMap[USE];

// Export specific endpoints
export const API_ENDPOINTS = {
  base: API_BASE_URL,
  login: `${API_BASE_URL}/auth/token`,
  currentUser: `${API_BASE_URL}/auth/user/me`,
};