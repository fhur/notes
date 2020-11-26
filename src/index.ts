import fs from "fs-extra";
import path from "path";
import {
  absolutePath,
  applyHtmlRewrites,
  Article,
  href,
} from "./model/Article";
import { outDir } from "./model/constants";
import { getPage } from "./components/pages/Page";
import * as ReactDom from "react-dom/server";

/**
 *
 * @param {String} articlePath
 */
function findHtmlFiles(articlePath: string): Article {
  const files = fs
    .readdirSync(articlePath)
    .map((file) => path.join(articlePath, file));
  const index = files.find((file) => file.endsWith(".htm")) || "";
  const htmlFiles = path.join(articlePath, "HTMLFiles/");

  if (!index) {
    console.error(`No .htm file found for ${articlePath}, will ignore.`);
  }

  return {
    dir: articlePath,
    index,
    htmlFiles,
    name: articlePath,
  };
}

function isValidArticleWithPaths({ index, htmlFiles, dir }: Article) {
  return index && fs.existsSync(index);
}

function writeArticleToSite(article: Article) {
  const { index, htmlFiles, dir } = article;
  const articleDirectory = path.join(outDir, dir);
  fs.mkdirSync(articleDirectory, { recursive: true });

  const indexHtmlPath = absolutePath(article);

  fs.writeFileSync(indexHtmlPath, applyHtmlRewrites(article).serialize());
  fs.copySync(htmlFiles, path.join(articleDirectory, "HTMLFiles/"));
}

function main() {
  const articles = fs
    .readdirSync("./articles")
    .map((dir: string) => path.join("./articles", dir));

  const articleWithPaths = articles
    .map(findHtmlFiles)
    .filter(isValidArticleWithPaths);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  fs.rmSync(path.join(outDir, "/articles/"), { recursive: true, force: true });

  const indexOut = ReactDom.renderToStaticMarkup(
    getPage({ articles: articleWithPaths })
  );

  fs.writeFileSync(path.join(outDir, "index.html"), indexOut);

  fs.copyFileSync("src/static/app.css", path.join(outDir, "app.css"));

  articleWithPaths.forEach(writeArticleToSite);
}

main();
