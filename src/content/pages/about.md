---
title: "Giới thiệu"
description: "Về Khoa và blog World Models & RL"
---

Xin chào, mình là **Phạm Nhật Khoa**.

Blog này là nhật ký công khai cho hành trình tự học **World Models** và **Reinforcement Learning** hướng nghiên cứu khoa học, bắt đầu từ tháng 5/2026. Mình viết để:

- Buộc bản thân hiểu sâu — viết được mới chắc là hiểu.
- Lưu lại tài liệu tham chiếu cho chính mình các session sau.
- Chia sẻ với cộng đồng người học RL tiếng Việt — vốn còn ít tài liệu sâu.

## Triết lý viết

- **Trực giác trước, công thức sau.** Không nhảy bước toán. Mọi $\sum$ đều khai triển ít nhất một lần.
- **Ví dụ số chạy tay** mỗi khi giới thiệu cơ chế mới (TD error, eligibility trace, KL divergence, λ-return…).
- **Math ↔ implementation.** Mỗi term toán học → dòng code PyTorch tương ứng.
- Math-weak pedagogy: viết cho người mạnh ý niệm RL, yếu thao tác toán hình thức.

## Bối cảnh

Lộ trình 5 phase:

| Phase | Nội dung |
|---|---|
| 0 — Warm-up | DQN + PPO trên CartPole/LunarLander |
| 1 — Origin | Ha & Schmidhuber 2018 (VAE + MDN-RNN + CMA-ES) |
| 2 — PlaNet | RSSM + CEM planning trên DM Control |
| 3 — Dreamer V1→V3 | Actor-critic in imagination, discrete latents |
| 4 — Research branch | MuZero / TD-MPC2 / generative WM |

Mỗi note theo thứ tự `00`, `01`, … nối với nhau. Blog post sẽ là bản polish của các note này.

## Liên hệ

GitHub, email — xem footer.
