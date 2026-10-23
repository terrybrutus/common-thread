import {readFile} from "node:fs/promises";
import {URL as NodeURL} from "node:url";
import {expect, it} from "vitest";

it("bounds the document horizontally while retaining vertical pan and pinch zoom", async () => {
  const css = await readFile(new NodeURL("../index.css", import.meta.url), "utf8");
  expect(css).toMatch(/html,\s*body\s*\{[^}]*max-width: 100%;[^}]*overflow-x: clip;[^}]*overscroll-behavior-x: none;/s);
  expect(css).toContain("touch-action: pan-y pinch-zoom");
  expect(css).not.toContain("touch-action: none");
  expect(css).toContain("html:has(dialog:modal)");
  expect(css).toContain("font-size: 16px");
  expect(css).toContain("overflow-wrap: anywhere");
  expect(css).toMatch(/\.site-footer\s*\{[^}]*flex-direction: column;[^}]*align-items: center;[^}]*text-align: center;/s);
});
