import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  let onTimeoutMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    onTimeoutMock = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts with idle status and 0 seconds", () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.status).toBe("idle");
    expect(result.current.remainingSeconds).toBe(0);
  });

  it("resets to specified duration", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.reset(300);
    });

    expect(result.current.remainingSeconds).toBe(300);
    expect(result.current.status).toBe("idle");
  });

  it("adjusts time by positive delta", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.reset(300);
      result.current.adjust(60);
    });

    expect(result.current.remainingSeconds).toBe(360);
  });

  it("adjusts time by negative delta", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.reset(300);
      result.current.adjust(-120);
    });

    expect(result.current.remainingSeconds).toBe(180);
  });

  it("does not go below zero when adjusting", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.reset(60);
      result.current.adjust(-120);
    });

    expect(result.current.remainingSeconds).toBe(0);
  });

  it("plays beep sound", () => {
    const { result } = renderHook(() => useCountdown());

    expect(() => {
      act(() => {
        result.current.playBeep();
      });
    }).not.toThrow();
  });
});
