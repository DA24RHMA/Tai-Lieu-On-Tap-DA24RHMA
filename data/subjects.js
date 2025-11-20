/* --- FILE CẤU HÌNH MÔN HỌC ---
 * Khai báo danh sách các file CSV cần tải cho từng môn.
 * Lưu ý: Tên file trong mảng 'files' phải khớp 100% với tên file thực tế trong thư mục.
 */

const SUBJECT_DATA = {
  KST: {
    name: "Ký Sinh Trùng",
    folder: "data/KÝ SINH TRÙNG", // Đường dẫn chứa file
    files: [
      "Chuong1.csv",
      "Chuong2-1.csv",
      "Chuong2-2.csv",
      "Chuong2-3.csv",
      "Chuong2-4.csv",
      "Chuong2-5.csv",
      "Chuong3-1.csv",
      "Chuong3-2.csv",
      "Chuong3-3.csv",
      "Chuong3-4.csv",
      "Chuong3-5.csv",
      "Chuong3-6.csv",
      "Chuong3-7.csv",
    ],
  },
  VISINH: {
    name: "Vi Sinh",
    folder: "data/VI SINH",
    files: [],
  },
  CNXHKH: {
    name: "CNXHKH",
    folder: "data/CNXHKH",
    files: [],
  },
};

// Export để dùng global
window.SubjectConfig = SUBJECT_DATA;
