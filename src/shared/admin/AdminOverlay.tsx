import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAdminPassword, setAdminPassword } from "../utils/adminPassword";
import { CommonActions } from "@react-navigation/native";
import { resetMappingCache } from "../../shared/utils/mapping";
import { writeMappingTemplateIfMissing } from "../../shared/utils/mappingTemplate";


type Tab = "menu" | "nav" | "password";

export default function AdminOverlay() {
  const navigation = useNavigation<any>();

  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [tab, setTab] = useState<Tab>("menu");

  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState<string | null>(null);

  const [pwNow, setPwNow] = useState("");
  const [pwNext, setPwNext] = useState("");

  const close = () => {
    Keyboard.dismiss();
    setOpen(false);
    setTab("menu");
    setPw("");
    setPwErr(null);
    setPwNow("");
    setPwNext("");
    // authed는 유지(원하면 닫을 때 false로)
    setAuthed(false);
  };

  const routes = useMemo(
    () => [
      { label: "시간입력", name: "Start" },
      { label: "시간입력후", name: "Main" },
      { label: "힌트화면(테스트용)", name: "Hint" },     // Hint는 route param 필요하면 별도 입력 UI 제공 가능
      { label: "정답화면(테스트용)", name: "Answer" }, // 마찬가지
      { label: "종료화면", name: "End" },
    ],
    []
  );

  const handleAuth = async () => {
    try {
      const saved = await getAdminPassword();
      if (pw.trim() !== saved) {
        setPwErr("비밀번호가 올바르지 않습니다.");
        return;
      }
      setAuthed(true);
      setPwErr(null);
      setTab("menu");
    } catch {
      setPwErr("인증 중 오류가 발생했습니다.");
    }
  };

  const handleGo = (name: string) => {
    close();

    // Hint/Answer는 param 없으면 깨질 수 있으니 기본값 주거나 막아도 됨
    if (name === "Hint") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Hint", params: { code: "XH001" } }],
        })
      );
      return;
    }

    if (name === "Answer") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Answer", params: { code: "XA001" } }],
        })
      );
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name }],
      })
    );
  };

  const handleChangePassword = async () => {
    try {
      const saved = await getAdminPassword();
      if (pwNow.trim() !== saved) {
        setPwErr("현재 비밀번호가 올바르지 않습니다.");
        return;
      }
      if (pwNext.trim().length < 4) {
        setPwErr("새 비밀번호는 최소 4자리 이상이어야 합니다.");
        return;
      }
      await setAdminPassword(pwNext);
      setPwErr(null);
      setPwNow("");
      setPwNext("");
      setTab("menu");
    } catch {
      setPwErr("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {/* 전역 관리자 버튼: 실수 방지용 롱프레스 */}
      <Pressable
        style={styles.fab}
        onLongPress={() => setOpen(true)}
        delayLongPress={200}
      >
        <Text style={styles.fabText}>관리</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.panel} onPress={() => { }}>
            {!authed ? (
              <>
                <Text style={styles.title}>관리자 인증</Text>
                <TextInput
                  value={pw}
                  onChangeText={setPw}
                  placeholder="비밀번호"
                  secureTextEntry
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                {!!pwErr && <Text style={styles.err}>{pwErr}</Text>}

                <Pressable style={styles.primaryBtn} onPress={handleAuth}>
                  <Text style={styles.primaryText}>확인</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* 탭 */}
                <View style={styles.tabs}>
                  <Pressable onPress={() => setTab("menu")} style={[styles.tab, tab === "menu" && styles.tabOn]}>
                    <Text style={styles.tabText}>메뉴</Text>
                  </Pressable>
                  <Pressable onPress={() => setTab("nav")} style={[styles.tab, tab === "nav" && styles.tabOn]}>
                    <Text style={styles.tabText}>이동</Text>
                  </Pressable>
                  <Pressable onPress={() => setTab("password")} style={[styles.tab, tab === "password" && styles.tabOn]}>
                    <Text style={styles.tabText}>비번</Text>
                  </Pressable>
                </View>

                {tab === "menu" && (
                  <>
                    <Text style={styles.title}>관리자 패널</Text>
                    <Pressable
                      style={[
                        styles.secondaryBtn,
                        styles.adminPrimaryBtn,
                      ]}
                      onPress={() => handleGo("Start")}
                    >
                      <Text style={styles.adminPrimaryText}>
                        시간설정 화면으로
                      </Text>
                    </Pressable>
                    <Pressable style={styles.secondaryBtn} onPress={() => setTab("nav")}>
                      <Text style={styles.secondaryText}>화면 이동</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryBtn} onPress={() => setTab("password")}>
                      <Text style={styles.secondaryText}>비밀번호 변경</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={async () => {
                        try {
                          const res = await writeMappingTemplateIfMissing();
                          // UX: 메시지 정도만 간단히
                          setPwErr(res.created ? "mapping.json 템플릿을 생성했습니다." : "이미 mapping.json이 존재합니다.");
                        } catch {
                          setPwErr("템플릿 생성 중 오류가 발생했습니다.");
                        }
                      }}
                    >
                      <Text style={styles.secondaryText}>mapping.json 템플릿 생성</Text>
                    </Pressable>

                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() => {
                        resetMappingCache();
                        setPwErr("이미지/매핑 캐시를 새로고침했습니다.");
                      }}
                    >
                      <Text style={styles.secondaryText}>이미지/매핑 새로고침</Text>
                    </Pressable>
                    <Pressable style={styles.ghostBtn} onPress={close}>
                      <Text style={styles.ghostText}>닫기</Text>
                    </Pressable>
                  </>
                )}

                {tab === "nav" && (
                  <>
                    <Text style={styles.title}>어디로 이동?</Text>
                    <View style={styles.list}>
                      {routes.map((r) => (
                        <Pressable key={r.name} style={styles.rowBtn} onPress={() => handleGo(r.name)}>
                          <Text style={styles.rowText}>{r.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {tab === "password" && (
                  <>
                    <Text style={styles.title}>비밀번호 변경</Text>
                    <TextInput
                      value={pwNow}
                      onChangeText={setPwNow}
                      placeholder="현재 비밀번호"
                      secureTextEntry
                      style={styles.input}
                    />
                    <TextInput
                      value={pwNext}
                      onChangeText={setPwNext}
                      placeholder="새 비밀번호(4자리 이상)"
                      secureTextEntry
                      style={styles.input}
                      returnKeyType="done"
                      onSubmitEditing={handleChangePassword}
                    />
                    {!!pwErr && <Text style={styles.err}>{pwErr}</Text>}

                    <Pressable style={styles.primaryBtn} onPress={handleChangePassword}>
                      <Text style={styles.primaryText}>변경</Text>
                    </Pressable>

                    <Pressable style={styles.ghostBtn} onPress={() => setTab("menu")}>
                      <Text style={styles.ghostText}>뒤로</Text>
                    </Pressable>
                  </>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 8,
    bottom: 8,
    zIndex: 9999,

    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: "rgba(0,0,0,0.12)", // 거의 투명
  },
  fabText: {
    color: "rgba(255,255,255,0.35)", // 👈 텍스트도 흐리게
    fontWeight: "800",
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  adminPrimaryBtn: {
    backgroundColor: "#3F6FE3", // 관리자 포인트 컬러
    borderWidth: 1,
    borderColor: "#2F58C9",
    elevation: 4,
  },

  adminPrimaryText: {
    color: "#fff",
    fontWeight: "900",
  },

  panel: {
    width: "92%",
    maxWidth: 560,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 14,
    padding: 16,
    elevation: 10,
  },

  title: { fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 12 },

  tabs: { flexDirection: "row", gap: 8, marginBottom: 12, justifyContent: "center" },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.06)" },
  tabOn: { backgroundColor: "rgba(0,0,0,0.14)" },
  tabText: { fontWeight: "800" },

  input: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 10,
  },

  err: { color: "#d32f2f", textAlign: "center", marginBottom: 10, fontWeight: "700" },

  primaryBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#3F6FE3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  secondaryText: { fontWeight: "900" },

  ghostBtn: { paddingVertical: 10, alignItems: "center", justifyContent: "center", marginTop: 6 },
  ghostText: { fontWeight: "800", color: "rgba(0,0,0,0.65)" },

  list: { gap: 10 },
  rowBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { fontWeight: "900" },
});
