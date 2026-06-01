import { expect, test, describe } from "bun:test";
import { InspectorOption } from "../../src/part/inspector-option.js";
const terr = (F, E, M) => {
    try {
        F();
        expect.unreachable("例外が発生すべき箇所で発生しませんでした。");
    } catch (error) {
        expect(error).toBeInstanceOf(E);
        expect(error.message).toBe(M);
    }
};
describe("InspectorOption", () => {
    test('exist', ()=>expect(InspectorOption).toBeDefined());
    describe("create()", () => {
        test('exist', ()=>expect(InspectorOption.create).toBeInstanceOf(Function));
        describe("例外発生", () => {
            test('()',()=>terr(()=>InspectorOption.create(), Error, `引数不正。オブジェクトを渡してください。{str:{quote:"'"}, sym:{quote:"'",mode:"standard"}, ins:{mode:"lost"}}または{str:v=>\`"${v}"\`, sym:v=>`Symbol("${v.description}")`, ins:v=>`new ${v.constructor.name}(/*引数情報消失*/)`}などが有効です。`)());
            test('({x:1})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。xは不正なキーです。`)());
            test('({str:{x:1}})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。str.xは不正なキーです。`)());
            test('({sym:{x:1}})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。sym.xは不正なキーです。`)());
            test('({ins:{x:1}})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。ins.xは不正なキーです。`)());
            test('({str:1})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。strは{quote:"'"}またはv=>\`"${v}"\`等であるべきです。`)());
            test('({sym:1})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。symは{quote:"'",mode:"standard"}またはv=>\`Symbol("${v.description}")\`等であるべきです。`)());
            test('({ins:1})',()=>terr(()=>InspectorOption.create({x:1}), Error, `引数不正。insは{mode:"lost"}またはv=>\`new ${v.constructor.name}(/*引数情報消失*/)"\`等であるべきです。`)());
            test('({str:{quote:'不正値'}})',()=>terr(()=>InspectorOption.create({str:quote:'不正値'}), Error, "str.quoteは',\",`のみ有効です。実際:不正値"));
            test('({sym:{quote:'不正値'}})',()=>terr(()=>InspectorOption.create({sym:quote:'不正値'}), Error, "sym.quoteは',\",`のみ有効です。実際:不正値"));
            test('({sym:{mode:'不正値'}})',()=>terr(()=>InspectorOption.create({sym:mode:'不正値'}), Error, "sym.modeはstandard,exception,rawのみ有効です。実際:不正値"));
            test('({ins:{mode:'不正値'}})',()=>terr(()=>InspectorOption.create({ins:mode:'不正値'}), Error, "ins.modeはlost,exceptionのみ有効です。実際:不正値"));
        });
        describe("正常", () => {
            describe("デフォルト値が想定通り", () => {
                test('({})',()=>{
                    const opt = InspectorOption.create({});
                    expect(opt.str.quote).toBe(',');
                    expect(opt.sym.quote).toBe(',');
                    expect(opt.sym.mode).toBe('standard');
                    expect(opt.ins.mode).toBe('lost');
                });
            });
            describe("規定プロパティに既定値をセットでき対象以外が変更されないこと", () => {
                test.each([[`'`,'"','`']])('str.quote=%p',()=>{
                    const opt = InspectorOption.create({str:{quote:v}});
                    expect(opt.str.quote).toBe(v);
                    expect(opt.sym.quote).toBe(',');
                    expect(opt.sym.mode).toBe('standard');
                    expect(opt.ins.mode).toBe('lost');
                });
                test.each([[`'`,'"','`']])('sym.quote=%p',()=>{
                    const opt = InspectorOption.create({sym:{quote:v}});
                    expect(opt.str.quote).toBe(',');
                    expect(opt.sym.quote).toBe(v);
                    expect(opt.sym.mode).toBe('standard');
                    expect(opt.ins.mode).toBe('lost');
                });
                test.each([['standard', 'exception', 'raw']])('sym.mode=%p',()=>{
                    const opt = InspectorOption.create({sym:{mode:v}});
                    expect(opt.str.quote).toBe(',');
                    expect(opt.sym.quote).toBe(',');
                    expect(opt.sym.mode).toBe(v);
                    expect(opt.ins.mode).toBe('lost');
                });
                test.each([['lost', 'exception']])('ins.mode=%p',()=>{
                    const opt = InspectorOption.create({ins:{mode:v}});
                    expect(opt.str.quote).toBe(',');
                    expect(opt.sym.quote).toBe(',');
                    expect(opt.sym.mode).toBe('standard');
                    expect(opt.ins.mode).toBe(v);
                });
            });
        });
    });
});

