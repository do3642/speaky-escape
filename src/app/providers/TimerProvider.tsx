import React, { createContext, useCallback, useMemo, useState } from "react";
import type { TimerState } from "../../shared/types/timer";
import { getRemainingMs } from "../../shared/utils/timerUtils";

type TimerContextValue = {
  timer: TimerState;

  /** set*: 값 명시 설정 */
  setTotalMs: (ms: number) => void;

  /** handle*: 이벤트 처리 */
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleStop: () => void;

  /** get*: 조회 */
  getRemaining: () => number;
};

const initialTimer: TimerState = {
  phase: "idle",
  totalMs: 0,
  startAtMs: null,
  elapsedMs: 0,
  endAtMs: null,
};

export const TimerContext = createContext<TimerContextValue | null>(null);

/**
 * TimerProvider
 * - 타이머 도메인 상태의 단일 소스
 * - Start/Main/End 등 여러 화면에서 동일 상태를 사용
 */
export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState<TimerState>(initialTimer);

  const setTotalMs = useCallback((ms: number) => {
    setTimer((prev) => ({
      ...prev,
      totalMs: ms,
      phase: "idle",
      startAtMs: null,
      elapsedMs: 0,
      endAtMs: null,
    }));
  }, []);

  const handleStart = useCallback(() => {
    setTimer((prev) => {
      // 이미 running이면 중복 시작 방지
      if (prev.phase === "running") return prev;

      return {
        ...prev,
        phase: "running",
        startAtMs: Date.now(),
        endAtMs: null,
      };
    });
  }, []);

  const handlePause = useCallback(() => {
    setTimer((prev) => {
      if (prev.phase !== "running" || prev.startAtMs === null) return prev;

      const now = Date.now();
      const delta = now - prev.startAtMs;

      return {
        ...prev,
        phase: "paused",
        startAtMs: null,
        elapsedMs: prev.elapsedMs + delta,
      };
    });
  }, []);

  const handleResume = useCallback(() => {
    setTimer((prev) => {
      if (prev.phase !== "paused") return prev;

      return {
        ...prev,
        phase: "running",
        startAtMs: Date.now(),
      };
    });
  }, []);

  const handleStop = useCallback(() => {
    setTimer((prev) => {
      // 중단 시점의 elapsed 확정
      const now = Date.now();
      const delta =
        prev.phase === "running" && prev.startAtMs ? now - prev.startAtMs : 0;

      return {
        ...prev,
        phase: "stopped",
        startAtMs: null,
        elapsedMs: prev.elapsedMs + delta,
        endAtMs: now,
      };
    });
  }, []);

  const getRemaining = useCallback(() => getRemainingMs(timer), [timer]);

  const value = useMemo<TimerContextValue>(
    () => ({
      timer,
      setTotalMs,
      handleStart,
      handlePause,
      handleResume,
      handleStop,
      getRemaining,
    }),
    [timer, setTotalMs, handleStart, handlePause, handleResume, handleStop, getRemaining]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
