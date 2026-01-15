import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "speakeasy_admin_password_v1";
const DEFAULT_PASSWORD = "1234"; // 최초 기본값(원하면 더 복잡하게)

export const getAdminPassword = async () => {
  const saved = await AsyncStorage.getItem(KEY);
  if (saved && saved.trim().length > 0) return saved;

  // 최초 1회 기본값 저장
  await AsyncStorage.setItem(KEY, DEFAULT_PASSWORD);
  return DEFAULT_PASSWORD;
};

export const setAdminPassword = async (next: string) => {
  const trimmed = next.trim();
  if (trimmed.length < 4) throw new Error("비밀번호는 최소 4자리 이상이어야 합니다.");
  await AsyncStorage.setItem(KEY, trimmed);
  return trimmed;
};
