// feature/answer/AnswerScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCodeImage } from "../../shared/hooks/useCodeImage";
import { Platform } from "react-native";

/**
 * Answer Screen (PDF 스타일)
 * - 메인 배경 유지 + 딤 + 중앙 카드(정답 이미지)만 표시
 * - 입력은 Main에서 받는다(코드는 route params로 전달)
 * - 타이머는 TimerProvider가 유지되면 계속 흐른다(표시만 안 함)
 *
 * UX:
 * - 바깥(딤 영역) 터치 or 하드웨어 Back -> 닫고 Main으로 복귀
 */

const DEFAULT_ASPECT = 0.72; // 비율 측정 실패 시 fallback
const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const AnswerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Main에서 넘어온 코드 (예: XA001)
  const codeParam: string = useMemo(() => {
    const raw = route?.params?.code ?? "";
    return String(raw).trim().toUpperCase();
  }, [route?.params?.code]);

  const { image, errorText, isLoading, handleSubmitCode, reset } =
    useCodeImage("answer");

  /**
   * 진입 시:
   * - Main에서 전달된 codeParam으로 즉시 로드
   */
  useEffect(() => {
    if (!codeParam) return;
    reset();
    handleSubmitCode(codeParam);
  }, [codeParam, reset, handleSubmitCode]);

  /**
   * 하드웨어 Back 처리
   */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const handleClose = () => navigation.goBack();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  /**
   * 카드 사이즈 정책
   * - 퍼센트 기반이지만 계산은 px로 고정해 흔들림을 줄인다.
   */
  const cardMaxWidth = isLandscape ? 980 : 860;
  const cardWidthPx = Math.min(width * (isLandscape ? 0.86 : 0.92), cardMaxWidth);

  /**
   * 카드 padding(16*2)을 제외한 실제 이미지 영역 폭
   */
  const cardInnerWidth = Math.max(0, cardWidthPx - 32);

  /**
   * 이미지 박스가 사용할 수 있는 최대 높이(화면 기반 clamp)
   * - 태블릿 가로모드(특히 A7 Lite)에서 세로형 이미지가 너무 길어져 화면을 넘는 걸 방지
   */
  const imageMaxHeight = Math.min(Math.round(height * 0.80), 740);
  const imageAvailableHeight = Math.max(180, imageMaxHeight);

  /**
   * 이미지 원본 비율(width/height)을 측정해, 컨테이너 비율을 하드코딩하지 않는다.
   */
  const [imageAspect, setImageAspect] = useState<number>(DEFAULT_ASPECT);

  const loadImageAspect = (nextImage: typeof image) => {
    // 극단 비율 방지(너무 납작/너무 길쭉하면 UI가 흔들릴 수 있음)
    const setSafeAspect = (aspect: number) => {
      const safe = clampNumber(aspect || DEFAULT_ASPECT, 0.3, 2.0);
      setImageAspect(safe);
    };

    if (nextImage.type === "asset") {
      const resolved = Image.resolveAssetSource(nextImage.source);
      if (resolved?.width && resolved?.height) {
        setSafeAspect(resolved.width / resolved.height);
      } else {
        setSafeAspect(DEFAULT_ASPECT);
      }
      return;
    }

    if (nextImage.type === "file") {
      Image.getSize(
        nextImage.uri,
        (w, h) => setSafeAspect(w / h),
        () => setSafeAspect(DEFAULT_ASPECT)
      );
      return;
    }

    // none / 기타 케이스
    setSafeAspect(DEFAULT_ASPECT);
  };

  useEffect(() => {
    let isCancelled = false;

    if (isCancelled) return;
    loadImageAspect(image);

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  /**
   * 카드 폭 기준으로 이상적인 높이를 만들고,
   * 화면 높이를 넘기면 clamp하여 안전하게 잘라준다.
   */
  const imageBoxHeight = useMemo(() => {
    const idealHeight = cardInnerWidth / imageAspect;
    return Math.min(idealHeight, imageAvailableHeight);
  }, [cardInnerWidth, imageAspect, imageAvailableHeight]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bg: { flex: 1 },
        dim: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.35)",
        },

        backdrop: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
        },

        card: {
          width: cardWidthPx, // % 대신 px로 고정(레이아웃 계산 일관성)
          maxWidth: cardMaxWidth,
          backgroundColor: "rgba(255,255,255,0.98)",
          borderRadius: 12,
          padding: 16,
          elevation: 8,
        },

        helperText: {
          textAlign: "center",
          marginVertical: 5,
          color: "rgba(0,0,0,0.65)",
          fontSize: 14,
        },
        error: { color: "#d32f2f" },

        /**
         * ✅ 핵심:
         * - aspectRatio를 고정하지 않는다.
         * - 측정한 원본 비율 기반으로 "height"를 계산해 적용한다.
         */
        imageBox: {
          width: "100%",
          height: imageBoxHeight,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,1)",
        },

        image: {
          width: "100%",
          height: "100%",
        },

        emptyBox: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        emptyText: {
          color: "rgba(0,0,0,0.55)",
          fontSize: 14,
        },
        footer: {
          marginTop: 12,
          alignItems: "center",
          justifyContent: "center",
        },

        backButton: {
          width: "100%",
          height: 44,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.06)",
        },

        backButtonPressed: {
          opacity: Platform.OS === "ios" ? 0.75 : 1,
        },

        backButtonText: {
          fontSize: 15,
          fontWeight: "700",
          color: "rgba(0,0,0,0.70)",
        },

      }),
    [cardWidthPx, cardMaxWidth, imageBoxHeight]
  );

  return (
    <ImageBackground
      source={require("../../../assets/images/bgMain.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.dim} />

      {/* 바깥 터치로 닫기 */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        {/* 카드 영역은 터치 이벤트를 먹도록 별도 wrapper */}
        <Pressable style={styles.card} onPress={() => { }}>
          {isLoading && <Text style={styles.helperText}>불러오는 중…</Text>}
          {!!errorText && (
            <Text style={[styles.helperText, styles.error]}>{errorText}</Text>
          )}

          <View style={styles.imageBox}>
            {image.type === "file" && (
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}

            {image.type === "asset" && (
              <Image
                source={image.source}
                style={styles.image}
                resizeMode="contain"
              />
            )}

            {image.type === "none" && !isLoading && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>표시할 정답이 없습니다.</Text>
              </View>
            )}
          </View>

          <Text style={styles.helperText}>
            화면 바깥을 누르거나 아래 버튼을 누르면 돌아갑니다.
          </Text>

          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.08)" }}
            >
              <Text style={styles.backButtonText}>돌아가기</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </ImageBackground>
  );
};

export default AnswerScreen;
