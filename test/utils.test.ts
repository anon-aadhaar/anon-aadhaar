import { describe } from 'mocha'
import { splitToWords } from '../src/utils'
import { assert, expect } from 'chai'
import { PDFUtils } from '../src/utils/pdf'
import fs from 'fs'
import { PCDInitArgs, init, prove, verify } from '../src'

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
  const pdfEncrypt = fs.readFileSync(__dirname + '/assets/other.pdf')
  const pdf = fs.readFileSync(__dirname + '/assets/output.pdf')

  this.beforeEach(() => {
    console.log(__dirname)

    pdfUtils = new PDFUtils()
  })
  it('Try get cert from pdf', async () => {
    const cert = pdfUtils.extractCert(pdf)
    const pcdArgs = pdfUtils.toPCDArgsFromCert(pdfEncrypt, cert);
    
    const dirName = __dirname + '/../artifacts'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/main.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      isWebEnv: false,
    }

    console.log(pcdArgs);
    await init(pcdInitArgs)

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')    
  })
})
