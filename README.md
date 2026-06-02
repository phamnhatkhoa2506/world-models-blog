# Blog — World Models & RL

Static blog cho hành trình học World Models + RL của Khoa. Build trên
**Astro 6 (AstroPaper template) + Tailwind v4 + KaTeX + Pagefind**, deploy
lên GitHub Pages qua GitHub Actions.

> Đây là sub-project trong workspace `WORLD_MODELS_&_RL`. Quy ước dài hạn
> ở `../CLAUDE.md`. Note study thô ở `../notes/`; blog post là bản polish
> đã được biên tập riêng.

## Yêu cầu môi trường

- **Node.js 22+** (template yêu cầu `>=22.12.0`, kiểm tra `node --version`).
- **npm 10+** (kèm Node 22).
- **Git** (đã có).

## Lệnh thường dùng

```bash
# Cài deps (lần đầu hoặc khi đổi package.json)
npm install

# Dev server, hot reload, mở http://localhost:4321/world-models-blog/
npm run dev

# Build production → dist/
npm run build

# Xem trước bản build
npm run preview

# Format
npm run format

# Lint
npm run lint
```

## Cấu trúc thư mục

```
blog/
├── astro.config.ts            — config Astro (markdown, fonts, i18n, base path)
├── astro-paper.config.ts      — branding (title, author, socials, features)
├── package.json
├── scripts/
│   └── postbuild-pagefind.mjs — cross-platform copy pagefind output
├── src/
│   ├── content/
│   │   ├── posts/             — Bài viết .md / .mdx, frontmatter có schema
│   │   └── pages/             — Trang tĩnh: about, …
│   ├── components/            — Astro components (Card, Header, …)
│   ├── layouts/Layout.astro   — Khung HTML chung, link KaTeX CSS
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css          — design tokens, font variables
│   │   └── typography.css     — prose, code block, KaTeX prose color
│   └── pages/                 — Route files (index, posts/[slug], tags/, …)
└── public/                    — Static assets (favicon, og default, …)
```

## Thêm post mới

Tạo file `src/content/posts/<slug>.md` (hoặc `.mdx` nếu muốn nhúng component
Astro/React vào markdown). Frontmatter tối thiểu:

```yaml
---
author: Phạm Nhật Khoa
pubDatetime: 2026-05-24T14:00:00+07:00
title: "Tiêu đề bài"
slug: ten-slug-khong-dau          # optional, mặc định lấy từ filename
featured: false                   # true để đẩy lên section featured ở index
draft: false                      # true để skip khi build (chỉ thấy trong dev)
tags:
  - reinforcement-learning
description: >-
  Mô tả 1-3 câu cho SEO + thẻ OG.
---
```

Trong nội dung, math inline dùng `$E=mc^2$`, math block dùng `$$ ... $$`
trên dòng riêng. KaTeX render khi build.

Để **đưa một note từ `notes/NN-*.md` lên blog**: copy nội dung → thêm
frontmatter → polish phần mở đầu cho người chưa đọc các note trước → kiểm
tra link nội bộ (đổi `[[name]]` thành link blog hoặc bỏ).

## Đổi giao diện / branding

- **Title, author, socials, share buttons**: `astro-paper.config.ts`.
- **Màu accent / background light & dark**: `src/styles/theme.css`
  (block `:root[data-theme="light"]` và `[data-theme="dark"]`).
- **Font**: `astro.config.ts` mục `fonts: [...]` + `src/styles/theme.css`
  biến `--font-app`, `--font-mono`. Hiện đặt body = Be Vietnam Pro, code =
  Google Sans Code.
- **Prose typography / code block / KaTeX**: `src/styles/typography.css`.

## Deploy GitHub Pages

Workflow ở `../.github/workflows/deploy-blog.yml`. Trigger: push `main`
hoặc đổi file trong `blog/**`. Các bước Khoa cần làm **một lần**:

1. **Init git ở workspace root** (nếu chưa):

   ```bash
   cd D:\Programming\Python\WORLD_MODELS_&_RL
   git init -b main
   git add .
   git commit -m "Initial commit: notes + blog scaffold"
   ```

2. **Tạo repo GitHub** (giả sử tên `world-models-blog`), push:

   ```bash
   git remote add origin https://github.com/<username>/world-models-blog.git
   git push -u origin main
   ```

3. **Vào Settings → Pages → Source = GitHub Actions**.

4. **Đồng bộ tên repo**:
   - `astro-paper.config.ts` → `site.url = "https://<username>.github.io/world-models-blog/"`
   - `astro.config.ts` → `const BASE_PATH = "/world-models-blog/";`
   - Nếu deploy lên **user page** (`<username>.github.io`) thì đặt
     `BASE_PATH = "/"`.

5. Push lại; GitHub Actions sẽ build + deploy. Site live sau ~2-3 phút.

## Triết lý nội dung

Theo `../CLAUDE.md` §4 (math-weak pedagogy):

- Trực giác + ẩn dụ trước công thức.
- Khai triển mọi bước, không nhảy.
- Luôn có ví dụ số chạy tay.
- Nối math ↔ code khi áp dụng được.

## Sự cố thường gặp

- **`npm run dev` lỗi font**: lần đầu Astro download Google Fonts cần
  network. Kiểm tra firewall/proxy.
- **Math không render**: kiểm tra `astro.config.ts` có `remarkMath` +
  `rehypeKatex` chưa, và `Layout.astro` có link KaTeX CSS chưa.
- **GH Pages 404 với asset**: kiểm tra `BASE_PATH` đã khớp tên repo chưa.
- **Build pass local nhưng fail CI**: thường do file bị Windows tạo có
  case khác (Windows insensitive, Linux sensitive). Đổi import path cho
  khớp filename thực tế.

## Tham chiếu

- AstroPaper template gốc: <https://github.com/satnaing/astro-paper>
- Astro docs: <https://docs.astro.build>
- KaTeX symbols: <https://katex.org/docs/supported.html>
- Pagefind (search): <https://pagefind.app>
