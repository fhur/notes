import jsdom, { JSDOM } from "jsdom";
import fs from "fs";

export function readHtml(path: string) {
  const buffer = fs.readFileSync(path);
  const dom = new jsdom.JSDOM(buffer);

  return dom;
}

export function setTitle() {}

export function appendStylesheet(dom: JSDOM, href: string) {
  const elLink = dom.window.document.createElement("link");
  elLink.rel = "stylesheet";
  elLink.type = "text/css";
  elLink.href = "../../app.css";

  dom.window.document.head.appendChild(elLink);
}
