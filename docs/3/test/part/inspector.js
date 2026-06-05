import { expect, test, describe } from "bun:test";
import { Inspector } from "../../src/part/inspector.js";
const terr = (F, E, M) => {
    try {
        F();
        expect.unreachable("例外が発生すべき箇所で発生しませんでした。");
    } catch (error) {
        expect(error).toBeInstanceOf(E);
        expect(error.message).toBe(M);
    }
};
describe("Inspector", () => {
    test('exist', ()=>expect(Inspector).toBeDefined);
    describe("inspect()", () => {
        test('exist', ()=>expect(Inspector.inspect).toBeInstanceOf(Function));
        describe("正常", () => {
            describe("(v)", () => {
                test('NaN', ()=>expect(Inspector.inspect(NaN)).toBe('NaN'));
                test('null', ()=>expect(Inspector.inspect(null)).toBe('null'));
                test('undefined', ()=>expect(Inspector.inspect(undefined)).toBe('undefined'));
                test('Infinity', ()=>expect(Inspector.inspect(Infinity)).toBe('Infinity'));
                test('-Infinity', ()=>expect(Inspector.inspect(-Infinity)).toBe('-Infinity'));
                test('false', ()=>expect(Inspector.inspect(false)).toBe('false'));
                test('0', ()=>expect(Inspector.inspect(0)).toBe('0'));
                describe("文字列型:シングルクォート", () => {
                    test(`'a'`, ()=>expect(Inspector.inspect('a')).toBe(`'a'`));
                    test(`"a"`, ()=>expect(Inspector.inspect('a')).toBe(`'a'`));
                    test('`a`', ()=>expect(Inspector.inspect('a')).toBe(`'a'`));
                    describe("エスケープ", () => {
                        test(`"'a"->'\\'a'`, ()=>expect(Inspector.inspect("'a")).toBe(`'\\'a'`));
                    });
                });
                test('0n', ()=>expect(Inspector.inspect(0n)).toBe('0n'));
                test(`Symbol('a-b')`, ()=>expect(Inspector.inspect(Symbol('a-b'))).toBe(`Symbol('a-b')`));
                test(`Symbol.for('a-b')はforが消える`, ()=>expect(Inspector.inspect(Symbol.for('a-b'))).toBe(`Symbol('a-b')`));
                test('/^[A-Z]+/', ()=>expect(Inspector.inspect(/^[A-Z]+/)).toBe('/^[A-Z]+/'));
                test(`new RegExp('^[A-Z]+','g')`, ()=>expect(Inspector.inspect(new RegExp('^[A-Z]+','g'))).toBe('/^[A-Z]+/g'));
                test(`[]`, ()=>expect(Inspector.inspect([])).toBe('[]'));

                describe("配列型:シングルクォート＆要素間半角スペース", () => {
                    test(`[0,"a"]->[0, 'a']`, ()=>expect(Inspector.inspect([0,"a"])).toBe(`[0, 'a']`));
                });
                test(`{}`, ()=>expect(Inspector.inspect({})).toBe('{}'));
                test(`{k:1}->{ k: 1 }`, ()=>expect(Inspector.inspect({k:1})).toBe('{k: 1}'));
                test(`{k:1,l:2}->{k: 1, l: 2}`, ()=>expect(Inspector.inspect({k:1,l:2})).toBe('{k: 1, l: 2}'));
                test(`ins`,()=>expect(Inspector.inspect(new Date())).toBe(`new Date(/*引数情報消失*/)`));
//                test.each([true,false].map(v=>[v]))('(%p)', (v)=>expect(Inspector.inspect(v)).toBe('-Infinity'));
                test(`()=>{}->() => {}`, ()=>expect(Inspector.inspect(()=>{})).toBe('() => {}'));
            });


            test('exist', ()=>expect(Inspector.inspect).toBeInstanceOf(Function));
        });

    });
});

