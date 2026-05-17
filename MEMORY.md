# BỘ NHỚ DỰ ÁN (PROJECT MEMORY) - TRÒ CHƠI Ô CHỮ TIẾNG VIỆT

Tài liệu này ghi nhận lại toàn bộ kiến trúc, dữ liệu, quyết định thiết kế và các giải pháp kỹ thuật cốt lõi trong quá trình phát triển ứng dụng **Trò chơi Ô chữ Tiếng Việt (Vietnamese Crossword Puzzle)**.

---

## 1. Thông tin chung về Trò chơi
- **Mục tiêu**: Tạo ra một trò chơi giải ô chữ trực tuyến, có tính tương tác cao, hoạt động với dữ liệu tĩnh (hardcoded) thuộc chủ đề **Giao thông & Vận tải Việt Nam**.
- **Cấu trúc Lưới**: Bảng lưới bao gồm chính xác **9 hàng ngang** và **18 cột dọc** (được mở rộng để hỗ trợ hiển thị số thứ tự hàng ngang ngay bên trong lưới).
- **Từ khóa ẩn dọc**: Từ khóa đặc biệt **GIAOTHÔNG** (Giao thông) nằm thẳng hàng dọc hoàn hảo tại **Cột số 9** (1-based index).

## 2. Chi tiết Dữ liệu và Tọa độ Lưới (Puzzle Mapping)
Toàn bộ khoảng trắng trong các từ khóa đều được loại bỏ theo đúng quy tắc game ô chữ. Các từ được căn chỉnh tọa độ cột bắt đầu (`startCol`) sao cho ký tự giao nhau rơi đúng vào Cột số 9. Ô ngay trước từ khóa (cột `startCol - 1`) được tận dụng để hiển thị số thứ tự hàng ngang (1-9):

| Hàng | Đáp án | Chiều dài | Cột bắt đầu | Ký tự tại Cột 9 | Gợi ý (Clue) kèm Ước lượng |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | `GATÀU` | 5 | 9 | **G** | Nơi đón trả khách và bốc dỡ hàng hóa của ngành đường sắt. `(5 chữ)` |
| **2** | `ĐƯỜNGBIỂN` | 9 | 3 | **I** | Phương thức vận tải quốc tế chủ lực nhờ đường bờ biển dài của VN. `(9 chữ)` |
| **3** | `TÀUHỎA` | 6 | 4 | **A** | Phương tiện di chuyển chính trên tuyến đường sắt Bắc - Nam. `(6 chữ)` |
| **4** | `LOGISTICS` | 9 | 8 | **O** | Dịch vụ hậu cần kết nối các khâu vận tải và lưu kho hàng hóa. `(9 chữ)` |
| **5** | `THỦYNỘIĐỊA` | 10 | 9 | **T** | Ngành vận tải tận dụng hệ thống sông ngòi chằng chịt ở nước ta. `(10 chữ)` |
| **6** | `HÀNGHÓA` | 7 | 5 | **H** | Đối tượng cần bốc xếp, lưu kho và vận chuyển trong chuỗi cung ứng. `(7 chữ)` |
| **7** | `HÀNGKHÔNG` | 9 | 3 | **Ô** | Phương thức vận tải có tốc độ nhanh nhất nhưng chi phí cao. `(9 chữ)` |
| **8** | `VẬNTẢI` | 6 | 7 | **N** | Ngành kinh tế kỹ thuật đóng vai trò 'mạch máu' của đất nước. `(6 chữ)` |
| **9** | `ĐƯỜNGỐNG` | 8 | 2 | **G** | Loại hình vận tải chuyên dụng để di chuyển xăng, dầu và khí đốt. `(8 chữ)` |

## 3. Kiến trúc Mã nguồn và UI/UX
Dự án áp dụng nguyên tắc tối giản nhưng mang tính cao cấp (Premium UI/UX) và phân tách mã nguồn thành 3 tệp độc lập:

### 3.1. `index.html` (Cấu trúc & Ngữ nghĩa)
- Sử dụng các thẻ ngữ nghĩa HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`).
- Tích hợp phông chữ **Inter** từ Google Fonts.
- Cấu trúc các vùng chứa rõ ràng cho bảng chữ, danh sách câu hỏi, đồng hồ và Modal chiến thắng.

### 3.2. `style.css` (Premium Design & Dark Theme)
- **Hệ thống Design Tokens**: Định nghĩa đầy đủ các biến màu sắc, đổ bóng và chuyển động.
- **Dark Theme Grid**: Bảng lưới được bọc trong container tối màu (`#0f172a`), các ô chữ có viền nổi bật, giúp làm nổi bật dải màu Sky-blue của Header và các màu trạng thái.
- **Cột Từ khóa Nổi bật**: Cột dọc số 9 được gán lớp màu nền cam vàng rực rỡ (`#f59e0b`) giúp người chơi dễ dàng nhận diện mục tiêu chính.
- **Số Thứ Tự Lưới Trực Quan**: Lớp `.grid-row-number` hiển thị các số từ 1 đến 9 ngay bên trái từ khóa với nền tối trong suốt, chữ số màu xanh da trời sang trọng, giúp người chơi dễ dàng định vị.
- **Ước lượng Ký tự Thanh Lịch**: Lớp `.clue-length` gán màu sắc và font chữ đậm nét vừa phải cho chuỗi `(X chữ)` ở cuối mỗi câu hỏi.
- **Bảo Toàn Hiển Thị Dấu Tiếng Việt**: Lớp `.crossword-cell` được bổ sung `padding-top: 2px` và `line-height: normal` để ngăn trình duyệt trên hệ điều hành Windows cắt mất phần đỉnh của các dấu xếp chồng (dấu sắc, huyền trên ký tự mũ như `Ố`, `Ể`, `Ẩ`).

### 3.3. `script.js` (Logic Điều khiển Lật mở Đáp án Ẩn)
- **Render Lưới tự động**: Duyệt qua mảng cấu hình 9 hàng x 18 cột, tự động chèn các thẻ `<input>` (cho ô chữ) hoặc `<div>` (cho ô số thứ tự) vào lưới. Toàn bộ các ký tự đáp án được điền sẵn vào ô chữ nhưng bị khóa gõ (`readOnly = true`) và che khuất bằng lớp `.masked` (`color: transparent`).
- **Tương tác hai chiều (Bi-directional Highlight)**: Focus vào ô chữ làm nổi bật câu hỏi gợi ý tương ứng bên dưới và ngược lại.
- **Cơ chế Lật mở và Đóng (Toggle Reveal/Hide)**: Người chơi nhấp vào hàng chữ trên lưới hoặc nút biểu tượng con mắt pixel art bên cạnh gợi ý. Nếu hàng đang ẩn, nó sẽ gỡ bỏ lớp `.masked` với hiệu ứng lật 3D tuần tự (`staggered animation` qua `setTimeout`). Nếu hàng đã được mở, việc bấm lại nút con mắt sẽ **đóng đáp án ngay lập tức** (thêm lại lớp `.masked`, gỡ bỏ class `.success` và `.flip`, đồng thời bỏ đánh dấu `.solved`), giúp người chơi phòng tránh lỗi lỡ tay hoặc muốn tự giải lại.
- **Đồng hồ bấm giờ (Stopwatch)**: Tự động kích hoạt ngay khi người dùng lật mở hàng đầu tiên.
- **Kiểm tra Điều kiện Chiến thắng**: Tự động đánh dấu hoàn thành hàng và kiểm tra khi toàn bộ 9 hàng đã được lật mở thành công.

---

## 4. Cơ chế Gameplay Mới: Lật mở Đáp án ẩn (Masked Reveal)
**Mục tiêu Chuyển đổi**: Nhằm đơn giản hóa thao tác, giảm thiểu rào cản gõ phím và tối ưu hóa trải nghiệm giải trí nhanh của người dùng, trò chơi chuyển từ cơ chế tự nhập liệu thủ công sang cơ chế **Lật mở trên cơ sở đáp án ẩn**.

**Giải pháp Triển khai Chi tiết**:
- **Ẩn Nội dung**: Ký tự được gán sẵn vào thuộc tính `.value` của thẻ input nhưng hoàn toàn vô hình nhờ lớp CSS `.masked` thiết lập màu chữ trong suốt (`transparent`).
- **Nút Bấm Trực quan**: Mỗi mục câu hỏi gợi ý được đính kèm một nút bấm hình vuông `.btn-reveal-square` chứa biểu tượng **con mắt Pixel Art** (SVG `crispEdges`) được thiết kế tỉ mỉ, giúp người chơi dễ dàng nhắm trúng mục tiêu.
- **Hiệu ứng Staggered 3D Flip**: Khi kích hoạt mở hàng, các ô chữ lần lượt thực hiện vòng quay 3D theo trục X (`@keyframes flip-reveal`) với độ trễ liên tiếp `80ms` giữa các ô, mang lại hiệu ứng thị giác vô cùng mãn nhãn và cao cấp.
- **Cơ chế Đóng/Mở linh hoạt (Toggle)**: Để mang lại trải nghiệm tối ưu và tránh lỗi lỡ tay, khi người dùng nhấp lại vào biểu tượng con mắt hoặc hàng ô chữ đã mở, hệ thống sẽ thực hiện đóng đáp án ngay lập tức (ẩn chữ, loại bỏ các lớp `.success` và `.flip`, khôi phục lớp `.masked` cùng thuộc tính `readOnly = true`, đồng thời gỡ bỏ lớp `.solved` khỏi gợi ý). Người dùng vẫn có thể bấm mở lại đáp án bình thường vào bất kỳ lúc nào.
- **Bảo tồn Logic Cũ**: Toàn bộ các hàm cũ xử lý gõ phím, di chuyển tiêu điểm hay debounce tiếng Việt vẫn được giữ lại trọn vẹn trong mã nguồn nhằm tuân thủ quy tắc không xóa code của dự án.

## 5. Chế độ Gỡ lỗi (Debug Mode)
- Nút **"⚡ Solve All (Debug)"** ở cuối trang cho phép tự động điền toàn bộ đáp án chính xác vào lưới.
- Kích hoạt cơ chế kiểm tra kết quả ngay lập tức và hiển thị Modal chiến thắng kèm theo thời gian hiện tại để hỗ trợ quá trình kiểm thử nhanh chóng.

## 6. Dải Hoạt họa Đáy Trang (Seaport Logistics Asset Animations)
- **Mục tiêu**: Bổ sung yếu tố động (dynamic animation) theo chủ đề cảng biển logistics để tạo không gian sinh động, tránh cảm giác tĩnh lặng nhàm chán cho người chơi trong suốt quá trình giải đố.
- **Cấu trúc Đồ họa Thực tế**: Thay thế hoàn toàn mã đồ họa SVG giả lập bằng hệ thống các **tệp hình ảnh thực tế chất lượng cao** được bố trí hài hòa:
  - **Bãi Container Tĩnh**: Các hình ảnh container tĩnh (`Container.png` và `Container_2.png`) **đã được gỡ bỏ hoàn toàn** theo yêu cầu trực tiếp từ người dùng nhằm giữ cho bãi cảng thông thoáng.
  - **Hai Cần cẩu Tĩnh (`Cần_cẩu.png`)**: Bố trí cố định ở 2 bên góc trái và phải với kích thước phối cảnh tinh tế tạo chiều sâu cho không gian.
  - **Một Cần cẩu Hoạt động (`Cần_cẩu.gif`)**: Đặt ở vị trí trung tâm bãi cảng, liên tục tái hiện hoạt họa tời bốc dỡ hàng hóa chân thực.
  - **Hai Làn Xe Container (`Xe_Container.png`)**: Di chuyển ngược xuôi liên tục trên làn đường cảng. Do hình ảnh gốc có hướng cabin quay sang trái, xe chạy từ trái sang phải được áp dụng lớp `truck-facing-right` (`transform: scaleX(-1)`) để quay đầu, trong khi xe chạy từ phải sang trái giữ nguyên lớp `truck-facing-left` (`transform: scaleX(1)`), bảo đảm cả hai luồng xe đều di chuyển tiến về phía trước một cách hợp lý và đẹp mắt.
- **An Toàn Tương tác**: Toàn bộ container hoạt họa được đặt thuộc tính `pointer-events: none` và `aria-hidden="true"`, bảo đảm tuyệt đối không cản trở thao tác nhấp chuột của người dùng vào bảng chữ hay nút gỡ lỗi.
