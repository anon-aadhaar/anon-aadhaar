import { writeFileSync } from 'fs'
import { genData, splitToWords } from '../src'
import crypto from 'crypto'

const main = () => {
  genData('Hello world', 'SHA-1').then(testData => {
    const app_id = BigInt(parseInt(crypto.randomBytes(20).toString('hex'), 16))
    const input = {
      signature: splitToWords(BigInt(testData[1]), BigInt(64), BigInt(32)),
      modulus: splitToWords(BigInt(testData[2]), BigInt(64), BigInt(32)),
      base_message: splitToWords(BigInt(testData[3]), BigInt(64), BigInt(32)),
      app_id: app_id.toString(),
    }
    writeFileSync('build/input.json', JSON.stringify(input))
  })
}

main()
