import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DurationInput } from "@/components/DurationInput";

describe("DurationInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  const renderComponent = (value: number = 0) => {
    return render(<DurationInput value={value} onChange={mockOnChange} />);
  };

  it("renders with initial value 0 as 00:00:00", () => {
    renderComponent(0);
    expect(screen.getByRole("textbox")).toHaveValue("00:00:00");
  });

  it("renders with non-zero value correctly", () => {
    renderComponent(754);
    expect(screen.getByRole("textbox")).toHaveValue("00:12:34");
  });

  it("types single digit 1", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "1" });
    expect(input).toHaveValue("00:00:01");
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it("types 123 to become 00:01:23", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: "2" });
    fireEvent.keyDown(input, { key: "3" });
    expect(input).toHaveValue("00:01:23");
    expect(mockOnChange).toHaveBeenCalledWith(83);
  });

  it("types 1234 to become 00:12:34", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: "2" });
    fireEvent.keyDown(input, { key: "3" });
    fireEvent.keyDown(input, { key: "4" });
    expect(input).toHaveValue("00:12:34");
    expect(mockOnChange).toHaveBeenCalledWith(754);
  });

  it("backspace from 00:12:34 becomes 00:01:23", () => {
    renderComponent(754);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input).toHaveValue("00:01:23");
    expect(mockOnChange).toHaveBeenCalledWith(83);
  });

  it("select all and type replaces buffer", () => {
    renderComponent(754);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    input.setSelectionRange(0, input.value.length);
    fireEvent.keyDown(input, { key: "5" });
    expect(input).toHaveValue("00:00:05");
    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  it("handles overflow normalization with correct backspace", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "7" });
    fireEvent.keyDown(input, { key: "0" });
    expect(input).toHaveValue("00:01:10");
    expect(mockOnChange).toHaveBeenCalledWith(70);

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input).toHaveValue("00:00:07");
    expect(mockOnChange).toHaveBeenCalledWith(7);
  });

  it("clamps to max duration 23:59:59", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "9" });
    fireEvent.keyDown(input, { key: "9" });
    fireEvent.keyDown(input, { key: "9" });
    fireEvent.keyDown(input, { key: "9" });
    fireEvent.keyDown(input, { key: "9" });
    fireEvent.keyDown(input, { key: "9" });
    expect(input).toHaveValue("23:59:59");
    expect(mockOnChange).toHaveBeenCalledWith(86399);
  });

  it("syncs to external value change", () => {
    const { rerender } = render(<DurationInput value={0} onChange={mockOnChange} />);
    rerender(<DurationInput value={3661} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("01:01:01");
  });

  it("pastes HH:MM:SS format", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "01:30:00" } });
    expect(input).toHaveValue("01:30:00");
    expect(mockOnChange).toHaveBeenCalledWith(5400);
  });

  it("pastes MM:SS format", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "3:45" } });
    expect(input).toHaveValue("00:03:45");
    expect(mockOnChange).toHaveBeenCalledWith(225);
  });

  it("pastes natural duration 1h 20m", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "1h 20m" } });
    expect(input).toHaveValue("01:20:00");
    expect(mockOnChange).toHaveBeenCalledWith(4800);
  });

  it("pastes natural duration 90s", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "90s" } });
    expect(input).toHaveValue("00:01:30");
    expect(mockOnChange).toHaveBeenCalledWith(90);
  });

  it("pastes digits only", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.paste(input, { clipboardData: { getData: () => "1234" } });
    expect(input).toHaveValue("00:12:34");
    expect(mockOnChange).toHaveBeenCalledWith(754);
  });

  it("ignores non-digit keys", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "a" });
    fireEvent.keyDown(input, { key: "." });
    fireEvent.keyDown(input, { key: "," });
    expect(input).toHaveValue("00:00:00");
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("handles delete key same as backspace", () => {
    renderComponent(754);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Delete" });
    expect(input).toHaveValue("00:01:23");
    expect(mockOnChange).toHaveBeenCalledWith(83);
  });

  it("forces cursor to end on focus", () => {
    renderComponent(0);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
  });
});
