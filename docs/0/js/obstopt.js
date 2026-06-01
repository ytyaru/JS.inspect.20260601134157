export class ObStOpt {
  static #VALID = Object.freeze({
    QUOTES: ["'", '"', '`'],
    SYM_MODES: ['standard', 'exception', 'raw'],
    INS_MODES: ['lost', 'exception'],
  });
  static #defaultOpt = {
    str: { quote: "'" },
    sym: { quote: "'", mode: "standard" },
    ins: { mode: "lost" }
  };

  /**
   * ユーザー入力をマージ・検証し、純粋な設定オブジェクトを新設して返す
   * @param {object} userOpt - ユーザーから渡された任意のオプション
   * @returns {object} バリデーション済みのプレーンな設定オブジェクト
   */
  static create(userOpt) {
    const merged = {
      str: this.#normalize(userOpt.str, 'str'),
      sym: this.#normalize(userOpt.sym, 'sym'),
      ins: this.#normalize(userOpt.ins, 'ins')
    };

    this.#validate(merged);

    return merged;
  }

  // ユーザー入力の型チェックとデフォルト値のマージ
  static #normalize(target, key) {
    if (typeof target === 'function') return { _rawFn: target };
    return { ...this.#defaultOpt[key], ...target };
  }

  // 全体の一括バリデーション司令
  static #validate(merged) {
    if (!merged.str._rawFn) {
      this.#valid('str', 'quote', merged.str.quote, this.#VALID.QUOTES);
    }
    if (!merged.sym._rawFn) {
      this.#valid('sym', 'quote', merged.sym.quote, this.#VALID.QUOTES);
      this.#valid('sym', 'mode', merged.sym.mode, this.#VALID.SYM_MODES);
    }
    if (!merged.ins._rawFn) {
      this.#valid('ins', 'mode', merged.ins.mode, this.#VALID.INS_MODES);
    }
  }

  /**
   * 単一責任：値が有効値リストに含まれているかを検証し、不一致なら統一フォーマットでエラーを投げる
   * @param {string} key - 'str' | 'sym' | 'ins'
   * @param {string} prop - 'quote' | 'mode'
   * @param {any} value - 検証する値
   * @param {array} allowedList - 有効値の配列
   */
  static #valid(key, prop, value, allowedList) {
    if (!allowedList.includes(value)) {
      throw new Error(`${key}.${prop}は${allowedList.join(',')}のみ有効です。実際:${value}`);
    }
  }
}
