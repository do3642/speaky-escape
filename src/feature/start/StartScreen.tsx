import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ImageBackground,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useTimer } from "../../shared/hooks/useTimer";
import { Dimensions } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// 390은 보통 폰 기준(대략 iPhone 12/13 폭) 정도로 잡는 관용값
const scale = (n: number) => Math.round((SCREEN_W / 390) * n);

// 너무 과도하게 커지는 걸 막는 clamp
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Start Screen
 * - 운영자가 초기 시간을 입력하고 게임을 시작하는 진입 화면
 * - PDF 시안 기반: 배경 이미지 + 전등 아이콘 + 중앙 타이틀 + 입력 + 설정 버튼 + 빠른설정 버튼
 */
const StartScreen = ({ navigation }: any) => {
  const { setTotalMs } = useTimer();

  // 기본값 60분
  const [minutesText, setMinutesText] = useState("60");

  // 입력값(분) 정규화
  const minutesNum = useMemo(() => {
    // 숫자 외 입력 방어
    const n = Number(minutesText);
    if (!Number.isFinite(n)) return 0;

    // 실무적으로는 소수 입력을 막고, 음수/0도 막는다
    const asInt = Math.floor(n);
    return asInt;
  }, [minutesText]);

  const canStart = minutesNum > 0;

  const calculateTotalMs = (minutes: number) => Math.floor(minutes * 60 * 1000);

  const handleGoMain = () => {
    if (!canStart) return;

    Keyboard.dismiss();

    const totalMs = calculateTotalMs(minutesNum);
    setTotalMs(totalMs);
    navigation.navigate("Main");
  };

  const handleQuickSet65 = () => {
    const minutes = 65;
    setMinutesText(String(minutes));
    const totalMs = calculateTotalMs(minutes);
    setTotalMs(totalMs);
    navigation.navigate("Main");
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/bgStart.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* 화면 전체 어둡게(가독성 확보용) */}
      <View style={styles.dim} />

      <View style={styles.container}>
        {/* 전등 아이콘 */}
        <Image
          source={require("../../../assets/images/iconLamp.png")}
          style={styles.lamp}
          resizeMode="contain"
        />

        {/* 메인 타이틀 */}
        <Text style={styles.title}>스피키지 힌트 시스템</Text>

        {/* 입력 박스 */}
        <View style={styles.inputWrap}>
          <TextInput
            value={minutesText}
            onChangeText={(t) => {
              // 숫자만 남기기(키오스크/현장 입력 안정성)
              const onlyNum = t.replace(/[^0-9]/g, "");
              setMinutesText(onlyNum);
            }}
            keyboardType="numeric"
            placeholder="설정할 시간 입력"
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleGoMain}
          />
          {/* 단위를 보여주고 싶으면 아래 텍스트를 살려도 됨 */}
          {/* <Text style={styles.unit}>분</Text> */}
        </View>

        {/* 설정하기 버튼 (메인 CTA) */}
        <Pressable
          onPress={handleGoMain}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.primaryButton,
            !canStart && styles.primaryButtonDisabled,
            pressed && canStart && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>설정하기</Text>
        </Pressable>

        {/* 빠른 설정 버튼: 65분 */}
        <Pressable
          onPress={handleQuickSet65}
          style={({ pressed }) => [
            styles.quickButton,
            pressed && styles.quickButtonPressed,
          ]}
        >
          <Text style={styles.quickButtonText}>빠른 설정 (65분)</Text>
        </Pressable>

        {/* 하단 로고 영역이 필요하면 여기 추가 배치(이미지/텍스트) */}
        {/* <Image source={...} style={styles.bottomLogo} /> */}
      </View>
    </ImageBackground>
  );
};

const INPUT_RADIUS = clamp(scale(14), 12, 18);     // ✅ 입력/빠른설정 동일
const CTA_RADIUS = clamp(scale(28), 24, 34);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: clamp(scale(20), 18, 28),
  },



  lamp: {
    width: clamp(scale(110), 96, 150),
    height: clamp(scale(110), 96, 150),
    marginBottom: clamp(scale(10), 8, 16),
  },

  title: {
    fontSize: clamp(scale(30), 28, 42),
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#E8D39A",
    textAlign: "center",
    marginBottom: clamp(scale(18), 14, 26), // ✅ 타이틀-입력 사이 간격
  },

  inputWrap: {
    width: "88%",
    maxWidth: 520,
    marginBottom: clamp(scale(16), 12, 22), // ✅ 입력-설정하기 간격
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: INPUT_RADIUS,               // ✅ 통일
    minHeight: clamp(scale(58), 56, 72),      // ✅ 세로 높이 확실히 키움
    paddingHorizontal: clamp(scale(18), 16, 22),
    fontSize: clamp(scale(18), 18, 22),
    textAlign: "center",
    color: "#111",
  },
  primaryButton: {
    width: "88%",
    maxWidth: 520,
    backgroundColor: "#3F6FE3",
    borderRadius: CTA_RADIUS,
    minHeight: clamp(scale(62), 60, 78),      // ✅ 버튼도 높이 안정화
    alignItems: "center",
    justifyContent: "center",
    marginBottom: clamp(scale(14), 12, 20),   // ✅ 설정하기-빠른설정 간격
  },

  primaryButtonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },

  primaryButtonText: {
    fontSize: clamp(scale(22), 22, 28),
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.2,
  },
  quickButton: {
    width: "88%",
    maxWidth: 520,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: INPUT_RADIUS,               // ✅ 입력과 radius 맞춤(요청사항)
    minHeight: clamp(scale(52), 48, 66),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  quickButtonPressed: {
    opacity: 0.9,
  },
  quickButtonText: {
    fontSize: clamp(scale(16), 14, 20),
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
  },
});

export default StartScreen;
