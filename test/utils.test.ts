import { describe } from 'mocha'
import { splitToWords } from '../src/utils'
import { expect } from 'chai'

describe('Utils tests', function () {
  it('splitToWords succesfully', () => {
    const number = BigInt('255')
    const result = splitToWords(number, 1n, 8n)
    const expected = ['1', '1', '1', '1', '1', '1', '1', '1']
    expect(result).to.deep.eq(expected)
  })

  it('splitToWords failed', () => {
    const fn = () => splitToWords(256n, 2n, 4n)
    expect(fn).to.throw()
  })
})
