import * as React from "react";
import { Article, getTitle, href } from "../../model/Article";

type Props = {
  articles: Article[];
};

function Articles(props: { articles: Article[] }) {
  return (
    <div>
      <ul>
        {props.articles.map((article) => {
          return (
            <li key={href(article)}>
              <a href={href(article)}>{getTitle(article)}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Page(props: Props) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="app.css" />
      </head>
      <body>
        <h1>Articles</h1>

        <Articles articles={props.articles} />
      </body>
    </html>
  );
}

export function getPage(props: Props) {
  return <Page {...props} />;
}
