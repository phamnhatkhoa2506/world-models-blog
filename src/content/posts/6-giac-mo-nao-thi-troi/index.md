---
author: Phạm Nhật Khoa
pubDatetime: 2026-06-05T08:00:00+07:00
title: "Giấc mơ nào thì trôi: tôi đi kiểm lời giải thích của chính mình"
slug: giac-mo-nao-thi-troi
featured: true
draft: false
tags:
  - world-models
  - reinforcement-learning
  - dreamer
  - research
description: >-
  Ở bài trước tôi nói giấc mơ của agent không trôi xa "vì môi trường tuần hoàn". Nhưng đó chỉ là một lời giải thích sau khi thấy kết quả. Bài này tôi đi kiểm nó — và tìm ra một môi trường nơi giấc mơ vỡ tung gấp 75 lần. Câu chuyện về việc kiểm một giả thuyết của chính mình, và vì sao điều đó giải thích một quyết định kiến trúc của Dreamer 4.
---

## Table of contents

## 0. Một lời giải thích chưa được kiểm

Ở [bài trước](/world-models-blog/posts/5-mo-dai-co-troi-khong/mo-dai-co-troi-khong/) tôi
đo "độ trôi" của giấc mơ mà world model tự dựng: cho nó nhìn một quan sát, rồi bắt nó mơ
tiếp 30 bước mà không nhìn gì nữa, và so giấc mơ với thực tế. Kết quả bất ngờ: trên môi
trường cheetah chạy, sai số **không** nổ — nó dao động quanh một mức thấp, lên rồi tụt
theo nhịp.

Tôi giải thích cú tụt đó bằng *tính tuần hoàn*: dáng chạy lặp lại, nên dù giấc mơ lệch
pha, cứ mỗi chu kỳ nó lại "gặp lại" trạng thái thật.

Nghe hợp lý. Nhưng tôi phải thành thật với mình: **đó là một lời giải thích đưa ra *sau
khi* đã thấy kết quả.** Và lời giải thích kiểu đó rẻ tiền — gần như chuyện gì xảy ra tôi
cũng bịa được một câu chuyện nghe xuôi tai. Vậy làm sao biết nó *đúng*, chứ không chỉ
*nghe xuôi*?

> Một lời giải thích chỉ thành kiến thức khi nó **dự đoán được điều mình chưa thấy**. Nếu
> "tuần hoàn tự sửa lỗi" là thật, thì ở một môi trường *không* tuần hoàn, cú tụt kia phải
> **biến mất** — sai số sẽ chỉ có một chiều: đi lên.

Đó là một dự đoán *bác bỏ được*. Nên tôi đi kiểm.

## 1. Cách kiểm: bắt chính mình sai nếu mình sai

Tôi chọn bốn môi trường, chia hai nhóm:

- **Tuần hoàn** (chuyển động lặp lại): cheetah chạy, walker đi.
- **Không tuần hoàn** (làm một việc rồi dừng): reacher với tay tới đích, cartpole hất con
  lắc lên rồi giữ thăng bằng.

Rồi đo cùng một đường "độ trôi theo bước" trên cả bốn, giữ mọi thứ khác y hệt. Câu hỏi
sắc lẹm: **nhóm tuần hoàn có cú tụt (dao động), nhóm không tuần hoàn thì không — đúng
không?**

Tôi viết dự đoán ra giấy *trước khi chạy*, kèm điều kiện thế nào là sai: nếu môi trường
*không* tuần hoàn mà vẫn dao động, thì lời giải thích của tôi sụp đổ. Viết trước nghĩa là
sau khi thấy số tôi không được phép sửa câu chuyện cho khớp.

## 2. Cái bẫy suýt làm tôi kết luận sai

Khi kết quả về, có một con số chặn tôi lại: reacher (với tay tới đích) đạt điểm ~95–187
trên thang 1000. Tức là nó **gần như không học được**.

Điều này quan trọng, vì nếu world model còn chưa học xong môi trường, thì giấc mơ của nó
trôi *vì model dở*, chứ không phải vì môi trường không tuần hoàn. Hai nguyên nhân khác
nhau hoàn toàn. May là tôi đã cài sẵn một cột "điểm số" để kiểm tra đúng chuyện này từ
trước — nên tôi **loại reacher ra khỏi kết luận**, thay vì hớn hở chỉ vào sai số nổ của
nó như "bằng chứng".

> Đây là một loại kỷ luật tôi đang học: phân biệt "kết quả thú vị" với "thí nghiệm hỏng".
> Một con số sốc (sai số nổ!) rất dễ làm mình phấn khích — nhưng nếu nền tảng của nó (model
> đã học chưa) không vững thì con số đó vô nghĩa. Biết vứt dữ liệu xấu đi cũng quan trọng
> như biết đọc dữ liệu tốt.

Sau khi loại reacher, bài kiểm sạch còn lại: cheetah + walker (tuần hoàn, học tốt) so với
cartpole (không tuần hoàn, học ổn).

## 3. Dự đoán đúng — và rồi một bất ngờ lớn hơn

**Phần dự đoán: đúng y như viết trên giấy.** Tôi đếm số "cú tụt" trong mỗi đường:

| Nhóm | Môi trường | Số cú tụt |
|---|---|---|
| Tuần hoàn | cheetah chạy | 8 |
| Tuần hoàn | walker đi | 8–11 |
| Không tuần hoàn | cartpole | **0** |

Tách bạch hoàn toàn. Môi trường tuần hoàn dao động (8–11 cú tụt); cartpole đơn điệu, không
một cú tụt nào. Lời giải thích của tôi vừa **dự đoán đúng trên môi trường nó chưa từng
thấy**. Đó là khoảnh khắc một câu chuyện "nghe xuôi tai" biến thành một mẩu kiến thức.

**Nhưng phần bất ngờ mới là phần hay.** Tôi cứ tưởng cartpole sẽ "lên rồi phẳng" — vì nó
hất con lắc lên rồi *giữ yên*, mà giữ yên thì dễ đoán. Sai. Sai số của cartpole không
phẳng — nó **vỡ tung**: gấp 18 đến 75 lần sau 30 bước, trong khi cheetah/walker chỉ quanh
1–2.6 lần.

Vì sao "giữ thăng bằng" lại làm giấc mơ vỡ? Vì điểm thăng bằng của cartpole là **bất ổn
định**. Con lắc dựng ngược giống một cây bút bạn dựng trên đầu ngón tay: lệch một li là đổ
một dặm. Trong giấc mơ, một sai số góc cực nhỏ ở bước đầu sẽ được khuếch đại lên ở mỗi
bước sau — và sau 30 bước, con lắc mơ đã ngã về một hướng hoàn toàn khác con lắc thật.

> So sánh hai cực:
> - **Cheetah** = con lắc *thả xuôi*. Đẩy lệch thì nó tự đung đưa về. Sai số bị kéo về —
>   giấc mơ tự sửa.
> - **Cartpole** = cây bút *dựng ngược*. Đẩy lệch thì nó đổ luôn. Sai số bị khuếch đại —
>   giấc mơ phân kỳ.
>
> Hai con vật, hai số phận của giấc mơ — và cả hai chạy trên *cùng một đoạn code* của tôi.

Một chi tiết tôi thấy đẹp: dù *trạng thái* của cartpole trong mơ vỡ tung, *phần thưởng* dự
đoán vẫn chính xác suốt 30 bước. Bởi phần thưởng là một hàm thô (con lắc đang đứng hay đã
đổ), bền với kiểu lệch chi tiết. Trạng thái có thể loạn, mà tín hiệu học vẫn còn dùng được
— đúng điều tôi đã thấy ở bài trước.

## 4. Vì sao chuyện này giải thích Dreamer 4

Nhớ lại: Dreamer 4 (DeepMind, 2025) đổi sang một cách dự đoán mới (*x-prediction*) **để
chống compounding error**, cho phép mơ dài tùy ý mà không vỡ. Ở [bài
trước](/world-models-blog/posts/5-mo-dai-co-troi-khong/mo-dai-co-troi-khong/) tôi đã hỏi:
nếu thế thì vì sao ở cheetah của tôi nó *không* vỡ? Giờ tôi có cả hai mảnh:

- Compounding error **không cắn** khi môi trường có cơ chế tự-neo (chu kỳ ổn định như
  cheetah).
- Compounding error **cắn thật** khi không có cơ chế đó (điểm bất ổn như cartpole — hay
  Minecraft của Dreamer 4: không tuần hoàn, chuỗi hành động dài 24.000 bước, không có gì
  kéo giấc mơ về).

Nói cách khác, cartpole vỡ tung trong thí nghiệm 8 đô của tôi chính là **mô hình thu nhỏ**
của vấn đề mà Dreamer 4 phải dùng kiến trúc 2 tỉ tham số để giải. Tôi không reproduce được
Dreamer 4 — nhưng tôi *hiểu được điều kiện* khiến kỹ thuật của nó trở nên thiết yếu, thay
vì thừa. Và đó, với một người ít tài nguyên, là một vị trí tốt để đứng cạnh frontier.

## 5. Ba thí nghiệm, một câu hỏi tự lớn lên

Nhìn lại, ba dự án nghiên cứu nhỏ của tôi nối thành một chuỗi mà mỗi cái đẻ ra cái sau:

1. [Free nats](/world-models-blog/posts/4-free-nats-hai-co-che-hong/free-nats-hai-co-che-hong/):
   nghịch một hyperparameter, học cách làm thí nghiệm có kỷ luật.
2. [Mơ dài có trôi không](/world-models-blog/posts/5-mo-dai-co-troi-khong/mo-dai-co-troi-khong/):
   compounding error *không* cắn ở cheetah — *nhưng tại sao?*
3. Bài này: *vì* tuần hoàn — và đây là chỗ nó *cắn* thật.

Điều tôi tự hào nhất không phải kết quả nào cụ thể, mà là: lần này câu hỏi **tự lớn lên**.
Tôi không lên kế hoạch trước cho dự án thứ ba; nó nảy ra vì dự án thứ hai để lại một lời
giải thích chưa được kiểm. Tôi nghĩ đó là dấu hiệu mình đang thật sự *làm* nghiên cứu, chứ
không chỉ làm bài tập có sẵn đáp án.

Tất nhiên vẫn còn lỗ hổng thành thật: reacher hỏng nên nhóm "không tuần hoàn" của tôi mới
có một thành viên chắc chắn (cartpole). Để nói mạnh về *cả nhóm* tôi cần thêm một môi
trường không tuần hoàn mà học được. Đó là việc của lần sau.

## 6. Kết

Tôi bắt đầu với một nỗi nghi: lời giải thích "tuần hoàn tự sửa lỗi" của tôi có thật không,
hay chỉ là chuyện kể cho êm tai? Cách duy nhất để biết là cho nó một cơ hội *sai* — và nó
sống sót. Đổi lại, tôi được một thứ giá trị hơn cả lời khẳng định: tôi biết *khi nào* giấc
mơ của một agent sẽ trôi, và vì sao. Giấc mơ không trôi vì nó là giấc mơ; nó trôi khi thế
giới không có gì kéo nó về.

> **Câu cất.** Đừng tin lời giải thích của chính mình cho tới khi bạn cho nó một cơ hội
> sai. Tôi bảo giấc mơ của cheetah không trôi "vì tuần hoàn" — rồi đi tìm một con lắc dựng
> ngược để bắt mình sai, và thay vào đó thấy giấc mơ vỡ tung đúng như lời giải thích tiên
> đoán. Một cây bút dựng trên ngón tay dạy tôi vì sao Dreamer 4 cần đổi kiến trúc cho
> Minecraft mà tôi thì không cần cho con cheetah đang chạy.
