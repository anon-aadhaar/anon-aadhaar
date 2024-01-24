import { writeFileSync } from 'fs'
import { hash, splitToWords } from '@anon-aadhaar/core'
import { genData } from '../../core/test/utils'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'

import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'

const main = () => {
  const signedData = 'Hello-20240116140412'

  genData(signedData, 'SHA-256').then(data => {
    const [paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3,
    )

    const input = {
      aadhaarData: Uint8ArrayToCharArray(paddedMsg),
      aadhaarDataLength: messageLen,
      signature: splitToWords(data[1], BigInt(64), BigInt(32)),
      pubKey: splitToWords(data[2], BigInt(64), BigInt(32)),
      signalHash: hash(1),
    }
    writeFileSync('build/input.json', JSON.stringify(input))
  })
}

main()
