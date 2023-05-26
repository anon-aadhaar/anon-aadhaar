import { describe } from 'mocha'
import { splitToWordsWithName } from '../src/utils'
import { expect } from 'chai'

describe('Utils tests', () => {
  it('splitToWordsWithName succesfully', () => {
    const number = BigInt('255')
    const result = splitToWordsWithName(number, 1n, 8n)
    const expected = ['1', '1', '1', '1', '1', '1', '1', '1'];
    expect(result).to.deep.eq(expected)
  })
  it('splitToWordsWithName failed', () => {
    const fn = () => splitToWordsWithName(256n, 2n, 4n)
    expect(fn).to.throw()
  })
})
