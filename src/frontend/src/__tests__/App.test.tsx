import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the project name as the primary heading", () => {
    render(<App />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Common Thread");
  });

  it("renders the project name as visible page content, not a blank screen", () => {
    render(<App />);

    expect(screen.getByText("Common Thread")).toBeVisible();
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("exposes no authentication or extra navigation affordances", () => {
    render(<App />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
