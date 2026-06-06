---
author: Phạm Nhật Khoa
pubDatetime: 2026-06-04T21:30:00+07:00
title: "Mơ dài có trôi không? Ba giả thuyết sai và một câu trả lời cho Dreamer 4"
slug: mo-dai-co-troi-khong
featured: true
draft: false
tags:
  - world-models
  - reinforcement-learning
  - dreamer
  - research
description: >-
  Dreamer học hành vi hoàn toàn bằng cách "mơ" tương lai trong world model. Câu hỏi tự nhiên: mơ càng dài, giấc mơ có trôi xa thực tế không (compounding error)? Tôi đo trực tiếp hiện tượng đó, đặt ba giả thuyết — và sai cả ba. Nhưng ba cái sai khớp nhau thành câu trả lời cho việc vì sao Dreamer 4 phải đổi kiến trúc.
---

## Table of contents

## 0. Một con vật mơ về chính nó đang chạy

Dreamer học hành vi mà gần như không cần chạm vào môi trường thật. Nó dựng một
*world model* — một mô phỏng bên trong — rồi cho agent "nhắm mắt mơ" tương lai vài
chục bước, và học từ giấc mơ đó. (Tôi đã kể cơ chế này ở [bài Dreamer
V1](/world-models-blog/posts/3-dreamer-v1-hoc-trong-giac-mo/dreamer-v1-hoc-trong-giac-mo/).)

Nhưng có một nỗi lo hiển nhiên. World model dự đoán *một bước* không bao giờ hoàn hảo;
nó luôn lệch một chút. Khi ta bắt nó mơ *nhiều bước liên tiếp*, mỗi bước lại xây trên
sai số của bước trước — sai số có thể **tích lũy**, và giấc mơ trôi mỗi lúc một xa thực
tế. Đây gọi là **compounding error**, và nó là *bệnh trung tâm* của học-dựa-trên-mô-hình.

Câu hỏi của bài này rất cụ thể: **mơ càng dài thì sai số có nổ không? Và nếu có, nó có
giới hạn việc mơ dài bao nhiêu là hữu ích?**

> Lưu ý thành thật về quy mô (như mọi bài research của tôi): một môi trường, hai seed,
> compute nhỏ. Giá trị không nằm ở "khám phá chấn động" mà ở (a) một câu trả lời cụ thể
> và (b) nó tình cờ giải thích được một quyết định kiến trúc của một mô hình SOTA.

## 1. Vì sao câu hỏi này không tầm thường — Dreamer 4

Tháng 9/2025, DeepMind ra Dreamer 4: agent đầu tiên lấy được kim cương trong Minecraft
*hoàn toàn từ dữ liệu offline*. Một trong những thay đổi kỹ thuật của nó là đổi cách
world model dự đoán — từ dự đoán "vận tốc thay đổi" sang dự đoán thẳng "trạng thái sạch"
(người ta gọi là *x-prediction*). Lý do paper đưa ra, gần như nguyên văn: để **chống
compounding error**, cho phép "rollout chất lượng cao với độ dài tùy ý".

Nói cách khác: compounding error không phải nỗi lo của riêng tôi. Nó là vấn đề mà cả
frontier vẫn đang giải. Tôi không có TPU để đua kiến trúc của họ — nhưng tôi *có thể*
đo chính hiện tượng đó trên world model nhỏ của mình, để hiểu nó định lượng ra sao. Đó
là cách một người ít tài nguyên đứng cạnh frontier mà không cần đua compute.

## 2. Đo trực tiếp, và một thói quen research mới

Ở [dự án trước](/world-models-blog/posts/4-free-nats-hai-co-che-hong/free-nats-hai-co-che-hong/) tôi học cách *quét một hyperparameter
rồi tìm cơ chế giải thích*. Lần này tôi muốn tiến một bước: **đo thẳng cơ chế nghi ngờ**,
chứ không chỉ quan sát hành vi.

Phép đo gọi là **open-loop rollout**. Ý tưởng:

1. Lấy một đoạn quỹ đạo *thật* từ bộ nhớ (các trạng thái + hành động đã thực sự xảy ra).
2. Cho world model nhìn *đúng một* quan sát đầu tiên, rồi bắt nó **tự mơ tiếp** — chỉ
   dùng hành động thật, **không** cho nhìn quan sát nào nữa.
3. Ở mỗi bước $k$, so trạng thái *mơ* với trạng thái *thật*. Sai số $\text{err}(k)$ chính
   là độ trôi sau $k$ bước.

Vẽ $\text{err}(k)$ theo $k$ là nhìn thẳng vào compounding error.

**Và đây là thói quen mới tôi tự ép mình — khai báo điểm yếu của thiết kế TRƯỚC khi
chạy.** Cụ thể: nếu tôi đổi độ dài giấc mơ (gọi là `IMAG_HORIZON`) để xem nó ảnh hưởng
điểm số thế nào, thì tôi đang đổi *hai thứ cùng lúc*: (1) agent mơ xa bao nhiêu vào vùng
trôi, VÀ (2) số "cảnh tưởng tượng" mỗi lần cập nhật — horizon dài = nhiều dữ liệu huấn
luyện hơn. Hai cái này dính nhau. Nếu mơ dài giúp điểm cao, tôi sẽ *không* phân biệt được
"nhờ nhìn xa" với "nhờ đơn giản là nhiều dữ liệu". Gọi đây là **confound**.

> Viết confound ra giấy trước khi thấy dữ liệu là một kỷ luật quan trọng: nó ngăn tôi,
> sau này, kể một câu chuyện hùng hồn mà thiết kế không cho phép. Biết rõ giới hạn của
> thí nghiệm mình *là một phần của việc làm research cho tử tế*, không phải điểm yếu cần
> giấu.

## 3. Ba giả thuyết (viết trước, không sửa sau)

- **H1 — sai số tăng đơn điệu.** $\text{err}(k)$ càng lúc càng lớn theo $k$. (Hình dạng
  cụ thể — tuyến tính? nổ? bão hòa? — tôi để ngỏ, coi là phần đi khám phá.)
- **H2 — có "điểm ngọt" cho độ dài giấc mơ.** Quá ngắn thì agent cận thị; quá dài thì
  đuôi giấc mơ là "tiểu thuyết" đã trôi xa → hại. Điểm số là đường lõm, đỉnh ở giữa.
  (Nhưng tôi không chắc — Dreamer hạ trọng số các bước xa, có thể che được phần trôi.)
- **H3 — sai số dự đoán *phần thưởng* sẽ chặn horizon hữu ích.** Tới một bước $k^*$ nào
  đó, world model đoán phần thưởng sai cỡ bằng chính độ lớn phần thưởng (tỉ lệ tín
  hiệu/nhiễu rớt về $\approx 1$) → mơ xa hơn $k^*$ chỉ còn là nhiễu.

## 4. Kết quả: tôi sai cả ba

### H1 — sai số KHÔNG nổ, nó dao động

Đường $\text{err}(k)$ không phải dốc lên. Nó là một **làn sóng có biên**: thấp nhất ở
$k=0$, nhô lên quanh $k\approx 3\text{–}5$, **tụt rõ xuống** quanh $k\approx 8\text{–}12$,
rồi nhô lại về cuối. Dao động trong một dải hẹp, chỉ trôi lên *nhẹ* sau 30 bước — hoàn
toàn không có chuyện nổ tung.

Vì sao? Môi trường tôi dùng (một con cheetah học chạy) có **dáng chạy tuần hoàn**. Khi
world model mơ, pha của giấc mơ lệch dần khỏi pha thật (sai số lên), nhưng vì chuyển động
*lặp lại*, cứ sau một chu kỳ giấc mơ lại "gặp lại" trạng thái thật (sai số xuống). Cái
lõm quanh $k\approx 8\text{–}12$ chính là một chu kỳ sải chân.

> Trực giác: dự báo một con lắc dễ hơn dự báo thời tiết, dù cả hai đều "động". Lắc lệch
> pha thì sai, nhưng vì nó lặp lại, sai số không tích lũy vô hạn — nó quay vòng. Cheetah
> đang chạy giống con lắc hơn là giống thời tiết.

### H2 — dài hơn lại tốt hơn (nhưng tôi không được mừng vội)

Điểm số gần như phẳng khi giấc mơ ngắn (độ dài 3–10), rồi **đi lên** ở 15 và 25. Không
có đỉnh ở giữa. Đây là đúng nhánh "dài luôn tốt" — ngược hẳn dự đoán lõm của tôi.

Nhưng nhớ confound đã khai ở §2: tôi **không** được kết luận "dài tốt *vì nhìn xa*", vì
dài cũng nghĩa là nhiều dữ liệu huấn luyện hơn. Với hai seed và độ lệch lớn, câu an toàn
nhất chỉ là: *độ dài 15–25 tốt hơn rõ so với 3–10*. Có thế thôi. Việc kìm mình lại đúng
ở ranh giới dữ liệu cho phép — đó là bài học, không phải sự rụt rè.

### H3 — phần thưởng vẫn đoán đúng suốt chặng

Cái bước $k^*$ tôi chờ đợi? Nó **không bao giờ tới**. Sai số dự đoán phần thưởng nằm bẹp
dưới ~0.15, trong khi độ lớn phần thưởng ~0.5 — tỉ lệ tín hiệu/nhiễu vẫn khoảng $5:1$
*ngay cả ở bước 30*. Trạng thái chi tiết thì trôi, nhưng phần thưởng thì không.

Vì sao trạng thái trôi mà phần thưởng đứng yên? Phần thưởng của cheetah ≈ vận tốc chạy
tới (mượt, bị chặn). Khớp chân cụ thể có thể lệch, nhưng "nó đang chạy tới nhanh cỡ nào"
là một tín hiệu thô — bền vững với đúng kiểu trôi đang xảy ra.

## 5. Ba cái sai khớp thành một câu trả lời

Để ý: cả ba kết quả chỉ về *cùng một hướng*.

> Ở môi trường này, world model này, trong 30 bước: **compounding error không nổ — nó
> dao động quanh một mức thấp nhờ tính tuần hoàn của bài toán, và phần thưởng vẫn đoán
> tốt suốt chặng. Hệ quả: mơ dài vẫn hữu ích, nên giấc mơ dài (15–25) thắng giấc mơ
> ngắn.**

Và điều tôi thích nhất: nó **giải thích được khi nào x-prediction của Dreamer 4 thật sự
cần thiết**. Compounding error không cắn ở chỗ của tôi vì hai lý do — task tuần hoàn (tự
sửa lỗi pha) và phần thưởng thô (bền với trôi). Hãy lấy đi cả hai: Minecraft *không* tuần
hoàn, và chuỗi hành động dài tới ~24.000 bước. Ở đó không có chu kỳ nào kéo giấc mơ về;
lệch là lệch luôn, sai số chỉ có một chiều — lên. *Đó* mới là nơi compounding error nổ,
và đó là lý do V4 cần một kiến trúc dự đoán chống nó.

Nói cách khác: x-prediction quan trọng đúng ở chế độ không-tuần-hoàn / horizon-rất-dài,
**không phải ở mọi nơi**. Một thí nghiệm $8 đô trên một con cheetah chạy vòng tròn lại
nói cho tôi biết *điều kiện* để một kỹ thuật SOTA trở nên cần thiết.

## 6. Bài học research

Đây là dự án thứ hai của tôi, và nó dạy ba điều mà dự án đầu chưa dạy:

1. **Đo cơ chế, đừng chỉ quét knob.** Lần trước tôi suy ra cơ chế từ đường cong điểm số.
   Lần này tôi đo thẳng độ trôi theo từng bước — và chính phép đo đó (làn sóng, không phải
   dốc lên) mới là thứ tiết lộ câu trả lời thật.
2. **Khai báo điểm yếu trước.** Vì viết confound ra giấy trước, tôi không tự lừa mình
   bằng kết luận "dài tốt vì nhìn xa" mà thiết kế không bảo chứng được.
3. **Một research tốt tự đẻ ra research tiếp theo.** Câu trả lời của tôi *dựa vào* giả
   thuyết "tuần hoàn tự sửa lỗi". Cách kiểm nó hiển nhiên: chạy lại trên một task *không*
   tuần hoàn và xem sai số có nổ không. Tôi không nghĩ ra câu hỏi đó trước khi chạy — dữ
   liệu đẻ ra nó.

Và như mọi khi: sai ba trên ba giả thuyết, nhưng ba cái sai khớp nhau thành bức tranh
*giàu hơn* cả khi tôi đoán đúng. Research giỏi không phải đoán trúng — mà là để dữ liệu
sửa lại hiểu biết của mình một cách trung thực.

## 7. Kết

Tôi bắt đầu với một nỗi lo ("mơ dài chắc trôi xa") và kết thúc với một bức tranh tinh tế
hơn: giấc mơ *có* lệch, nhưng nếu thế giới lặp lại và phần thưởng thô, độ lệch ấy tự giới
hạn — nên cứ mơ dài thoải mái. Compounding error là thật, nhưng *khi nào* nó cắn phụ
thuộc vào cấu trúc bài toán. Đó cũng là khi một kỹ thuật như x-prediction chuyển từ
"thừa" sang "thiết yếu".

(Nếu bạn muốn xem dự án research đầu tiên của tôi — một hyperparameter hỏng theo hai cách
đối nghịch — nó ở [đây](/world-models-blog/posts/4-free-nats-hai-co-che-hong/free-nats-hai-co-che-hong/). Còn cơ chế Dreamer thì ở
[bài này](/world-models-blog/posts/3-dreamer-v1-hoc-trong-giac-mo/dreamer-v1-hoc-trong-giac-mo/).)

> **Câu cất.** Tôi sợ giấc mơ của agent sẽ trôi xa thực tế — rồi phát hiện một con cheetah
> chạy vòng tròn không cho phép giấc mơ trôi. Compounding error không phải hằng số của vũ
> trụ; nó là hệ quả của việc thế giới *có lặp lại hay không*. Và biết được điều đó, tôi
> hiểu vì sao Dreamer 4 cần đổi kiến trúc cho Minecraft mà tôi thì không cần cho cheetah.
