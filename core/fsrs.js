/* --- FSRS v4.5 Scheduler (Bản Chuẩn Cộng Đồng) ---
 * Đây là bộ tham số mặc định (Default Parameters).
 * Phù hợp nhất cho ứng dụng public cho nhiều người dùng.
 */

const FSRS_PARAMS = {
  request_retention: 0.9, // Mức độ nhớ mong muốn 90% (Chuẩn)
  maximum_interval: 36500, // 100 năm

  // Bộ weights mặc định của FSRS v4.5 (Dành cho đại đa số mọi người)
  w: [
    0.40255, 1.18385, 3.173, 15.69105, 7.19497, 0.5345, 1.4604, 0.004052,
    1.54909, 0.15442, 1.04925, 2.1259, 0.007854, 0.29244, 1.30179, 0.01724,
    2.39645,
  ],
};

class FSRS {
  constructor() {
    this.p = FSRS_PARAMS;
  }

  schedule(card, grade) {
    const now = new Date();

    // Khởi tạo thẻ mới
    if (!card || !card.stability) {
      card = {
        stability: 0,
        difficulty: 0,
        reps: 0,
        lapses: 0,
        state: 0, // 0: New, 1: Learning, 2: Review, 3: Relearning
        last_review: now,
      };
    }

    if (grade === 1) card.lapses += 1;
    card.reps += 1;

    let next_s = 0;
    let next_d = 0;
    let next_interval = 0;

    // --- LOGIC TÍNH TOÁN ---
    if (card.state === 0) {
      // First Learning
      next_d = this.init_difficulty(grade);
      next_s = this.init_stability(grade);
    } else {
      // Review
      next_d = this.next_difficulty(card.difficulty, grade);

      if (grade === 1) {
        next_s = this.next_forget_stability(
          card.difficulty,
          card.stability,
          this.p.request_retention
        );
      } else {
        next_s = this.next_recall_stability(
          card.difficulty,
          card.stability,
          this.p.request_retention,
          grade
        );
      }
    }

    // Tính ngày (Interval)
    if (grade === 1) {
      next_interval = 0;
    } else {
      next_interval = this.next_interval(next_s);
    }

    // Chuyển đổi State
    let next_state = card.state;
    if (grade === 1) next_state = 1;
    else if (card.state === 0 || card.state === 1) next_state = 2;

    // Tạo kết quả
    const next_due = new Date();
    if (next_interval === 0) {
      // Nếu Again: +10 phút (Mặc định cho mọi người)
      next_due.setMinutes(next_due.getMinutes() + 10);
    } else {
      // Nếu Nhớ: +Số ngày
      next_due.setDate(next_due.getDate() + Math.round(next_interval));
    }

    return {
      stability: parseFloat(next_s.toFixed(4)),
      difficulty: parseFloat(next_d.toFixed(4)),
      due: next_due.toISOString(),
      last_review: now.toISOString(),
      reps: card.reps,
      lapses: card.lapses,
      state: next_state,
      interval: Math.round(next_interval),
    };
  }

  // --- CÔNG THỨC TOÁN HỌC ---
  init_stability(g) {
    return Math.max(0.1, this.p.w[g - 1]);
  }
  init_difficulty(g) {
    return Math.min(Math.max(this.p.w[4] - this.p.w[5] * (g - 3), 1), 10);
  }
  next_interval(s) {
    const new_interval = s * 9 * (1 / this.p.request_retention - 1);
    return Math.min(
      Math.max(Math.round(new_interval), 1),
      this.p.maximum_interval
    );
  }
  next_difficulty(d, g) {
    const next_d = d - this.p.w[6] * (g - 3);
    return Math.min(Math.max(this.mean_reversion(this.p.w[4], next_d), 1), 10);
  }
  mean_reversion(init, current) {
    return this.p.w[7] * init + (1 - this.p.w[7]) * current;
  }
  next_recall_stability(d, s, r, g) {
    const hard_penalty = g === 2 ? this.p.w[15] : 1;
    const easy_bonus = g === 4 ? this.p.w[16] : 1;
    return (
      s *
      (1 +
        Math.exp(this.p.w[8]) *
          (11 - d) *
          Math.pow(s, -this.p.w[9]) *
          (Math.exp((1 - r) * this.p.w[10]) - 1) *
          hard_penalty *
          easy_bonus)
    );
  }
  next_forget_stability(d, s, r) {
    return (
      this.p.w[11] *
      Math.pow(d, -this.p.w[12]) *
      (Math.pow(s + 1, this.p.w[13]) - 1) *
      Math.exp((1 - r) * this.p.w[14])
    );
  }
}

window.FSRSAlgorithm = new FSRS();
