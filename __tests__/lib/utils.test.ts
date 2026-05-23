import { formatTime, clamp, parseMinutesSeconds } from "@/lib/utils";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });

  it("formats 3661 seconds to 01:01:01", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });

  it("formats negative seconds to 00:00:00", () => {
    expect(formatTime(-100)).toBe("00:00:00");
  });

  it("formats 1 hour", () => {
    expect(formatTime(3600)).toBe("01:00:00");
  });

  it("formats 1 minute", () => {
    expect(formatTime(60)).toBe("00:01:00");
  });

  it("formats 1 second", () => {
    expect(formatTime(1)).toBe("00:00:01");
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("parseMinutesSeconds", () => {
  it("parses mm:ss format", () => {
    expect(parseMinutesSeconds("05:30")).toBe(330);
  });

  it("parses m:s format", () => {
    expect(parseMinutesSeconds("5:3")).toBe(303);
  });

  it("handles missing seconds", () => {
    expect(parseMinutesSeconds("5:")).toBe(300);
  });

  it("handles missing minutes", () => {
    expect(parseMinutesSeconds(":30")).toBe(30);
  });

  it("handles empty string", () => {
    expect(parseMinutesSeconds("")).toBe(0);
  });

  it("handles invalid input", () => {
    expect(parseMinutesSeconds("abc")).toBe(0);
  });
});
