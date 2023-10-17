import { describe } from 'mocha'
import { extractCert, splitToWords } from '../src/utils'
import { expect } from 'chai'
import { readFileSync } from 'fs'

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

  it.only('Extract RSA public key from encrypted PDF certificate', async () => {
    const pdf = readFileSync(__dirname + '/assets/encrypted.pdf')
    const password = ''

    const cert = await extractCert(pdf, password)

    const publicKeyPem = readFileSync(
      __dirname + '/assets/AadhaarPublicKey.pem',
      {
        encoding: 'utf8',
      }
    )

    expect(cert.publicKey.toString()).to.equal(publicKeyPem)
  })
})
