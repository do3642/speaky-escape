import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useTimer } from "../../shared/hooks/useTimer";
import { getRemainingMs, isRunning } from "../../shared/utils/timerUtils";
import { Dimensions } from "react-native";


const { width: W, height: H } = Dimensions.get("window");
const MIN_SIDE = Math.min(W, H);
const IS_TABLET = MIN_SIDE >= 600;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const UI_SCALE = clamp(MIN_SIDE / 390, 1, IS_TABLET ? 1.55 : 1.2);
const TIME_FONT_SIZE = 86 * UI_SCALE;
const HOURGLASS_SIZE = Math.round(TIME_FONT_SIZE * 0.62);


/**
 * 남은 시간을 "MM:SS.XX"로 고정 길이(8글자)로 쪼개서 반환합니다.
 * - 자리폭을 고정해도 문자열 길이가 일정해야 흔들림이 없습니다.
 * - 1/100초(centisecond) 단위로 내림 처리합니다.
 */
const formatCharsMmSsCs = (ms: number) => {
  const safe = Math.max(0, ms);
  const csTotal = Math.floor(safe / 10);

  const mm = Math.floor(csTotal / 6000);
  const ss = Math.floor((csTotal % 6000) / 100);
  const xx = csTotal % 100;

  const mmText = String(mm).padStart(2, "0");
  const ssText = String(ss).padStart(2, "0");
  const xxText = String(xx).padStart(2, "0");

  // 항상 8글자: "MM:SS.XX"
  return `${mmText}:${ssText}.${xxText}`.split("");
};

/**
 * Main Screen
 * - 배경 이미지 + 모래시계 아이콘 + 남은 시간 + 힌트 코드 입력 + 확인하기(이미지 버튼)
 * - "두 덩어리"로 중앙 정렬:
 *   [모래시계, 시간]  (marginBottom으로 아래 덩어리와 간격)
 *   [힌트코드 입력, 확인하기]
 *
 * UI 목표:
 * 1) 숫자 폭 흔들림 제거: 문자 단위 고정 폭 렌더
 * 2) 폰/태블릿 동일한 느낌: wrapper에서 width 92% + maxWidth
 * 3) 소수점(XX) 포함해 동일 폰트 크기 유지
 * 4) 과도한 렌더 비용 방지: 100ms tick(10fps)로 절충
 */
const MainScreen = ({ navigation }: any) => {
  const { timer, handleStart } = useTimer();

  // 화면 표시용 tick (실제 시간 계산 기준은 timer state)
  const [tick, setTick] = useState(0);

  // 힌트 코드 입력값
  const [hintCode, setHintCode] = useState("");

  /**
   * Main 진입 시 자동 시작
   * - totalMs가 있고 idle이면 시작
   * - StrictMode/재렌더 환경에서 중복 호출 가능성이 있어 조건을 엄격히 둠
   */
  useEffect(() => {
    const shouldAutoStart = timer.totalMs > 0 && timer.phase === "idle";
    if (!shouldAutoStart) return;

    handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.totalMs, timer.phase]);

  /**
   * 1/100초 표현을 위해 100ms(10fps)로 tick
   * - JS 리렌더 빈도를 지나치게 높이지 않으면서도 자연스럽게 보이는 수준
   */
  useEffect(() => {
    if (!isRunning(timer)) return;

    const id = setInterval(() => {
      setTick((v) => v + 1);
    }, 100);

    return () => clearInterval(id);
  }, [timer]);

  /**
   * 남은 시간(ms)
   * - running 상태에서는 startAtMs 기준으로 "가상 elapsed"를 합산해 계산합니다.
   * - store(timer)가 single source of truth
   */
  const remainingMs = useMemo(() => {
    if (timer.phase === "running" && timer.startAtMs) {
      const delta = Date.now() - timer.startAtMs;
      const virtualTimer = { ...timer, elapsedMs: timer.elapsedMs + delta };
      return getRemainingMs(virtualTimer);
    }
    return getRemainingMs(timer);
  }, [timer, tick]);

  /**
   * 종료 처리
   * - remainingMs가 0이 되면 End 화면으로 전환
   */
  useEffect(() => {
    if (remainingMs === 0 && timer.totalMs > 0) {
      navigation.replace("End");
    }
  }, [remainingMs, timer.totalMs, navigation]);

  /**
   * 시간 문자열을 문자 배열로 변환
   * - 자리 폭 고정 렌더를 위해 split("")
   */
  const timeChars = useMemo(() => formatCharsMmSsCs(remainingMs), [remainingMs]);

  // 확인 버튼 활성 조건
  const canConfirm = hintCode.trim().length > 0;

  /**
   * 힌트 코드 확인
   * - 힌트 코드면 Hint 화면, 정답 코드면 Answer 화면으로 분기될 예정(추후)
   * - 현재는 Hint로만 넘김
   */
  const handleConfirmCode = () => {
    if (!canConfirm) return;

    Keyboard.dismiss();

    const code = hintCode.trim().toUpperCase();
    setHintCode("");

    const isAnswer = /^XA\d{3}$/.test(code);
    const isHint = /^XH\d{3}$/.test(code);

    if (isAnswer) {
      navigation.navigate("Answer", { code });
      return;
    }

    if (isHint) {
      navigation.navigate("Hint", { code });
      return;
    }

    // 둘 다 아니면 Hint로 보내지 말고(UX) 에러 처리(토스트/알럿) 권장
  };


  return (
    <ImageBackground
      source={require("../../../assets/images/bgMain.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* 전체 딤: 배경 가독성 확보 */}
      <View style={styles.dim} />

      <View style={styles.container}>
        {/* ✅ 중앙 정렬용 wrapper: 폰/태블릿 동일한 느낌의 폭 정책 */}
        <View style={styles.contentWrap}>
          {/* ✅ 덩어리 1: 모래시계 + 시간 */}
          <View style={styles.timerGroup}>
            <View style={styles.timerRow}>
              <Image
                source={require("../../../assets/images/iconHourglass.png")}
                style={styles.hourglass}
                resizeMode="contain"
              />

              <View style={styles.timeCharsWrap}>
                {timeChars.map((ch, idx) => (
                  <Text
                    key={`${idx}-${ch}`}
                    style={[
                      styles.timeChar,
                      ch === ":" && styles.timeColon,
                      ch === "." && styles.timeDot,
                    ]}
                  >
                    {ch}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* ✅ 덩어리 2: 힌트코드 입력 + 확인하기 */}
          <View style={styles.actionGroup}>
            <View style={styles.inputWrap}>
              <TextInput
                value={hintCode}
                onChangeText={setHintCode}
                placeholder="힌트 코드를 입력하세요."
                placeholderTextColor="rgba(0,0,0,0.55)"
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleConfirmCode}
              />
            </View>

            <Pressable
              onPress={handleConfirmCode}
              disabled={!canConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && canConfirm && styles.pressed,
                !canConfirm && styles.disabled,
              ]}
            >
              <Image
                source={require("../../../assets/images/btnConfirm.png")}
                style={styles.confirmImage}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },

  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  /**
   * 화면 전체 레이아웃
   * - 중앙 정렬: 두 덩어리를 합친 contentWrap이 화면 중앙에 위치
   */
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  /**
   * 폰/태블릿 공용 폭 정책
   * - width 92%로 양 옆 여백 확보
   * - maxWidth를 태블릿에서 너무 좁아 보이지 않게 640 정도로 설정
   */
  contentWrap: {
    width: "92%",
    maxWidth: IS_TABLET ? 860 : 640,
    alignItems: "center",
  },

  /**
   * 덩어리 1: 타이머 영역
   * - 덩어리 간 간격은 marginBottom 하나로 제어
   */
  timerGroup: {
    width: "100%",
    alignItems: "center",
    marginBottom: 56,
  },

  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  hourglass: {
    width: HOURGLASS_SIZE,
    height: HOURGLASS_SIZE,
  },

  timeCharsWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },

  /**
   * 시간 문자 렌더
   * - width 고정으로 "숫자 변화에 따른 폭 흔들림"을 제거
   * - 소수점도 동일 폰트 크기 유지
   */
  timeChar: {
    fontSize: Math.round(86 * UI_SCALE),
    color: "#E8D39A",
    fontFamily: "digital-7",
    includeFontPadding: false,
    width: Math.round(40 * UI_SCALE),
    textAlign: "center",

    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // 구두점은 폭을 살짝 줄여서 자연스럽게(선택)
  timeColon: { width: Math.round(26 * UI_SCALE) },
  timeDot: { width: Math.round(26 * UI_SCALE) },

  /**
   * 덩어리 2: 입력 + 확인 버튼
   */
  actionGroup: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },

  inputWrap: {
    width: "100%",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,

    minHeight: Math.round(64 * UI_SCALE),   // ✅ 세로 높이 확실히 증가
    paddingHorizontal: 18,
    fontSize: Math.round(18 * UI_SCALE),
    textAlign: "center",
    color: "#111",
    elevation: 2,
  },


  /**
   * 확인 버튼
   * - 이미지가 배경에 묻히는 것을 막기 위해 약한 받침 배경을 추가
   * - overflow hidden으로 이미지가 radius 안에서 깔끔하게 보이게 처리
   */
  confirmButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.18)",
    elevation: 6,
  },

  confirmImage: {
    width: "100%",
    height: Math.round(80 * UI_SCALE),
  },

  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },

  disabled: {
    opacity: 0.55,
  },
});

export default MainScreen;
