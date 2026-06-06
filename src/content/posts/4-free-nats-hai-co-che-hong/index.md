---
author: Phạm Nhật Khoa
pubDatetime: 2026-06-04T20:00:00+07:00
title: "Một hyperparameter, hai cách hỏng: dự án nghiên cứu đầu tiên của tôi"
slug: free-nats-hai-co-che-hong
featured: true
draft: false
tags:
  - world-models
  - reinforcement-learning
  - dreamer
  - research
description: >-
  Một con số nhảy 44% khi tôi đổi đúng một hyperparameter (free nats) trong Dreamer. Thay vì hài lòng, tôi biến nó thành một thí nghiệm có kỷ luật — và phát hiện free nats hỏng theo HAI cơ chế khác nhau ở hai đầu. Đây là câu chuyện dự án nghiên cứu đầu tiên của tôi, kể cả kết quả lẫn cách làm.
---

## Table of contents

## 0. Một con số nhảy bất ngờ

Khi tôi cho Dreamer V1 (tự viết) chạy trên cheetah-run của DM Control, nó nghẽn ở mức return ~450/1000. Tôi đổi **đúng một** hyperparameter — `free_nats` từ 3.0 xuống 1.0 — và return nhảy lên **646**. Tăng 44% chỉ từ một dòng.

Phản xạ đầu tiên là hài lòng và đi tiếp. Nhưng tôi dừng lại và tự hỏi: *tại sao?* Và quan trọng hơn — đây là cơ hội để lần đầu làm một **thí nghiệm nghiên cứu cho ra hồn**, thay vì "chỉnh hyperparameter cho tới khi đẹp". Bài này kể lại nó: cả kết quả, cả cách tôi học để làm research.

> Lưu ý thành thật về quy mô: đây là một study nhỏ (một môi trường, vài seed). Nó **không** phải khám phá chấn động. Giá trị của nó là (a) một hiểu biết cụ thể về free nats, và (b) một minh họa *cách* làm research khi bạn ít tài nguyên. Tôi cố không thổi phồng.

## 1. Free nats là gì

Dreamer học một world model bằng cách (một phần) tối thiểu hóa **KL divergence** giữa hai phân phối latent: *prior* (đoán trạng thái khi nhắm mắt) và *posterior* (suy ra trạng thái khi nhìn quan sát). KL này kéo hai bên về gần nhau.

Vấn đề: nếu phạt KL quá tay, latent có thể *sụp về vô dụng* (posterior collapse). Mẹo **free nats** đặt một ngưỡng sàn: chỉ phạt phần KL vượt sàn.

$$
\text{kl\_loss} = \max(\text{FREE\_NATS},\ \text{KL})
$$

Trực giác: cho model một "hạn mức KL miễn phí". Dưới hạn mức thì không phạt; trên thì phạt. Câu hỏi của tôi: **đặt hạn mức đó bao nhiêu, và tại sao nó quan trọng đến thế?**

## 2. Làm research, không phải nghịch hyperparameter

Sai lầm số một của người mới (tôi suýt mắc): chạy thử một đống giá trị, nhìn cái nào đẹp, rồi kể một câu chuyện hợp lý quanh nó. Đó không phải research — đó là *kể chuyện sau khi thấy kết quả*.

Tôi ép mình làm ngược lại: **viết giả thuyết ra giấy TRƯỚC khi chạy** (preregistration), kèm tiêu chí "thế nào là đúng / sai". Hai giả thuyết:

- **H1 — có sweet spot.** Return là hàm lõm theo free nats: có đỉnh ở giá trị trung gian, tệ ở cả hai đầu. (Đầu cao tôi khá chắc; đầu thấp — free nats = 0 — tôi *không biết*.)
- **H2 — `kl_raw` dự đoán điểm gãy.** Khi free nats vượt KL tự nhiên của bài toán, sàn bắt đầu cắn (trả hằng số → đạo hàm = 0 → nuốt gradient) → return tụt.

Viết trước nghĩa là sau khi thấy số, tôi *không được* sửa giả thuyết cho khớp. Đó là thứ giữ mình trung thực.

## 3. Kết quả: sweet spot có thật

Tôi quét free nats ∈ {0, 0.5, 1, 2, 3, 5}, mỗi giá trị vài seed, đo return tốt nhất (mean ± std):

| free nats | return (best, mean ± std) |
|---|---|
| 0.0 | 458 ± 31 |
| 0.5 | 634 *(1 seed)* |
| 1.0 | **566 ± 86** |
| 2.0 | 477 ± 21 |
| 3.0 | 423 ± 34 |
| 5.0 | 412 ± 7 |

Đường lõm, đỉnh quanh free nats ≈ 1. **H1 đúng.** Đặc biệt, free nats = 0 (phạt KL tối đa) cho return *thấp* — xác nhận đầu thấp cũng tệ, không chỉ đầu cao.

(Một chi tiết tôi sẽ quay lại ở §5: con số 634 ở free nats=0.5 trông như đỉnh, nhưng nó chỉ có 1 seed — và là một seed "may". Đừng vội tin.)

## 4. Khúc ngoặt: `kl_raw` lộ ra HAI cơ chế hỏng

Đây là lúc nghiên cứu trở nên thú vị — khi dữ liệu **bác bỏ một phần** giả thuyết của tôi và cho hiểu biết giàu hơn.

Tôi đo thêm `kl_raw` (KL thật, trước khi bị sàn cắt):

| free nats | 0.0 | 0.5 | 1.0 | 2.0 |
|---|---|---|---|---|
| kl_raw | 1.53 | 1.61 | 2.00 | 2.15 |

Hai điều bất ngờ:

**Bất ngờ 1: `kl_raw` bám theo free nats.** Free nats càng cao, KL tự nhiên càng cao (1.53 → 2.15). Hợp lý khi nghĩ lại: free nats là "hạn mức miễn phạt", nên model thoải mái để KL ngồi quanh đó. Tôi không lường trước điều này khi viết giả thuyết.

**Bất ngờ 2 — và đây là phát hiện chính: hai đầu hỏng vì hai cơ chế KHÁC nhau.** H2 của tôi chỉ đoán một.

- **Đầu cao (free nats ≥ 2) tụt** — *đúng* H2. Ở free nats = 2, sàn (2.0) ≈ kl_raw (2.15) → sàn bắt đầu cắn → nuốt gradient KL → world model học kém → return tụt.
- **Đầu thấp (free nats = 0) tệ** — H2 **không** giải thích được. Ở đây sàn không bao giờ kích hoạt (KL luôn > 0), nên không có chuyện "nuốt gradient". Thủ phạm là cơ chế khác: **over-regularization**. Không có hạn mức miễn phí → mọi nat KL bị phạt → posterior bị ép về prior → latent nghèo thông tin (thấy được: kl_raw bị dìm xuống 1.53) → world model kém → return thấp.

Nói cách khác, free nats cân bằng giữa **hai lỗi đối nghịch**:

```
free nats quá THẤP          free nats vừa          free nats quá CAO
over-regularization    →    latent giàu, KL ~2    ←   sàn nuốt gradient
(posterior nghèo đi)        (sweet spot)              (world model kém học)
       437                      ~650                       412
```

Tồn tại một mức KL "tối ưu" cho latent (~2 nat ở cheetah-run); free nats nên đặt sao cho hạn mức miễn phí nhắm tới mức đó. Đây là hiểu biết tôi *không* có trước thí nghiệm, và thành thật mà nói, sâu hơn cách tôi từng đọc về free nats.

## 5. Ba cái bẫy đọc dữ liệu (phần tôi học nhiều nhất)

Kết quả thì gọn, nhưng *đọc* nó đúng mới khó. Ba lần tôi suýt tự lừa:

**Bẫy 1 — `std = 0` tưởng là bug.** Khi chạy thêm seed mới, bảng in ra std = 0. Tôi tưởng code lỗi. Thật ra: lần chạy đó mỗi giá trị chỉ có *một* seed, mà độ lệch chuẩn của một điểm = 0. Toán đúng, không phải bug. Phân biệt "bug" với "mình hiểu sai số liệu" là một kỹ năng.

**Bẫy 2 — so sánh táo với cam.** Bảng gộp cho free nats = 0.5 mean 634, *trông* cao hơn free nats = 1 (566). Nhưng 0.5 chỉ có 1 seed — và là seed chạy cao ở *mọi* giá trị. So công bằng (cùng seed đó): free nats = 1 (683) > free nats = 0.5 (634). Không thể kết luận 0.5 > 1 từ con số gộp, vì nó bị nhiễu bởi *seed nào đã chạy giá trị nào*.

**Bẫy 3 — cùng seed, khác kết quả.** Cùng một cấu hình (free nats = 1, seed = 42) cho 646 ở một lần chạy và 481 ở lần khác. Tôi tưởng seed khóa chặt kết quả — nhưng các phép tính trên GPU không hoàn toàn deterministic, nên vẫn có biến động run-to-run. "Seed" cố định điểm khởi đầu, *không* cố định toàn bộ. Một nguồn nhiễu nữa phải tính tới.

## 6. Bài học lớn nhất về research

Khi tôi viết H2, tôi nghĩ mình biết câu trả lời (một cơ chế: sàn nuốt gradient). Dữ liệu nói: "đúng một nửa — còn một cơ chế thứ hai mày chưa thấy."

Phản ứng đúng *không* phải thất vọng. Mà là phấn khích — vì nó nghĩa là tôi vừa học được thứ mình *chưa biết*, chứ không chỉ xác nhận thứ đã đoán.

> Một giả thuyết đúng một nửa, cộng với dữ liệu lộ ra cơ chế thứ hai, là kết quả **giàu hơn** cả một giả thuyết đúng hoàn toàn. Research giỏi không phải đoán đúng — mà là để dữ liệu sửa lại hiểu biết của mình một cách trung thực.

Và đó là khác biệt giữa làm research và nghịch hyperparameter: nghịch thì dừng ở "646 đẹp đấy"; research thì hỏi "tại sao", viết giả thuyết trước, đọc dữ liệu honest, và *vui* khi mình sai một phần.

## 7. Kết

Đây là dự án nghiên cứu đầu tiên của tôi, và nó nhỏ: một môi trường, vài seed, một hyperparameter. Tôi không khám phá ra gì làm rung chuyển ngành. Nhưng tôi đã đi trọn một vòng *đúng kỷ luật* — preregister, chạy, đọc trung thực, để dữ liệu sửa giả thuyết — và rút ra một hiểu biết cụ thể: **free nats hỏng theo hai cơ chế đối nghịch, và sweet spot là nơi hạn mức miễn phí gặp mức KL tự nhiên của bài toán.**

Với một người tự học ít tài nguyên, tôi nghĩ đây là loại nghiên cứu khả thi và đáng làm: không cần GPU farm, chỉ cần một câu hỏi hẹp, kỷ luật, và sự trung thực với dữ liệu.

(Nếu bạn muốn biết Dreamer hoạt động ra sao, tôi có [bài giải thích Dreamer V1](/posts/dreamer-v1-hoc-trong-giac-mo); còn câu chuyện tôi cho nó chạy 5 môi trường và đâm vào bức tường compute ở [bài này](/posts/vi-sao-dreamer-mu-truoc-atari).)

> **Câu cất.** Đổi một con số rồi thấy nó tốt lên là may mắn; hỏi *tại sao* và để dữ liệu nói cho mình điều mình chưa biết là nghiên cứu. Free nats dạy tôi rằng ngay cả một hyperparameter tầm thường cũng có thể hỏng theo hai cách đối nghịch — và rằng phần thưởng lớn nhất của một thí nghiệm là lúc nó chứng minh mình đã sai một nửa.
