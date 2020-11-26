import jsdom from "jsdom";
import fs from "fs";

export function readHtml(path: string) {
  const buffer = fs.readFileSync(path);
  const dom = new jsdom.JSDOM(buffer);

  return dom;
}

export function setTitle() {}
