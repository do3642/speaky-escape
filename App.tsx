import React from "react";
import { StartScreen } from "./src/features/start/StartScreen";

/**
 * App
 * - 앱 엔트리 포인트
 * - 기능 화면은 feature 단위로 분리하여 연결한다.
 */
export default function App(): React.JSX.Element {
  return <StartScreen />;
}
