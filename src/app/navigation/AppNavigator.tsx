import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StartScreen from "../../feature/start/StartScreen";
import MainScreen from "../../feature/main/MainScreen";
import HintScreen from "../../feature/hint/HintScreen";
import AnswerScreen from "../../feature/answer/AnswerScreen";
import EndScreen from "../../feature/end/EndScreen";
import { TimerProvider } from "../providers/TimerProvider";
import AdminOverlay from "../../shared/admin/AdminOverlay";
import { BackHandler } from "react-native";
import { loadMapping } from "../../shared/utils/mapping";

/**
 * 앱 전체 화면 전환을 담당하는 최상위 네비게이터
 * - 방탈출 태블릿 앱 특성상 Stack 기반 단순 전환 사용
 * - 뒤로가기는 기본 비활성화 예정 (추후 제어)
 */
const Stack = createNativeStackNavigator();


const AppNavigator = () => {
    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            // ✅ 전역 뒤로가기 차단
            return true;
        });
        return () => sub.remove();
    }, []);

    // 앱실행시 이미지 추가확인 (힌트,정답입력시 동작하는데 빠른 캐싱을위함)
    useEffect(() => {
        loadMapping().catch((e) => console.warn("mapping preload failed:", e));
    }, []);

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
        return () => sub.remove();
    }, []);



    return (
        <TimerProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Start"
                    screenOptions={{
                        headerShown: false,
                        gestureEnabled: false, // ✅ 스와이프 뒤로가기 차단 (iOS/일부 Android)
                    }}
                >
                    <Stack.Screen
                        name="Start"
                        component={StartScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Main"
                        component={MainScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Hint"
                        component={HintScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Answer"
                        component={AnswerScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="End"
                        component={EndScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
                <AdminOverlay />
            </NavigationContainer>
        </TimerProvider>
    );
};

export default AppNavigator;
