import type { TimerState } from "../types/timer";

/**
 * 불리언 판단 규칙: is*
 */
export const isRunning = (timer: TimerState) => timer.phase === "running";
export const isPaused = (timer: TimerState) => timer.phase === "paused";
export const isEnded = (timer: TimerState) => timer.phase === "ended";

/**
 * get*: 동기 조회
 * - 남은 시간(ms) 계산
 */
export const getRemainingMs = (timer: TimerState) => {
  const remaining = timer.totalMs - timer.elapsedMs;
  return remaining > 0 ? remaining : 0;
};

/**
 * format*: 출력용 변환
 * - mm:ss 형태(기본) / 필요하면 hh:mm:ss 확장 가능
 */
export const formatRemaining = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};
