import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Trang chủ",
    posts: "Bài viết",
    tags: "Chủ đề",
    about: "Giới thiệu",
    archives: "Lưu trữ",
    search: "Tìm kiếm",
  },
  post: {
    publishedAt: "Đăng",
    updatedAt: "Cập nhật",
    sharePostIntro: "Chia sẻ bài này:",
    sharePostOn: "Chia sẻ qua {{platform}}",
    sharePostViaEmail: "Chia sẻ qua email",
    tagLabel: "Chủ đề",
    backToTop: "Lên đầu trang",
    goBack: "Quay lại",
    editPage: "Sửa trang",
    previousPost: "Bài trước",
    nextPost: "Bài kế",
  },
  pagination: {
    prev: "Trước",
    next: "Kế",
    page: "Trang",
  },
  home: {
    socialLinks: "Liên hệ",
    featured: "Bài chọn lọc",
    recentPosts: "Bài gần đây",
    allPosts: "Tất cả bài viết",
  },
  footer: {
    copyright: "Bản quyền",
    allRightsReserved: "Mọi quyền được bảo lưu.",
  },
  pages: {
    tagTitle: "Chủ đề",
    tagDesc: "Tất cả bài có chủ đề",

    tagsTitle: "Chủ đề",
    tagsDesc: "Mọi chủ đề được dùng.",

    postsTitle: "Bài viết",
    postsDesc: "Tất cả bài đã đăng.",

    archivesTitle: "Lưu trữ",
    archivesDesc: "Mọi bài đã lưu trữ.",

    searchTitle: "Tìm kiếm",
    searchDesc: "Tìm bài viết bất kỳ…",
  },
  a11y: {
    skipToContent: "Bỏ qua tới nội dung",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    toggleTheme: "Đổi chế độ sáng/tối",
    searchPlaceholder: "Tìm bài viết…",
    noResults: "Không có kết quả",
    goToPreviousPage: "Trang trước",
    goToNextPage: "Trang kế",
  },
  notFound: {
    title: "404 — Không tìm thấy",
    message: "Trang này không tồn tại",
    goHome: "Về trang chủ",
  },
} satisfies UIStrings;
