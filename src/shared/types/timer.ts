export type TimerPhase = "idle" | "running" | "paused" | "stopped" | "ended";

export type TimerState = {
  phase: TimerPhase;

  /** 설정된 전체 시간(ms) */
  totalMs: number;

  /** 실행 시작 시각(ms epoch) */
  startAtMs: number | null;

  /** 마지막 tick 기준으로 누적된 경과(ms) */
  elapsedMs: number;

  /** 종료 시각(ms epoch) */
  endAtMs: number | null;
};
