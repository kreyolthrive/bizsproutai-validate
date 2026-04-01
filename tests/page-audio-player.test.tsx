import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractNarrationText,
  PageAudioPlayer,
} from "@/components/PageAudioPlayer";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/en/blog/example",
}));

class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  onend: null | (() => void) = null;
  onerror: null | (() => void) = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe("extractNarrationText", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("collects readable page content and skips ignored regions", () => {
    document.body.innerHTML = `
      <div id="page-content">
        <h1>Page heading</h1>
        <p>First paragraph.</p>
        <div data-audio-ignore="true">
          <p>Do not read this.</p>
        </div>
        <ul>
          <li>Key point one</li>
          <li>Key point two</li>
        </ul>
      </div>
    `;

    const root = document.querySelector("#page-content");
    expect(root).not.toBeNull();

    const narration = extractNarrationText(root!);

    expect(narration).toContain("Page heading");
    expect(narration).toContain("First paragraph.");
    expect(narration).toContain("Key point one");
    expect(narration).not.toContain("Do not read this.");
  });
});

describe("PageAudioPlayer", () => {
  beforeEach(() => {
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("renders automatically for page content and controls playback", async () => {
    const speechSynthesisMock = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };

    vi.stubGlobal("speechSynthesis", speechSynthesisMock);

    const user = userEvent.setup();

    render(
      <>
        <PageAudioPlayer locale="en" />
        <div id="page-content">
          <h1>Article heading</h1>
          <p>
            This page has enough content to trigger the shared audio player
            automatically for testing purposes.
          </p>
          <p>
            The player should read the text shown on the page without requiring
            per-page wiring.
          </p>
        </div>
      </>
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Listen" })).toBeEnabled()
    );

    await user.click(screen.getByRole("button", { name: "Listen" }));
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Playing audio.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(speechSynthesisMock.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Audio paused.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(speechSynthesisMock.resume).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Playing audio.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Speed: 1x" }));
    expect(screen.getByRole("button", { name: "Speed: 1.15x" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(speechSynthesisMock.cancel).toHaveBeenCalled();
    expect(screen.getByText("Audio ready.")).toBeInTheDocument();
  });
});
