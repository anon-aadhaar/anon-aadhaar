import { describe } from "mocha";
import { splitToWordsWithName } from "../src/utils";
import { expect } from "chai";

describe("Utils tests", () => {
    it("splitToWordsWithName succesfully", () => {
        let number = BigInt("255");
        let result = splitToWordsWithName(number, 1n, 8n, "bin");
        let expected = {
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
        let fn = () => splitToWordsWithName(256n, 2n, 4n, "bin");
        expect(fn).to.throw();
    })
})