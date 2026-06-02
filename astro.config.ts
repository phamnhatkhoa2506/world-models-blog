import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

// Đổi `base` khi tạo GH Pages repo. Nếu deploy lên user-page
// (https://<user>.github.io/) thì để base = "/". Nếu là project-page
// (https://<user>.github.io/<repo>/) thì đặt = "/<repo>/".
const BASE_PATH = "/world-models-blog/";

export default defineConfig({
  site: config.site.url,
  base: BASE_PATH,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["vi"],
    defaultLocale: "vi",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          strict: false,
          trust: true,
        },
      ],
    ],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
    {
      name: "Be Vietnam Pro",
      cssVariable: "--font-be-vietnam-pro",
      provider: fontProviders.google(),
      fallbacks: ["sans-serif"],
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
      subsets: ["vietnamese", "latin"],
    },
    {
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      provider: fontProviders.google(),
      fallbacks: ["Georgia", "serif"],
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
      subsets: ["vietnamese", "latin"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
