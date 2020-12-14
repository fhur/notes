import path from "path";
import { outDir } from "./constants";
import { appendStylesheet, readHtml } from "./html";

export type ArticleConfig = {
  title: string;
  createdAt: string;
  summary?: string;
};

export type Article = {
  pathToIndexHtml: string;
  htmlFiles: string;

  /**
   * The path to the directory where this article lives
   */
  dir: string;

  config: ArticleConfig;
};

function capitalize(str: string) {
  const [first, ...remaining] = str.split("");
  return first.toUpperCase() + remaining.join("");
}

export function getTitle(article: Article) {
  const parts = article.dir.split("/");

  return parts[parts.length - 1].split("-").map(capitalize).join(" ");
}

export function getCreatedAt(article: Article) {
  return article.config.createdAt;
}

export function href(article: Article) {
  return path.join(article.dir, "index.html");
}

export function absolutePath(article: Article) {
  return path.join(outDir, href(article));
}

export function applyHtmlRewrites(article: Article) {
  const dom = readHtml(article.pathToIndexHtml);

  // set the title
  dom.window.document.title = getTitle(article);

  // import the app.css
  appendStylesheet(dom, "/app.css");

  return dom;
}
