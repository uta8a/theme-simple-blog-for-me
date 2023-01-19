import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import metas from "lume/plugins/metas.ts";
import pagefind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import readingTime from "https://raw.githubusercontent.com/lumeland/experimental-plugins/main/reading_time/mod.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.1.0/toc/mod.ts";
import ja from "npm:date-fns/locale/ja/index.js";

import type { Page, Site } from "lume/core.ts";

export interface Options {
  prism?: Partial<PrismOptions>;
}

/** Configure the site */
export default function (options: Options = {}) {
  return (site: Site) => {
    site.hooks?.addMarkdownItPlugin?.(toc);
    site.use(postcss())
      .use(basePath())
      .use(prism(options.prism))
      .use(readingTime())
      .use(date({
        locales: { ja },
      }))
      .use(metas())
      .use(resolveUrls())
      .use(slugifyUrls())
      .use(pagefind({ binary: { version: "v0.10.7" } })) // fix issue https://github.com/lumeland/lume/issues/362#issuecomment-1396404347
      .use(terser())
      .use(sitemap())
      .copy("fonts")
      .copy("favicon.png")
      .preprocess([".md"], (page: Page) => {
        page.data.excerpt ??= (page.data.content as string).split(
          /<!--\s*more\s*-->/i,
        )[0];
      });

    // Highlight.js stylesheet
    site.remoteFile(
      "_includes/css/code_dark.css",
      "https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/themes/prism-twilight.min.css",
    );
    site.remoteFile(
      "_includes/css/code_light.css",
      "https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/themes/prism.min.css",
    );
  };
}
