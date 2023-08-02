import { describe } from 'mocha'
import { splitToWords } from '../src/utils'
import { expect } from 'chai'
import { PDFUtils } from '../src/utils/pdf'
import fs from 'fs'

describe('Utils tests', function () {
  it('splitToWords succesfully', () => {
    const number = BigInt('255')
    const result = splitToWords(number, BigInt(1), BigInt(8))
    const expected = ['1', '1', '1', '1', '1', '1', '1', '1']
    expect(result).to.deep.eq(expected)
  })

  it('splitToWords failed', () => {
    const fn = () => splitToWords(BigInt(256), BigInt(2), BigInt(4))
    expect(fn).to.throw()
  })
})

describe.only('Pdf test', function () {
  let pdfUtils: PDFUtils
  this.beforeEach(() => {
    console.log(__dirname)
    const pdf = fs.readFileSync(__dirname + '/assets/output.pdf')
    pdfUtils = new PDFUtils(pdf)
  })
  it('Test', () => {
    pdfUtils.extractCert()
  })
})
