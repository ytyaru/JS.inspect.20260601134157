export class InspectorOption {
  static #VAL = Object.freeze({
    QUOTES: ["'", '"', '`'],
    SYM_MODES: ['standard', 'exception', 'raw'],
    INS_MODES: ['lost', 'exception'],
  });

  static #SCHEMA = Object.freeze({
    str: Object.freeze({
      _fnExpect: 'v=>`"${v}"`等',
      quote: this.#VAL.QUOTES
    }),
    sym: Object.freeze({
      _fnExpect: 'v=>`Symbol("${v.description}")`等',
      quote: this.#VAL.QUOTES,
      mode: this.#VAL.SYM_MODES
    }),
    ins: Object.freeze({
      _fnExpect: 'v=>`new ${v.constructor.name}(/*引数情報消失*/)"`等',
      mode: this.#VAL.INS_MODES
    })
  });

  static #defaultOpt = {
    str: { quote: "'" },
    sym: { quote: "'", mode: "standard" },
    ins: { mode: "lost" }
  };

  /**
   * ユーザー入力をマージ・検証し、純粋な設定オブジェクトを新設して返す
   */
  static create(userOpt) {
    this.#check(userOpt, this.#SCHEMA);

    return {
      str: this.#normalize(userOpt.str, 'str'),
      sym: this.#normalize(userOpt.sym, 'sym'),
      ins: this.#normalize(userOpt.ins, 'ins')
    };
  }

  static #check(input, schema, path = '') {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new Error(`引数不正。オブジェクトを渡してください。{str:{quote:"'"}, sym:{quote:"'",mode:"standard"}, ins:{mode:"lost"}}または{str:v=>\`"\${v}"\`, sym:v=>\`Symbol("\${v.description}")\`, ins:v=>\`new \${v.constructor.name}(/*引数情報消失*/)\`}などが有効です。`);
    }

    const inputKeys = Object.keys(input);
    const allowedKeys = Object.keys(schema).filter(k => !k.startsWith('_'));

    // 未知のキー（タイポ）のチェック：実際値と期待値リストをセットで明示する
    for (const key of inputKeys) {
      if (!allowedKeys.includes(key)) {
        const currentPath = path ? `${path}.${key}` : key;
        throw new Error(`引数不正。実際:${currentPath}は未定義です。期待されるキー:[${allowedKeys.join(', ')}]`);
      }
    }

    for (const key of allowedKeys) {
      const value = input[key];
      if (value === undefined) continue;

      const currentPath = path ? `${path}.${key}` : key;
      const schemaNode = schema[key];

      if (typeof value === 'function') continue;

      if (Array.isArray(schemaNode)) {
        this.#valid(currentPath, value, schemaNode);
      } else {
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          const objShape = Object.keys(schemaNode)
            .filter(k => !k.startsWith('_'))
            .map(k => `${k}:"${this.#defaultOpt[key][k]}"`)
            .join(',');

          throw new Error(`引数不正。${currentPath}は{${objShape}}または${schemaNode._fnExpect}であるべきです。`);
        }
        this.#check(value, schemaNode, currentPath);
      }
    }
  }

  static #normalize(target, key) {
    if (target === undefined) {
      return { ...this.#defaultOpt[key] };
    }
    if (typeof target === 'function') {
      return { _rawFn: target };
    }
    return { ...this.#defaultOpt[key], ...target };
  }

  static #valid(path, value, allowedList) {
    if (!allowedList.includes(value)) {
      const listStr = allowedList.map(v => v === '`' ? '`' : v).join(',');
      throw new Error(`${path}は${listStr}のみ有効です。実際:${value}`);
    }
  }
}
