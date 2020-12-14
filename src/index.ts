import assert from "assert";
import fs from "fs-extra";
import path from "path";
import * as ReactDom from "react-dom/server";
import { getPage } from "./components/pages/Page";
import { absolutePath, applyHtmlRewrites, Article } from "./model/Article";
import { outDir } from "./model/constants";

function parseArticleConfig(articlePath: string) {
  const configPath = path.join("./", articlePath, "config.json");

  if (fs.existsSync(configPath)) {
    console.log(articlePath, "✅ loading config.json");
    const config = JSON.parse(fs.readFileSync(configPath).toString());

    assert(config.title);
    assert(config.createdAt);

    return config;
  }

  console.warn(articlePath, "🚨 No config found for " + articlePath);
  return;
}

/**
 *
 * @param {String} articlePath
 */
function findHtmlFiles(articlePath: string): Article {
  console.log(">>-----------------------------------------");
  console.log(articlePath, "Loading Article");

  const files = fs
    .readdirSync(articlePath)
    .map((file) => path.join(articlePath, file));
  const pathToIndexHtml = files.find((file) => file.endsWith(".htm")) || "";
  const htmlFiles = path.join(articlePath, "HTMLFiles/");

  if (!pathToIndexHtml) {
    console.error(articlePath, `🚨 No .htm file found for, will ignore.`);
  } else {
    console.log(articlePath, "✅ found .htm file");
  }

  return {
    dir: articlePath,
    pathToIndexHtml: pathToIndexHtml,
    htmlFiles,
    config: parseArticleConfig(articlePath),
  };
}

function isValidArticleWithPaths({
  pathToIndexHtml: index,
  htmlFiles,
  dir,
}: Article) {
  return index && fs.existsSync(index);
}

function writeArticleToSite(article: Article) {
  const { htmlFiles, dir } = article;
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
