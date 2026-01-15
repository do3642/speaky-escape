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
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCodeImage } from "../../shared/hooks/useCodeImage";

const DEFAULT_ASPECT = 0.72; // fallback (너무 극단적인 값 말고 안전값)

const HintScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const codeParam: string = useMemo(() => {
    const raw = route?.params?.code ?? "";
    return String(raw).trim().toUpperCase();
  }, [route?.params?.code]);

  const { image, errorText, isLoading, handleSubmitCode, reset } =
    useCodeImage("hint");

  useEffect(() => {
    if (!codeParam) return;
    reset();
    handleSubmitCode(codeParam);
  }, [codeParam, reset, handleSubmitCode]);

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

  // ✅ 카드 폭(실수치) 계산: "percent + maxWidth"를 숫자로 환산해서 내부 계산에 사용
  const cardMaxWidth = isLandscape ? 980 : 860;
  const cardWidthPx = Math.min(width * (isLandscape ? 0.86 : 0.92), cardMaxWidth);

  // 카드 padding(16 * 2) 반영한 실제 이미지 영역 폭
  const cardInnerWidth = Math.max(0, cardWidthPx - 32);

  // 상단 로딩/에러 텍스트 + 카드 padding 등을 감안한 "이미지 박스가 쓸 수 있는 최대 높이"
  // (필요하면 120 값을 조금 조정)
  const imageMaxHeight = Math.min(Math.round(height * 0.80), 740);
  const imageAvailableHeight = Math.max(180, imageMaxHeight); // 최소 높이 안전장치

  // ✅ 이미지 원본 비율 state
  const [imageAspect, setImageAspect] = useState<number>(DEFAULT_ASPECT);

  // ✅ asset/file 모두에서 원본 비율을 구해 세팅
  useEffect(() => {
    let cancelled = false;

    const setSafe = (ar: number) => {
      if (cancelled) return;
      // 극단값 방지(너무 납작/너무 길쭉하면 레이아웃이 또 흔들림)
      const clamped = Math.min(Math.max(ar || DEFAULT_ASPECT, 0.3), 2.0);
      setImageAspect(clamped);
    };

    if (image.type === "asset") {
      const resolved = Image.resolveAssetSource(image.source);
      if (resolved?.width && resolved?.height) setSafe(resolved.width / resolved.height);
      else setSafe(DEFAULT_ASPECT);
    }

    if (image.type === "file") {
      Image.getSize(
        image.uri,
        (w, h) => setSafe(w / h),
        () => setSafe(DEFAULT_ASPECT)
      );
    }

    if (image.type === "none") {
      setSafe(DEFAULT_ASPECT);
    }

    return () => {
      cancelled = true;
    };
  }, [image]);

  // ✅ “width에 맞춘 높이”를 계산하되, 화면 높이를 넘기지 않도록 clamp
  const imageBoxHeight = useMemo(() => {
    const ideal = cardInnerWidth / imageAspect; // width / (w/h) = height
    return Math.min(ideal, imageAvailableHeight);
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
          width: cardWidthPx, // ✅ 이제 % 대신 px 고정(계산 일관성)
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

        // ✅ 핵심: aspectRatio를 고정하지 않고, 계산된 height로 박스 크기 제어
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

      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => { }}>
          {isLoading && <Text style={styles.helperText}>불러오는 중…</Text>}
          {!!errorText && (
            <Text style={[styles.helperText, styles.error]}>{errorText}</Text>
          )}

          <View style={styles.imageBox}>
            {image.type === "file" && (
              <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
            )}
            {image.type === "asset" && (
              <Image source={image.source} style={styles.image} resizeMode="contain" />
            )}
            {image.type === "none" && !isLoading && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>표시할 힌트가 없습니다.</Text>
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

export default HintScreen;
