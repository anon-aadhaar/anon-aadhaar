import { writeFileSync } from 'fs'
import { splitToWords } from 'anon-aadhaar-pcd'
import { genData } from '../../anon-aadhaar-pcd/test/utils'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'

import {
  Uint8ArrayToCharArray,
} from '@zk-email/helpers/dist/binaryFormat'

const main = () => {
  const signedData = 'Hello-world'

  genData(signedData, 'SHA-256').then(data => {
    const [paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3,
    )
  

    const input = {
      padded_message: Uint8ArrayToCharArray(paddedMsg),
      message_len: messageLen,
      signature: splitToWords(data[1], BigInt(64), BigInt(32)),
      modulus: splitToWords(data[2], BigInt(64), BigInt(32)),
    }
    writeFileSync('build/input.json', JSON.stringify(input))
  })
}



main();
