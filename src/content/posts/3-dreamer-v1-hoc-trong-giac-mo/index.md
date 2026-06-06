---
author: Phạm Nhật Khoa
pubDatetime: 2026-05-24T20:00:00+07:00
title: "Dreamer V1: học hành vi bên trong giấc mơ"
slug: dreamer-v1-hoc-trong-giac-mo
featured: true
draft: false
tags:
  - world-models
  - reinforcement-learning
  - dreamer
  - rssm
description: >-
  Giải thích Dreamer V1 (Hafner 2020) theo lối trực giác trước, công thức sau: world model trong không gian ẩn, học hành vi hoàn toàn bằng tưởng tượng, và mẹo pathwise gradient chảy xuyên qua mô hình. Kèm một ví dụ số λ-return chạy tay.
---

## Table of contents

## 0. Vấn đề: vì sao phải "mơ"?

RL không có mô hình (model-free) như DQN hay PPO học bằng cách *thử và sai trong môi trường thật*. Vấn đề: nó **đói mẫu** — cần hàng triệu lần tương tác mới giỏi. Với người ít compute như mình, đó là rào cản lớn.

Ý tưởng cứu cánh đã có từ lâu (Dyna, Sutton 1991): nếu ta học được một **mô hình của thế giới**, ta có thể "tập luyện trong đầu" thay vì tốn tương tác thật. Con người làm thế suốt — bạn tưởng tượng cú đá phạt trước khi sút, diễn lại tình huống trong đầu. Đó là *planning trong tưởng tượng*.

Dreamer V1 (Hafner et al. 2020) đưa ý tưởng này vào deep RL một cách sạch sẽ: học một world model, rồi **huấn luyện toàn bộ policy bên trong những giấc mơ do world model sinh ra** — gần như không cần chạm môi trường thật.

## 1. Ba quyết định cốt lõi

Dreamer V1 đứng trên ba lựa chọn thiết kế:

1. **World model sống trong không gian ẩn (latent) gọn nhẹ**, không phải pixel. Mô hình không mơ ra từng pixel ở mỗi bước tưởng tượng — nó mơ trong một vector trạng thái nén.
2. **Học hành vi hoàn toàn trong tưởng tượng.** Actor (policy) và critic (hàm giá trị) khi cập nhật **không nhìn thấy** môi trường thật — chúng chỉ thấy các chuỗi do world model sinh.
3. **Pathwise gradient chảy xuyên qua world model.** Đây là mẹo then chốt, mình sẽ nói ở §5 — và là điểm phân biệt Dreamer với cả model-free lẫn các world model đời trước.

Giữ trong đầu một câu xuyên suốt bài: **actor chỉ giỏi tới mức world model cho phép.** (Mình đã học bài này theo cách đau thương ở [bài về Atari](/posts/vi-sao-dreamer-mu-truoc-atari).)

## 2. World model = RSSM

Trái tim Dreamer là **RSSM** (Recurrent State-Space Model). Mỗi bước, trạng thái ẩn gồm **hai phần**:

- $h_t$ — phần **xác định** (deterministic), do một GRU mang đi qua thời gian. Hãy hình dung nó là "dòng ký ức" chạy liên tục, gói lại mọi thứ đã xảy ra.
- $z_t$ — phần **ngẫu nhiên** (stochastic), một biến Gaussian. Nó nắm phần *không chắc chắn* của trạng thái: cùng một ký ức $h_t$, thế giới vẫn có thể rẽ nhiều nhánh.

Tách đôi như vậy cho ta cả hai: $h_t$ giữ thông tin dài hạn ổn định, $z_t$ mô hình hóa sự bất định.

### Prior và posterior — mắt mở vs mắt nhắm

Điểm tinh tế nhất của RSSM: $z_t$ được tính theo **hai cách**.

- **Posterior** $q(z_t \mid h_t, o_t)$ — khi **có quan sát** $o_t$. Encoder nhìn vào ảnh/vector thật rồi suy ra trạng thái tốt nhất. Đây là "mắt mở".
- **Prior** $p(z_t \mid h_t)$ — khi **không có quan sát**. Mô hình đoán trạng thái kế tiếp *chỉ từ ký ức* $h_t$. Đây là "mắt nhắm" — và đây chính là chế độ dùng khi *mơ*.

Khi huấn luyện world model, ta ép prior và posterior **gần nhau** (qua một số hạng KL). Vì sao? Để lúc mơ (chỉ có prior, mắt nhắm), giấc mơ không trôi xa khỏi thực tế (posterior, mắt mở từng thấy). Nếu prior dở, mơ một hồi là lạc vào thế giới ảo tưởng.

## 3. Học world model: ba thứ phải đoán đúng

World model học bằng cách xem lại các chuỗi đã lưu trong bộ nhớ (replay buffer) và tối ưu một hàm mất mát gồm **ba số hạng** (đây là ELBO mở rộng qua thời gian — họ hàng với VAE):

$$
\mathcal{L}_{\text{model}} = \underbrace{\text{recon}}_{\text{tái tạo quan sát}} + \underbrace{\text{reward}}_{\text{đoán phần thưởng}} + \beta \underbrace{\text{KL}}_{\text{prior} \approx \text{posterior}}
$$

Trực giác từng phần:

- **Recon** — từ trạng thái ẩn, decoder phải dựng lại được quan sát. Đây là "neo thực tại": ép latent thật sự chứa thông tin về thế giới.
- **Reward** — từ trạng thái ẩn, đoán đúng phần thưởng. Đây là điểm **mới so với World Models của Ha & Schmidhuber** (ở đó mô hình thị giác không biết gì về reward). Có số hạng này, latent học cách mã hóa "điều gì là tốt".
- **KL** — kéo prior (mắt nhắm) về gần posterior (mắt mở), để giấc mơ đáng tin.

> Một cảnh báo mình học được khi tự code: số hạng KL hay đi kèm mẹo **free nats** (chỉ phạt KL khi vượt một ngưỡng sàn). Đặt sàn *cao hơn* KL tự nhiên của bài toán → gradient KL bị triệt tiêu → world model học latent kém. Mình từng để return cheetah-run nghẽn ở 449 chỉ vì free nats quá cao; hạ xuống đúng mức → 646. Chi tiết ở [bài thực nghiệm](/posts/vi-sao-dreamer-mu-truoc-atari).

## 4. Học hành vi trong giấc mơ

Khi world model đủ tốt, Dreamer **không** dùng môi trường thật để luyện policy. Thay vào đó:

1. Lấy một loạt trạng thái thật (qua posterior) làm **điểm xuất phát**.
2. Từ mỗi điểm, **tưởng tượng** $H = 15$ bước về phía trước: actor chọn action, prior (mắt nhắm) sinh trạng thái kế, reward predictor đoán phần thưởng. Toàn bộ trong latent, không pixel, không môi trường.
3. Trên chuỗi tưởng tượng đó, tính một mục tiêu giá trị rồi cập nhật actor và critic.

### λ-return: trộn ngắn hạn và dài hạn

Để ước lượng "chuỗi tưởng tượng này tốt đến đâu", Dreamer dùng **λ-return** — trung bình có trọng số của các ước lượng n-bước, cân bằng giữa thiên lệch (bias) và phương sai (variance).

Cho dễ hình dung, chạy tay một ví dụ nhỏ ($H=3$, $\gamma=0.99$, $\lambda=0.95$):

- Phần thưởng tưởng tượng: $(r_0, r_1, r_2) = (1, 1, 1)$.
- Giá trị critic: $v(s_1)=4.5,\ v(s_2)=5,\ v(s_3)=5$.

Các ước lượng n-bước (mỗi cái nhìn xa hơn một chút rồi "chốt" bằng critic):

$$
V^1 = 1 + 0.99\cdot 4.5 = 5.455
$$
$$
V^2 = 1 + 0.99 + 0.99^2\cdot 5 = 6.890
$$
$$
V^3 = 1 + 0.99 + 0.99^2 + 0.99^3\cdot 5 = 7.821
$$

λ-return trộn chúng lại, ưu tiên nhìn xa nhưng vẫn neo bằng bootstrap:

$$
V_\lambda(s_0) = (1-\lambda)\big[\lambda^0 V^1 + \lambda^1 V^2\big] + \lambda^2 V^3 = 7.658
$$

So sánh: Monte Carlo thuần ($V^3$) = $7.821$, TD(0) thuần ($V^1$) = $5.455$. λ-return $= 7.658$ **gần MC** (vì $\lambda=0.95$ cao) nhưng vẫn pha chút bootstrap để bớt phương sai. Đây đúng tinh thần: nhìn xa nhưng đừng tin giấc mơ dài quá mức.

### Actor và critic chia nhau một tín hiệu

Cả hai dùng *cùng* $V_\lambda$, nhưng xử lý khác nhau:

- **Critic** học để **dự đoán** $V_\lambda$: $\mathcal{L}_{\text{critic}} = \big(v(s_\tau) - \text{sg}(V_\lambda)\big)^2$ (sg = stop-gradient, coi target là cố định).
- **Actor** học để **làm $V_\lambda$ lớn lên**: $\mathcal{L}_{\text{actor}} = -V_\lambda$.

## 5. Mẹo then chốt: pathwise gradient

Đây là chỗ Dreamer khác biệt thật sự, và cũng là chỗ đẹp nhất.

Trong model-free (PPO, REINFORCE), môi trường là **hộp đen không khả vi** — bạn không thể lấy đạo hàm của phần thưởng theo action. Nên họ phải dùng *score function* (REINFORCE): ước lượng gradient bằng cách lấy mẫu, phương sai cao.

Dreamer thì khác: **world model là một mạng neural — hoàn toàn khả vi.** Nghĩa là $V_\lambda$ phụ thuộc vào phần thưởng và giá trị tưởng tượng, mà những thứ đó khả vi theo trạng thái $s_t$, trạng thái khả vi theo action $a_{t-1}$ (nhờ reparameterization), và action khả vi theo tham số actor.

Hệ quả: gradient **chảy thẳng xuyên qua $H$ bước tưởng tượng**, từ giá trị cuối cùng ngược về từng quyết định của actor:

$$
\nabla_\psi \mathcal{L}_{\text{actor}} = -\sum_\tau \frac{\partial V_\lambda}{\partial s_\tau}\cdot\frac{\partial s_\tau}{\partial a_{\tau-1}}\cdot\frac{\partial a_{\tau-1}}{\partial \psi} + \ldots
$$

Đây là tín hiệu học **giàu hơn nhiều** so với REINFORCE: thay vì "action này dẫn tới điểm cao, làm nó nhiều hơn", actor nhận được "*đẩy action theo hướng này thì giá trị tăng*" — một vector gradient trực tiếp. Đó là lý do Dreamer hiệu quả mẫu cao.

(Để so sánh: World Models của Ha & Schmidhuber dùng CMA-ES — tối ưu không cần gradient; Dreamer thay nó bằng gradient chảy qua mô hình.)

## 6. Ba vòng lặp, gói lại

Toàn bộ Dreamer V1 chạy ba vòng lặp đan xen:

| Vòng | Làm gì | Đụng môi trường thật? |
|---|---|---|
| **1. Tương tác** | Chạy policy hiện tại trong env, lưu chuỗi vào buffer | Có |
| **2. Học world model** | Lấy chuỗi từ buffer, tối ưu recon + reward + KL | Không (chỉ buffer) |
| **3. Học hành vi** | Tưởng tượng $H$ bước, tính λ-return, cập nhật actor + critic | **Không** (hoàn toàn trong mơ) |

Vòng 1 tốn tương tác thật (thứ đắt đỏ), nên Dreamer cố làm ít. Vòng 2 và 3 — phần "luyện trong đầu" — chạy nhiều mà gần như miễn phí. Đó là nguồn gốc của sample-efficiency.

## 7. Kết

Dreamer V1 là một bản tổng hợp đẹp: VAE (cho latent) + RSSM (cho thời gian) + actor-critic (cho hành vi) + pathwise gradient (cho hiệu quả), ráp lại thành một hệ thống học chơi bằng cách *mơ*.

Nếu bạn đã theo tới đây, bạn đã có đủ để đọc câu chuyện mình **tự tay cho Dreamer V1 chạy trên 5 môi trường** — và phát hiện nó học rực rỡ ở môi trường này nhưng "mù" hoàn toàn ở môi trường khác: [Vì sao Dreamer học được DM Control nhưng mù trước Atari](/posts/vi-sao-dreamer-mu-truoc-atari).

> **Câu cất.** Dreamer không học bằng cách sống nhiều hơn, mà bằng cách *mơ* nhiều hơn — nhưng giấc mơ chỉ hữu ích khi world model trung thực với thực tại. Toàn bộ kỹ thuật của nó, suy cho cùng, là để giữ cho giấc mơ đừng nói dối.
