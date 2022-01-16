import React from "react";
import { render, screen } from "@testing-library/react";
import Teams from "../Teams";

test("component is rendered with accordions closed", () => {
  render(<Teams />);
  expect(screen.getByRole("button", { expanded: false }));
});
