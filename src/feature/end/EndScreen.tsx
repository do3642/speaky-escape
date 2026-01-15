import React, { useMemo } from "react";
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any, "End">;

const EndScreen = (_: Props) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const styles = useMemo(() => createStyles(isLandscape), [isLandscape]);

  // ✅ 세로: 배경 한 장으로 끝(겹침 제거)
  if (!isLandscape) {
    return (
      <ImageBackground
        source={require("../../../assets/images/bgEnd.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.dim} />
      </ImageBackground>
    );
  }

  // ✅ 가로: 포스터(contain) + 사이드 안내
  return (
    <ImageBackground
      source={require("../../../assets/images/bgEnd.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.dim} />

      <View style={styles.content}>
        <View style={styles.posterArea}>
          <Image
            source={require("../../../assets/images/bgEnd.png")}
            style={styles.poster}
            resizeMode="contain"
          />
        </View>

        <View style={styles.sideArea}>
          <Text style={styles.title}>게임 종료</Text>
          <Text style={styles.desc}>
            제한 시간이 종료되었습니다.{"\n"}
            이용해 주셔서 감사합니다.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const createStyles = (isLandscape: boolean) =>
  StyleSheet.create({
    bg: { flex: 1 },

    dim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isLandscape
        ? "rgba(0,0,0,0.18)"
        : "rgba(0,0,0,0.12)",
    },

    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
      gap: 14,
    },

    posterArea: {
      width: "62%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    poster: {
      width: "100%",
      height: "100%",
    },

    sideArea: {
      width: "38%",
      height: "100%",
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.88)",
      padding: 16,
      justifyContent: "center",
      gap: 10,
    },

    title: {
      fontSize: 22,
      fontWeight: "800",
      color: "rgba(0,0,0,0.78)",
      textAlign: "center",
    },

    desc: {
      fontSize: 14,
      lineHeight: 20,
      color: "rgba(0,0,0,0.62)",
      textAlign: "center",
    },
  });

export default EndScreen;
