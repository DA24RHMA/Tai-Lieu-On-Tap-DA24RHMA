/* --- CSV Importer Module (Flashcard Mode) ---
 * Xử lý dữ liệu trắc nghiệm nhưng chuyển thành Flashcard chuẩn Anki.
 * Mục tiêu: Giữ tính năng Spaced Repetition (Again/Hard/Good/Easy).
 * Cấu trúc: Col 1 (Câu hỏi) + Col 2-6 (Options) => Mặt Trước (HTML)
 * Col 7 (Đáp án) + Col 8 (Giải thích) => Mặt Sau (HTML)
 */

class CSVImporter {
  static parse(csvText, fileName) {
    const lines = csvText.split(/\r\n|\n/);
    const deck = {
      id: "deck_" + Date.now(),
      title: fileName.replace(".csv", ""),
      cards: [],
      type: "flashcard", // Luôn là flashcard để dùng FSRS
    };

    // Hàm helper để làm sạch chuỗi và thay thế xuống dòng bằng khoảng trắng
    const cleanString = (s) => (s ? s.trim().replace(/\n/g, " ") : "");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = this.splitCSVLine(line);

      // Nếu file có đủ cột trắc nghiệm (>= 8 cột: id, cau, A, B, C, D, E, dapan)
      if (cols.length >= 8) {
        // 1. Gộp Câu hỏi + Các lựa chọn vào mặt trước (Question)
        // Chú ý: Cột 1 là Câu hỏi, Cột 2-6 là Options A-E
        let frontContent = `<div class="question-main">${cleanString(
          cols[1]
        )}</div>`;

        // Thêm thẻ <br> sau mỗi option để đảm bảo xuống dòng
        if (cols[2])
          frontContent += `<div class="question-option">A. ${cleanString(
            cols[2]
          )}</div><br>`;
        if (cols[3])
          frontContent += `<div class="question-option">B. ${cleanString(
            cols[3]
          )}</div><br>`;
        if (cols[4])
          frontContent += `<div class="question-option">C. ${cleanString(
            cols[4]
          )}</div><br>`;
        if (cols[5])
          frontContent += `<div class="question-option">D. ${cleanString(
            cols[5]
          )}</div><br>`;
        if (cols[6])
          frontContent += `<div class="question-option">E. ${cleanString(
            cols[6]
          )}</div><br>`;

        // 2. Đáp án + Giải thích vào mặt sau (Answer)
        // Cột 7 là Đáp án đúng, Cột 8 là Giải thích
        let backContent = `<div class="answer-correct">Đáp án: ${cleanString(
          cols[7]
        ).toUpperCase()}</div>`;
        if (cols[8])
          backContent += `<div class="answer-explanation">${cleanString(
            cols[8]
          )}</div>`;

        deck.cards.push({
          id: cols[0],
          question: frontContent, // HTML String
          answer: backContent, // HTML String
          type: "flashcard", // Ép kiểu về Flashcard
          fsrs: this.createEmptyFSRS(),
        });
      }
      // Nếu là file flashcard thường (ít cột)
      else if (cols.length >= 3) {
        let backContent = cleanString(cols[2]);
        if (cols[3])
          backContent += `<div style="border-top:1px solid #555; padding-top:10px; margin-top:10px;">${cleanString(
            cols[3]
          )}</div>`;

        deck.cards.push({
          id: cols[0],
          question: cleanString(cols[1]),
          answer: backContent,
          type: "flashcard",
          fsrs: this.createEmptyFSRS(),
        });
      }
    }
    console.log(`Đã import ${deck.cards.length} thẻ Flashcard từ ${fileName}`);
    return deck;
  }

  static splitCSVLine(text) {
    const result = [];
    let curr = "";
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === "," && !inQuote) {
        result.push(curr.replace(/^"|"$/g, "").trim());
        curr = "";
      } else {
        curr += char;
      }
    }
    result.push(curr.replace(/^"|"$/g, "").trim());
    return result;
  }

  static createEmptyFSRS() {
    return {
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      last_review: new Date().toISOString(),
    };
  }
}

window.Importer = CSVImporter;
