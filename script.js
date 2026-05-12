/**
 * ==========================================================================
 * TRÒ CHƠI Ô CHỮ TIẾNG VIỆT - LOGIC ĐIỀU KHIỂN (MAIN SCRIPT)
 * Hỗ trợ Auto-advance thông minh tương thích bộ gõ tiếng Việt (Telex/VNI)
 * ==========================================================================
 */

// Bảng dữ liệu gốc của trò chơi (Hardcoded Puzzle Data)
// Đảm bảo chữ cái tại cột số 8 của tất cả các từ tạo thành hàng dọc "GIAOTHÔNG"
const puzzleData = [
    { answer: "GATÀU", clue: "Nơi đón trả khách và bốc dỡ hàng hóa của ngành đường sắt.", startCol: 9 },
    { answer: "ĐƯỜNGBIỂN", clue: "Phương thức vận tải quốc tế chủ lực nhờ đường bờ biển dài của VN.", startCol: 3 },
    { answer: "TÀUHỎA", clue: "Phương tiện di chuyển chính trên tuyến đường sắt Bắc - Nam.", startCol: 4 },
    { answer: "LOGISTICS", clue: "Dịch vụ hậu cần kết nối các khâu vận tải và lưu kho hàng hóa.", startCol: 8 },
    { answer: "THỦYNỘIĐỊA", clue: "Ngành vận tải tận dụng hệ thống sông ngòi chằng chịt ở nước ta.", startCol: 9 },
    { answer: "HÀNGHÓA", clue: "Đối tượng cần bốc xếp, lưu kho và vận chuyển trong chuỗi cung ứng.", startCol: 5 },
    { answer: "HÀNGKHÔNG", clue: "Phương thức vận tải có tốc độ nhanh nhất nhưng chi phí cao.", startCol: 3 },
    { answer: "VẬNTẢI", clue: "Ngành kinh tế kỹ thuật đóng vai trò 'mạch máu' của đất nước.", startCol: 7 },
    { answer: "ĐƯỜNGỐNG", clue: "Loại hình vận tải chuyên dụng để di chuyển xăng, dầu và khí đốt.", startCol: 2 }
];

// Cấu hình kích thước bảng lưới
const GRID_ROWS = 9;
const GRID_COLS = 18;
const KEYWORD_COL = 9; // Cột dọc chứa từ khóa ẩn (1-based)

// Các biến quản lý trạng thái trò chơi
let timerInterval = null;
let startTime = null;
let isTimerRunning = false;
let autoAdvanceTimeout = null; // Biến lưu trữ bộ đếm cho cơ chế Smart Auto-advance

// Lắng nghe sự kiện tải xong DOM để bắt đầu khởi tạo trò chơi
document.addEventListener("DOMContentLoaded", () => {
    initGame();
    setupEventListeners();
});

/**
 * Hàm khởi tạo toàn bộ giao diện và trạng thái ban đầu của trò chơi
 */
function initGame() {
    renderGrid();
    renderClues();
    highlightRowAndClue(1);
}

/**
 * Tạo bảng lưới ô chữ động dựa trên cấu hình hàng và cột
 * Tự động điền sẵn ký tự dưới dạng ẩn (masked)
 */
function renderGrid() {
    const gridContainer = document.getElementById("crossword-grid");
    gridContainer.innerHTML = ""; // Xóa sạch nội dung cũ

    // Duyệt qua từng hàng và cột để tạo ô chữ
    for (let r = 1; r <= GRID_ROWS; r++) {
        const rowData = puzzleData[r - 1];
        const wordLen = rowData.answer.length;
        const startC = rowData.startCol;
        const endC = startC + wordLen - 1;

        for (let c = 1; c <= GRID_COLS; c++) {
            // Kiểm tra xem ô (r, c) có thuộc từ khóa của hàng hiện tại không
            if (c >= startC && c <= endC) {
                const inputCell = document.createElement("input");
                inputCell.type = "text";
                inputCell.className = "crossword-cell";
                const charIndex = c - startC;
                inputCell.dataset.row = r;
                inputCell.dataset.col = c;
                inputCell.dataset.charIndex = charIndex;
                
                // Tự động gán sẵn ký tự đáp án nhưng che khuất bằng lớp masked
                inputCell.value = rowData.answer[charIndex];
                inputCell.readOnly = true; // Khóa không cho người dùng gõ
                inputCell.classList.add("masked");
                inputCell.maxLength = 2; // Giữ nguyên thuộc tính cũ

                // Nếu là cột từ khóa dọc, thêm class nổi bật
                if (c === KEYWORD_COL) {
                    inputCell.classList.add("keyword-column");
                }
                gridContainer.appendChild(inputCell);
            } else if (c === startC - 1) {
                // Ô ngay trước từ khóa dùng để hiển thị số thứ tự hàng ngang
                const labelCell = document.createElement("div");
                labelCell.className = "grid-row-number";
                labelCell.textContent = r;
                gridContainer.appendChild(labelCell);
            } else {
                // Ô rỗng không sử dụng, bị ẩn đi
                const inputCell = document.createElement("input");
                inputCell.type = "text";
                inputCell.className = "crossword-cell disabled";
                inputCell.disabled = true;
                inputCell.setAttribute("aria-hidden", "true");
                inputCell.tabIndex = -1;
                gridContainer.appendChild(inputCell);
            }
        }
    }
}

/**
 * Render danh sách câu hỏi gợi ý (Clues) tương ứng với 9 hàng
 * Đính kèm nút bấm ô vuông chứa biểu tượng mắt Pixel Art
 */
function renderClues() {
    const cluesList = document.getElementById("clues-list");
    cluesList.innerHTML = "";

    // Biểu tượng SVG Pixel Art Eye bảo đảm sắc nét tuyệt đối
    const pixelEyeSvg = `
        <svg class="pixel-eye-svg" viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg">
            <!-- Mi mắt trên và dưới -->
            <rect x="2" y="1" width="5" height="1" fill="#ffffff" />
            <rect x="2" y="5" width="5" height="1" fill="#ffffff" />
            <!-- Phần lòng trắng mắt -->
            <rect x="1" y="2" width="1" height="1" fill="#ffffff" />
            <rect x="7" y="2" width="1" height="1" fill="#ffffff" />
            <rect x="1" y="4" width="1" height="1" fill="#ffffff" />
            <rect x="7" y="4" width="1" height="1" fill="#ffffff" />
            <rect x="2" y="2" width="5" height="3" fill="#ffffff" />
            <!-- Tròng đen/xanh ở giữa -->
            <rect x="3" y="2" width="3" height="3" fill="#0f172a" />
            <rect x="4" y="3" width="1" height="1" fill="#38bdf8" />
        </svg>
    `;

    puzzleData.forEach((data, index) => {
        const rowNum = index + 1;
        const li = document.createElement("li");
        li.className = "clue-item";
        li.dataset.row = rowNum;

        // Cấu trúc HTML của mỗi gợi ý, hiển thị rõ số lượng chữ (ký tự) của đáp án để hỗ trợ người chơi
        li.innerHTML = `
            <span class="clue-number">${rowNum}</span>
            <span class="clue-text">${data.clue} <strong class="clue-length">(${data.answer.length} chữ)</strong></span>
            <button class="btn-reveal-square" title="Mở đáp án hàng này" data-row="${rowNum}">
                ${pixelEyeSvg}
            </button>
        `;

        // Gắn sự kiện khi nhấp vào câu hỏi gợi ý để highlight xem trước
        li.addEventListener("click", () => {
            highlightRowAndClue(rowNum);
        });

        // Lắng nghe sự kiện nhấp trực tiếp vào nút ô vuông để lật mở hàng
        const revealBtn = li.querySelector(".btn-reveal-square");
        if (revealBtn) {
            revealBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // Ngăn sự kiện click của li bên dưới
                revealRow(rowNum);
            });
        }

        cluesList.appendChild(li);
    });
}

/**
 * Lật mở tuần tự từng ô chữ của một hàng với hiệu ứng 3D Flip (Staggered animation)
 */
function revealRow(rowNum) {
    const rowCells = Array.from(document.querySelectorAll(`.crossword-cell[data-row="${rowNum}"]`));
    const clueItem = document.querySelector(`.clue-item[data-row="${rowNum}"]`);
    
    // Nếu hàng đã được lật mở rồi thì bỏ qua
    if (rowCells[0] && !rowCells[0].classList.contains("masked")) return;

    // Bắt đầu đồng hồ ngay khi lật mở hàng đầu tiên nếu chưa chạy
    if (!isTimerRunning) {
        startTimer();
    }

    // Highlight hàng đang lật mở
    highlightRowAndClue(rowNum);

    // Lật mở tuần tự từng ô chữ với hiệu ứng lật 3D
    rowCells.forEach((cell, idx) => {
        setTimeout(() => {
            cell.classList.remove("masked");
            cell.classList.add("success");
            cell.classList.add("flip");
            
            // Sau khi ô cuối cùng lật mở xong, đánh dấu hoàn thành và kiểm tra chiến thắng
            if (idx === rowCells.length - 1) {
                if (clueItem) clueItem.classList.add("solved");
                setTimeout(checkVictory, 400);
            }
        }, idx * 80); // Độ trễ lật mở 80ms cho từng ô
    });
}

/**
 * ==========================================================================
 * CÁC HÀM XỬ LÝ TƯƠNG TÁC VÀ GÕ TIẾNG VIỆT
 * ==========================================================================
 */
function setupEventListeners() {
    const gridContainer = document.getElementById("crossword-grid");

    // Lắng nghe thao tác nhấp trực tiếp vào ô chữ trên bảng lưới để lật mở
    gridContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("crossword-cell")) {
            const row = parseInt(e.target.dataset.row, 10);
            revealRow(row);
        }
    });

    // Sử dụng Event Delegation trên Lưới để tối ưu hiệu suất
    gridContainer.addEventListener("focusin", (e) => {
        if (e.target.classList.contains("crossword-cell")) {
            const row = parseInt(e.target.dataset.row, 10);
            highlightRowAndClue(row);
        }
    });

    gridContainer.addEventListener("input", (e) => {
        if (!e.target.classList.contains("crossword-cell")) return;

        // Bắt đầu đếm thời gian ngay khi người dùng nhập ký tự đầu tiên
        if (!isTimerRunning) {
            startTimer();
        }

        const cell = e.target;
        const row = parseInt(cell.dataset.row, 10);
        
        // Chuẩn hóa ký tự sang chữ IN HOA
        // Nếu người dùng paste hoặc gõ nhiều hơn 1 ký tự, ta giữ lại ký tự cuối cùng hợp lệ
        if (cell.value.length > 0) {
            // Lấy ký tự cuối cùng để chuỗi hiển thị gọn gàng khi gõ dấu xong
            const lastChar = cell.value.slice(-1).toUpperCase();
            cell.value = lastChar;
        }

        // Kiểm tra ngay tính hợp lệ của toàn bộ hàng hiện tại
        validateRow(row);

        // LOGIC SMART AUTO-ADVANCE (Debounce gõ dấu tiếng Việt)
        // Hủy bỏ timeout chuyển ô trước đó nếu người dùng đang gõ phím liên tiếp cực nhanh
        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
        }

        // Thiết lập độ trễ 350ms. Nếu trong 350ms người dùng gõ thêm phím dấu (f, s, r, x, j),
        // bộ gõ IME sẽ sửa ký tự trong ô hiện tại mà không bị mất focus.
        // Hết 350ms, focus mới tự động chuyển sang ô kế tiếp.
        if (cell.value.length === 1) {
            autoAdvanceTimeout = setTimeout(() => {
                advanceToNextCell(cell);
            }, 350);
        }
    });

    gridContainer.addEventListener("keydown", (e) => {
        if (!e.target.classList.contains("crossword-cell")) return;

        const cell = e.target;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                focusCell(row, col + 1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                focusCell(row, col - 1);
                break;
            case "ArrowDown":
                e.preventDefault();
                focusCell(row + 1, col);
                break;
            case "ArrowUp":
                e.preventDefault();
                focusCell(row - 1, col);
                break;
            case "Backspace":
                // Nếu ô hiện tại rỗng, tự động lùi focus về ô trước đó cùng hàng để xóa nhanh
                if (cell.value === "") {
                    e.preventDefault();
                    const prevCell = focusCell(row, col - 1);
                    // Xóa trễ bộ đếm advance nếu có
                    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
                    if (prevCell && !prevCell.readOnly) {
                        prevCell.value = "";
                        validateRow(row);
                    }
                }
                break;
            default:
                break;
        }
    });

    // Các nút chức năng
    document.getElementById("btn-debug-solve").addEventListener("click", solveAllDebug);
    document.getElementById("btn-retry").addEventListener("click", resetGame);
}

/**
 * Di chuyển focus sang ô tiếp theo cùng hàng (nếu có)
 */
function advanceToNextCell(currentCell) {
    const row = parseInt(currentCell.dataset.row, 10);
    const col = parseInt(currentCell.dataset.col, 10);
    // Tìm ô tiếp theo bên phải
    const nextCell = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col + 1}"]`);
    
    // Chỉ advance nếu ô tiếp theo tồn tại và hàng chưa bị khóa (chưa giải xong)
    if (nextCell && !nextCell.readOnly) {
        nextCell.focus();
    }
}

/**
 * Tìm và chuyển focus đến một ô cụ thể trên lưới dựa vào tọa độ (row, col)
 * @returns {HTMLElement|null} Trả về phần tử cell nếu tìm thấy
 */
function focusCell(row, col) {
    const cell = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.focus();
        return cell;
    }
    return null;
}

/**
 * Làm nổi bật trực quan hàng đang chọn trên lưới và item tương ứng trong danh sách gợi ý
 */
function highlightRowAndClue(rowNum) {
    // Xóa highlight cũ ở toàn bộ các ô
    document.querySelectorAll(".crossword-cell").forEach(cell => {
        cell.classList.remove("row-highlight");
    });

    // Thêm highlight mới cho các ô thuộc hàng rowNum
    document.querySelectorAll(`.crossword-cell[data-row="${rowNum}"]`).forEach(cell => {
        cell.classList.add("row-highlight");
    });

    // Cập nhật trạng thái active cho danh sách Clues
    document.querySelectorAll(".clue-item").forEach(item => {
        item.classList.remove("active");
    });
    const activeClue = document.querySelector(`.clue-item[data-row="${rowNum}"]`);
    if (activeClue) {
        activeClue.classList.add("active");
        // Tự động cuộn clue vào vùng nhìn thấy nếu bị khuất
        activeClue.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

/**
 * ==========================================================================
 * LOGIC KIỂM TRA ĐÁP ÁN (VALIDATION) & ĐỒNG HỒ
 * ==========================================================================
 */

/**
 * Kiểm tra đáp án của một hàng cụ thể theo thời gian thực
 */
function validateRow(rowNum) {
    const rowCells = Array.from(document.querySelectorAll(`.crossword-cell[data-row="${rowNum}"]`));
    const correctWord = puzzleData[rowNum - 1].answer;
    
    // Lấy chuỗi ký tự hiện tại do người dùng nhập
    const currentWord = rowCells.map(cell => cell.value.toUpperCase()).join("");

    const clueItem = document.querySelector(`.clue-item[data-row="${rowNum}"]`);

    if (currentWord === correctWord) {
        // Trả lời CHÍNH XÁC
        rowCells.forEach(cell => {
            cell.classList.add("success");
            // Khóa ô không cho sửa đổi để bảo toàn kết quả đúng
            cell.readOnly = true;
        });
        if (clueItem) clueItem.classList.add("solved");

        // Kiểm tra xem đã hoàn thành toàn bộ 9 hàng chưa
        checkVictory();
    } else {
        // Chưa chính xác hoặc bị xóa bớt
        rowCells.forEach(cell => {
            cell.classList.remove("success");
            cell.readOnly = false; // Mở lại quyền chỉnh sửa
        });
        if (clueItem) clueItem.classList.remove("solved");
    }
}

/**
 * Kiểm tra điều kiện chiến thắng toàn bộ trò chơi
 */
function checkVictory() {
    const allSolved = puzzleData.every((_, index) => {
        const rowNum = index + 1;
        const clueItem = document.querySelector(`.clue-item[data-row="${rowNum}"]`);
        return clueItem && clueItem.classList.contains("solved");
    });

    if (allSolved) {
        // Hoàn thành xuất sắc toàn bộ trò chơi
        stopTimer();
        // Hiển thị Modal chúc mừng sau một độ trễ nhỏ để người dùng kịp ngắm hiệu ứng hàng cuối cùng
        setTimeout(() => {
            showVictoryModal();
        }, 500);
    }
}

/**
 * Quản lý Bộ đếm thời gian (Stopwatch Timer)
 */
function startTimer() {
    isTimerRunning = true;
    startTime = Date.now();
    const timerDisplay = document.getElementById("timer-display");

    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
        const seconds = String(elapsedTime % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    isTimerRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Hiển thị Modal thông báo kết thúc trò chơi
 */
function showVictoryModal() {
    const modal = document.getElementById("victory-modal");
    const finalTimeDisplay = document.getElementById("final-time");
    const timerDisplay = document.getElementById("timer-display");

    finalTimeDisplay.textContent = timerDisplay.textContent;
    modal.classList.remove("hidden");
}

/**
 * Đặt lại toàn bộ trò chơi về trạng thái ban đầu (Chơi lại)
 */
function resetGame() {
    // Đặt lại đồng hồ
    stopTimer();
    document.getElementById("timer-display").textContent = "00:00";
    startTime = null;

    // Đặt lại các ô trên lưới về trạng thái ẩn (masked)
    document.querySelectorAll(".crossword-cell").forEach(cell => {
        if (!cell.classList.contains("disabled")) {
            cell.classList.add("masked");
            cell.classList.remove("success", "flip");
            cell.readOnly = true;
        }
    });

    // Đặt lại danh sách gợi ý
    document.querySelectorAll(".clue-item").forEach(item => {
        item.classList.remove("solved");
    });

    // Ẩn modal và bắt đầu lại từ hàng 1
    document.getElementById("victory-modal").classList.add("hidden");
    highlightRowAndClue(1);
}

/**
 * ==========================================================================
 * CHẾ ĐỘ GỠ LỖI (DEBUG MODE) - ĐIỀN NHANH ĐÁP ÁN
 * ==========================================================================
 */
function solveAllDebug() {
    // Bắt đầu timer nếu chưa chạy để có số liệu hiển thị
    if (!isTimerRunning) {
        startTimer();
    }

    // Lật mở lập tức toàn bộ các hàng
    puzzleData.forEach((data, index) => {
        const rowNum = index + 1;
        const rowCells = Array.from(document.querySelectorAll(`.crossword-cell[data-row="${rowNum}"]`));
        const clueItem = document.querySelector(`.clue-item[data-row="${rowNum}"]`);

        rowCells.forEach(cell => {
            cell.classList.remove("masked");
            cell.classList.add("success", "flip");
        });

        if (clueItem) clueItem.classList.add("solved");
    });

    // Kiểm tra chiến thắng ngay sau khi lật mở toàn bộ
    setTimeout(checkVictory, 400);
}
