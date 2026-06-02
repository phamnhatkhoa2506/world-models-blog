import { defineAstroPaperConfig } from "./src/types/config";

// Khi đã có GitHub repo: đổi `url` thành "https://<github-username>.github.io/<repo-name>/"
// và đồng bộ `base` trong astro.config.ts.
export default defineAstroPaperConfig({
  site: {
    url: "https://phamnhatkhoa2506.github.io/world-models-blog/",
    title: "World Models & RL — Notes của Khoa",
    description:
      "Hành trình tự học World Models và Reinforcement Learning hướng nghiên cứu — note, deep-dive, và companion paper, viết bằng tiếng Việt.",
    author: "Phạm Nhật Khoa",
    profile: "https://github.com/",
    ogImage: "default-og.jpg",
    lang: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/" },
    { name: "mail", url: "mailto:mizuneko2311@gmail.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
