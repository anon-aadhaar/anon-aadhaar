import { SnarkJSProof, Proof } from './types'

const getSubstringIndex = (str: Buffer, substring: string, n: number) => {
  let times = 0
  let index = 0

  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1)
    times += 1
  }

  return index
}

/**
 * Get signature from pdf. Thank a another authors for this piece of code.
 * @param pdf pdf buffer
 * @param signaturePosition the position of signature
 * @returns {RangeByte, signature and signedData}
 */
export const extractSignature = (pdf: Buffer, signaturePosition = 1) => {
  const byteRangePos = getSubstringIndex(pdf, '/ByteRange [', signaturePosition)

  const byteRangeEnd = pdf.indexOf(']', byteRangePos)
  const byteRange = pdf.subarray(byteRangePos, byteRangeEnd + 1).toString()
  const matches = /\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/.exec(byteRange)

  if (matches == null) {
    return {
      ByteRange: [0],
      signature: '',
      signedData: Buffer.from([]),
    }
  } else {
    const ByteRange = matches.slice(1).map(Number)
    const signedData = Buffer.concat([
      pdf.subarray(ByteRange[0], ByteRange[0] + ByteRange[1]),
      pdf.subarray(ByteRange[2], ByteRange[2] + ByteRange[3]),
    ])
    const signatureHex = pdf
      .subarray(ByteRange[0] + ByteRange[1] + 1, ByteRange[2])
      .toString('binary')
      .replace(/(?:00|>)+$/, '')
    const signature = Buffer.from(signatureHex, 'hex').toString('binary')
    return {
      ByteRange: matches.slice(1, 5).map(Number),
      signature,
      signedData,
    }
  }
}

export function splitToWords(
  number: bigint,
  wordsize: bigint,
  numberElement: bigint
) {
  let t = number
  const words: string[] = []
  for (let i = BigInt(0); i < numberElement; ++i) {
    const baseTwo = BigInt(2)

    words.push(`${t % BigInt(Math.pow(Number(baseTwo), Number(wordsize)))}`)
    t = BigInt(t / BigInt(Math.pow(Number(BigInt(2)), Number(wordsize))))
  }
  if (!(t == BigInt(0))) {
    throw `Number ${number} does not fit in ${(
      wordsize * numberElement
    ).toString()} bits`
  }
  return words
}

/**
 * Packs a proof into a format compatible with Semaphore.
 * @param originalProof The proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
export function packProof(originalProof: SnarkJSProof): Proof {
  return [
    originalProof.pi_a[0],
    originalProof.pi_a[1],
    originalProof.pi_b[0][1],
    originalProof.pi_b[0][0],
    originalProof.pi_b[1][1],
    originalProof.pi_b[1][0],
    originalProof.pi_c[0],
    originalProof.pi_c[1],
  ]
}

/**
 * Unpacks a proof into its original form.
 * @param proof The proof compatible with Semaphore.
 * @returns The proof compatible with SnarkJS.
 */
export function unpackProof(proof: Proof): SnarkJSProof {
  return {
    pi_a: [proof[0], proof[1]],
    pi_b: [
      [proof[3], proof[2]],
      [proof[5], proof[4]],
    ],
    pi_c: [proof[6], proof[7]],
    protocol: 'groth16',
    curve: 'bn128',
  }
}
