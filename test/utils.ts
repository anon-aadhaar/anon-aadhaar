import { describe } from "mocha";
import { splitToWordsWithName } from "../src/utils";
import { expect } from "chai";

describe("Utils tests", () => {
    it("splitToWordsWithName succesfully", () => {
        const number = BigInt("255");
        const result = splitToWordsWithName(number, 1n, 8n, "bin");
        const expected = {
            'bin[0]': '1',
            'bin[1]': '1',
            'bin[2]': '1',
            'bin[3]': '1',
            'bin[4]': '1',
            'bin[5]': '1',
            'bin[6]': '1',
            'bin[7]': '1',
        }
        expect(result).to.deep.eq(expected);
    })
    it("splitToWordsWithName failed", () => {
        const fn = () => splitToWordsWithName(256n, 2n, 4n, "bin");
        expect(fn).to.throw();
    })
})