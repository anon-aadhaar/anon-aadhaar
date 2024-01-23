import { writeFileSync } from 'fs'
import { splitToWords } from 'anon-aadhaar-pcd'
import { genData } from '../../core/test/utils'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'

import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'

const main = () => {
  const signedData = 'Hello-world'

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
    }
    writeFileSync('build/input.json', JSON.stringify(input))
  })
}

main()
