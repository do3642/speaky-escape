import { useContext } from "react";
import { TimerContext } from "../../app/providers/TimerProvider";

/**
 * use*: React Hook 전용
 */
export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
};
