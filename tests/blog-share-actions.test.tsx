import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogShareActions from "@/components/blog/BlogShareActions";

describe("BlogShareActions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders share links for supported platforms", () => {
    render(
      <BlogShareActions
        locale="en"
        title="When Uncertainty Hits, We Need More Humanity"
        excerpt="A reflection on layoffs and resilience."
        url="https://example.com/en/blog/example"
      />
    );

    expect(screen.getByRole("link", { name: "Share on Facebook" })).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com/sharer/sharer.php")
    );
    expect(screen.getByRole("link", { name: "Share on X" })).toHaveAttribute(
      "href",
      expect.stringContaining("twitter.com/intent/tweet")
    );
    expect(screen.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com/sharing/share-offsite")
    );
    expect(screen.getByRole("link", { name: "Share on Threads" })).toHaveAttribute(
      "href",
      expect.stringContaining("threads.net/intent/post")
    );
    expect(screen.getByRole("link", { name: "Follow on Facebook" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/bzsproutai"
    );
    expect(screen.getByRole("link", { name: "Follow on LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/wagner-desir/"
    );
    expect(screen.getByRole("link", { name: "Follow on Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/bizsproutai/"
    );
    expect(screen.getByText("@bzsproutai")).toBeInTheDocument();
    expect(screen.getByText("Wagner Desir")).toBeInTheDocument();
    expect(screen.getByText("@bizsproutai")).toBeInTheDocument();
  });

  it("copies the article URL for Instagram sharing", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(
      <BlogShareActions
        locale="en"
        title="When Uncertainty Hits, We Need More Humanity"
        excerpt="A reflection on layoffs and resilience."
        url="https://example.com/en/blog/example"
      />
    );

    await user.click(screen.getByRole("button", { name: "Instagram share" }));

    expect(writeText).toHaveBeenCalledWith("https://example.com/en/blog/example");
    expect(
      screen.getByText("Article link copied for Instagram sharing.")
    ).toBeInTheDocument();
  });
});
