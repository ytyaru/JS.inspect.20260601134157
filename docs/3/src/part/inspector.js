import { InspectorOption } from "./inspector-option.js";

export class Inspector {
  static #strategies = [];

  // 静的初期化ブロック：クラス読み込み時に一度だけ安全に戦略マップを構築
  static {
    this.#strategies = [
      { is: (v) => v === null, to: () => 'null' },
      { is: (v) => v === undefined, to: () => 'undefined' },
      { is: (v) => typeof v === 'bigint', to: (v) => `${v}n` },
      { is: this.#isCls, to: (v) => v.name },
      { is: (v) => typeof v === 'string', to: (v, opt) => this.#toStr(v, opt.str) },
      { is: (v) => typeof v === 'symbol', to: (v, opt) => this.#toSym(v, opt.sym) },
      { is: (v) => v instanceof RegExp, to: (v) => String(v) },
      { is: Array.isArray, to: (v, opt) => this.#toAry(v, opt) },
      { is: this.#isIns, to: (v, opt) => this.#toIns(v, opt.ins) },
      { is: (v) => typeof v === 'object', to: (v, opt) => this.#toObj(v, opt) },
      { is: this.#isFn, to: (v) => v.toString() }
    ];
  }

  /**
   * エントリポイント：オブジェクトを受け取り文字列化する
   * @param {any} v - 文字列化したい対象
   * @param {object} userOpt - ユーザーから渡されたオプション
   * @returns {string} 文字列化された結果
   */
  static inspect(v, userOpt = {}) {
    // 外部の専門クラスから、安全にマージ・検証されたプレーンな opt オブジェクトを取得
    const opt = InspectorOption.create(userOpt);
    return this.#execute(v, opt);
  }

  // ループと判定を伴う再帰処理のコア
  static #execute(v, opt) {
    for (const { is, to } of this.#strategies) {
      if (is.call(this, v)) return to.call(this, v, opt);
    }
    return String(v);
  }

  // --- 判定用静的プライベートメソッド ---
  static #isFn(v) { return typeof v === 'function'; }
  static #isCls(v) { return this.#isFn(v) && /^[A-Z]+/.test(v.name); }
  static #isIns(v) {
    if (v === null || typeof v !== 'object' || Array.isArray(v) || v instanceof RegExp) return false;
    const proto = Object.getPrototypeOf(v);
    return proto !== Object.prototype && proto !== null;
  }

  // --- 文字列化の具象ロジック（ObStが正当に所有するメソッド群） ---
  
  static #toStr(v, strOpt) {
    if (strOpt._rawFn) return strOpt._rawFn(v);
    const q = strOpt.quote;
    return `${q}${v.replace(new RegExp(q, 'g'), `\\${q}`)}${q}`;
  }

  static #toSym(v, symOpt) {
    if (symOpt._rawFn) return symOpt._rawFn(v);
    if (symOpt.mode === 'exception') throw new Error('Symbol文字列化禁止');
    
    const description = v.description ?? '';
    if (symOpt.mode === 'raw') return `Symbol(${description})`;
    
    const q = symOpt.quote;
    return `Symbol(${q}${description.replace(new RegExp(q, 'g'), `\\${q}`)}${q})`;
  }

  static #toIns(v, insOpt) {
    if (insOpt._rawFn) return insOpt._rawFn(v);
    if (insOpt.mode === 'exception') throw new Error('インスタンス文字列化禁止');
    
    const name = v.constructor ? v.constructor.name : 'Object';
    return `new ${name}(/*引数情報消失*/)`;
  }

  // 配列およびオブジェクトは内部で再度 #execute を呼ぶため個別に残す
  static #toAry(v, opt) {
    return `[${v.map(item => this.#execute(item, opt)).join(', ')}]`;
  }

  static #toObj(v, opt) {
    const pairs = Object.entries(v).map(([key, value]) => {
      const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
      return `${validKey}: ${this.#execute(value, opt)}`;
    });
    return `{${pairs.join(', ')}}`;
  }
}
