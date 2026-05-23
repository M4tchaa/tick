import { renderHook, act } from "@testing-library/react";
import { useScenes } from "@/hooks/useScenes";

describe("useScenes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty scenes", () => {
    const { result } = renderHook(() => useScenes());
    expect(result.current.scenes).toEqual([]);
    expect(result.current.activeScene).toBeNull();
  });

  it("adds a scene", () => {
    const { result } = renderHook(() => useScenes());

    act(() => {
      result.current.addScene({
        name: "Test Scene",
        durationSeconds: 300,
        advanceMode: "manual",
      });
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].name).toBe("Test Scene");
    expect(result.current.scenes[0].durationSeconds).toBe(300);
    expect(result.current.scenes[0].id).toBeDefined();
  });

  it("updates a scene", () => {
    const { result } = renderHook(() => useScenes());

    act(() => {
      result.current.addScene({
        name: "Original",
        durationSeconds: 300,
        advanceMode: "manual",
      });
    });

    const sceneId = result.current.scenes[0].id;

    act(() => {
      result.current.updateScene(sceneId, { name: "Updated" });
    });

    expect(result.current.scenes[0].name).toBe("Updated");
  });

  it("deletes a scene", () => {
    const { result } = renderHook(() => useScenes());

    act(() => {
      result.current.addScene({
        name: "To Delete",
        durationSeconds: 300,
        advanceMode: "manual",
      });
    });

    const sceneId = result.current.scenes[0].id;

    act(() => {
      result.current.deleteScene(sceneId);
    });

    expect(result.current.scenes).toHaveLength(0);
  });

  it("goToNext returns false when no scenes", () => {
    const { result } = renderHook(() => useScenes());

    let success = false;
    act(() => {
      success = result.current.goToNext();
    });

    expect(success).toBe(false);
  });

  it("goToPrev returns false when no scenes", () => {
    const { result } = renderHook(() => useScenes());

    let success = false;
    act(() => {
      success = result.current.goToPrev();
    });

    expect(success).toBe(false);
  });

  it("resets all", () => {
    const { result } = renderHook(() => useScenes());

    act(() => {
      result.current.addScene({ name: "Scene 1", durationSeconds: 300, advanceMode: "manual" });
    });

    expect(result.current.scenes).toHaveLength(1);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.scenes).toHaveLength(0);
    expect(result.current.activeSceneIndex).toBe(0);
  });

  it("setActiveSceneIndex ignores invalid index", () => {
    const { result } = renderHook(() => useScenes());

    act(() => {
      result.current.addScene({ name: "Scene 1", durationSeconds: 300, advanceMode: "manual" });
    });

    act(() => {
      result.current.setActiveSceneIndex(-1);
    });

    expect(result.current.activeSceneIndex).toBe(0);

    act(() => {
      result.current.setActiveSceneIndex(10);
    });

    expect(result.current.activeSceneIndex).toBe(0);
  });
});
