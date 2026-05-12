# BỘ NHỚ DỰ ÁN (PROJECT MEMORY) - TRÒ CHƠI Ô CHỮ TIẾNG VIỆT

Tài liệu này ghi nhận lại toàn bộ kiến trúc, dữ liệu, quyết định thiết kế và các giải pháp kỹ thuật cốt lõi trong quá trình phát triển ứng dụng **Trò chơi Ô chữ Tiếng Việt (Vietnamese Crossword Puzzle)**.

---

## 1. Thông tin chung về Trò chơi
- **Mục tiêu**: Tạo ra một trò chơi giải ô chữ trực tuyến, có tính tương tác cao, hoạt động với dữ liệu tĩnh (hardcoded) thuộc chủ đề **Giao thông & Vận tải Việt Nam**.
- **Cấu trúc Lưới**: Bảng lưới bao gồm chính xác **9 hàng ngang** và **17 cột dọc**.
- **Từ khóa ẩn dọc**: Từ khóa đặc biệt **GIAOTHÔNG** (Giao thông) nằm thẳng hàng dọc hoàn hảo tại **Cột số 8** (1-based index).

## 2. Chi tiết Dữ liệu và Tọa độ Lưới (Puzzle Mapping)
Toàn bộ khoảng trắng trong các từ khóa đều được loại bỏ theo đúng quy tắc game ô chữ. Các từ được căn chỉnh tọa độ cột bắt đầu (`startCol`) sao cho ký tự giao nhau rơi đúng vào Cột số 8:

| Hàng | Đáp án | Chiều dài | Cột bắt đầu | Ký tự tại Cột 8 | Gợi ý (Clue) |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | `GATÀU` | 5 | 8 | **G** | Nơi đón trả khách và bốc dỡ hàng hóa của ngành đường sắt. |
| **2** | `ĐƯỜNGBIỂN` | 9 | 2 | **I** | Phương thức vận tải quốc tế chủ lực nhờ đường bờ biển dài của VN. |
| **3** | `TÀUHỎA` | 6 | 3 | **A** | Phương tiện di chuyển chính trên tuyến đường sắt Bắc - Nam. |
| **4** | `LOGISTICS` | 9 | 7 | **O** | Dịch vụ hậu cần kết nối các khâu vận tải và lưu kho hàng hóa. |
| **5** | `THỦYNỘIĐỊA` | 10 | 8 | **T** | Ngành vận tải tận dụng hệ thống sông ngòi chằng chịt ở nước ta. |
| **6** | `HÀNGHÓA` | 7 | 4 | **H** | Đối tượng cần bốc xếp, lưu kho và vận chuyển trong chuỗi cung ứng. |
| **7** | `HÀNGKHÔNG` | 9 | 2 | **Ô** | Phương thức vận tải có tốc độ nhanh nhất nhưng chi phí cao. |
| **8** | `VẬNTẢI` | 6 | 6 | **N** | Ngành kinh tế kỹ thuật đóng vai trò 'mạch máu' của đất nước. |
| **9** | `ĐƯỜNGỐNG` | 8 | 1 | **G** | Loại hình vận tải chuyên dụng để di chuyển xăng, dầu và khí đốt. |

## 3. Kiến trúc Mã nguồn và UI/UX
Dự án áp dụng nguyên tắc tối giản nhưng mang tính cao cấp (Premium UI/UX) và phân tách mã nguồn thành 3 tệp độc lập:

### 3.1. `index.html` (Cấu trúc & Ngữ nghĩa)
- Sử dụng các thẻ ngữ nghĩa HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`).
- Tích hợp phông chữ **Inter** từ Google Fonts.
- Cấu trúc các vùng chứa rõ ràng cho bảng chữ, danh sách câu hỏi, đồng hồ và Modal chiến thắng.

### 3.2. `style.css` (Premium Design & Dark Theme)
- **Hệ thống Design Tokens**: Định nghĩa đầy đủ các biến màu sắc, đổ bóng và chuyển động.
- **Dark Theme Grid**: Bảng lưới được bọc trong container tối màu (`#0f172a`), các ô chữ có viền nổi bật, giúp làm nổi bật dải màu Sky-blue của Header và các màu trạng thái.
- **Cột Từ khóa Nổi bật**: Cột dọc số 8 được gán lớp màu nền cam vàng rực rỡ (`#f59e0b`) giúp người chơi dễ dàng nhận diện mục tiêu chính.
- **Responsive & Trượt ngang**: Hỗ trợ hiển thị mượt mà trên điện thoại di động nhờ tính năng trượt ngang tự động (`overflow-x: auto`) nếu màn hình quá nhỏ.

### 3.3. `script.js` (Logic Điều khiển Lật mở Đáp án Ẩn)
- **Render Lưới tự động**: Duyệt qua mảng cấu hình 9 hàng x 17 cột, tự động chèn các thẻ `<input>` vào lưới. Toàn bộ các ký tự đáp án được điền sẵn vào ô chữ nhưng bị khóa gõ (`readOnly = true`) và che khuất bằng lớp `.masked` (`color: transparent`).
- **Tương tác hai chiều (Bi-directional Highlight)**: Focus vào ô chữ làm nổi bật câu hỏi gợi ý tương ứng bên dưới và ngược lại.
- **Cơ chế Lật mở (Masked Reveal)**: Người chơi nhấp vào hàng chữ trên lưới hoặc nút biểu tượng con mắt pixel art bên cạnh gợi ý để gỡ bỏ lớp `.masked`, đồng thời áp dụng hiệu ứng lật 3D tuần tự (`staggered animation` qua `setTimeout`).
- **Đồng hồ bấm giờ (Stopwatch)**: Tự động kích hoạt ngay khi người dùng lật mở hàng đầu tiên.
- **Kiểm tra Điều kiện Chiến thắng**: Tự động đánh dấu hoàn thành hàng và kiểm tra khi toàn bộ 9 hàng đã được lật mở thành công.

---

## 4. Cơ chế Gameplay Mới: Lật mở Đáp án ẩn (Masked Reveal)
**Mục tiêu Chuyển đổi**: Nhằm đơn giản hóa thao tác, giảm thiểu rào cản gõ phím và tối ưu hóa trải nghiệm giải trí nhanh của người dùng, trò chơi chuyển từ cơ chế tự nhập liệu thủ công sang cơ chế **Lật mở trên cơ sở đáp án ẩn**.

**Giải pháp Triển khai Chi tiết**:
- **Ẩn Nội dung**: Ký tự được gán sẵn vào thuộc tính `.value` của thẻ input nhưng hoàn toàn vô hình nhờ lớp CSS `.masked` thiết lập màu chữ trong suốt (`transparent`).
- **Nút Bấm Trực quan**: Mỗi mục câu hỏi gợi ý được đính kèm một nút bấm hình vuông `.btn-reveal-square` chứa biểu tượng **con mắt Pixel Art** (SVG `crispEdges`) được thiết kế tỉ mỉ, giúp người chơi dễ dàng nhắm trúng mục tiêu.
- **Hiệu ứng Staggered 3D Flip**: Khi kích hoạt mở hàng, các ô chữ lần lượt thực hiện vòng quay 3D theo trục X (`@keyframes flip-reveal`) với độ trễ liên tiếp `80ms` giữa các ô, mang lại hiệu ứng thị giác vô cùng mãn nhãn và cao cấp.
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
