import path from "path";
import { outDir } from "./constants";
import { appendStylesheet, readHtml } from "./html";

export type Article = {
  index: string;
  htmlFiles: string;
  dir: string;
  name: string;
};

function capitalize(str: string) {
  const [first, ...remaining] = str.split("");
  return first.toUpperCase() + remaining.join("");
}

export function getTitle(article: Article) {
  const parts = article.dir.split("/");

  return parts[parts.length - 1].split("-").map(capitalize).join(" ");
}

export function href(article: Article) {
  return path.join(article.dir, "index.html");
}

export function absolutePath(article: Article) {
  return path.join(outDir, href(article));
}

export function applyHtmlRewrites(article: Article) {
  const dom = readHtml(article.index);

  // set the title
  dom.window.document.title = getTitle(article);

  // import the app.css
  appendStylesheet(dom, "/app.css");

  return dom;
}
