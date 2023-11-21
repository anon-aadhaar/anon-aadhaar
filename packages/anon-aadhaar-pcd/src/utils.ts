import { decryptPDF } from 'spdf'
import { Proof } from './types'
import { Groth16Proof } from 'snarkjs'
import { subtle } from 'crypto'
import * as x509 from '@peculiar/x509'

export const handleError = (error: unknown, defaultMessage: string): Error => {
  if (error instanceof Error) return error

  let stringified = defaultMessage
  try {
    stringified = JSON.stringify(error)
    // eslint-disable-next-line no-empty
  } catch {}

  const err = new Error(
    `This value was thrown as is, not through an Error: ${stringified}`
  )
  return err
}

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
export function packProof(originalProof: Groth16Proof): Proof {
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

function buffToBigInt(buff: string): bigint {
  return BigInt('0x' + Buffer.from(buff, 'base64url').toString('hex'))
}

async function generateRsaKey(hash = 'SHA-256') {
  const publicExponent = new Uint8Array([1, 0, 1])
  const modulusLength = 2048
  const { publicKey, privateKey } = await subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent,
      hash,
    },
    true,
    ['sign', 'verify']
  )

  return { publicKey, privateKey }
}

export async function genData(
  data: string,
  HASH_ALGO: string
): Promise<[bigint, bigint, bigint, bigint]> {
  const keys = await generateRsaKey(HASH_ALGO)

  const public_key = await subtle.exportKey('jwk', keys.publicKey)

  const enc = new TextEncoder()
  const text = enc.encode(data)
  const hash = BigInt(
    '0x' + Buffer.from(await subtle.digest(HASH_ALGO, text)).toString('hex')
  )

  const sign_buff = await subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: HASH_ALGO },
    keys.privateKey,
    text
  )

  const e = buffToBigInt(public_key.e as string)
  const n = buffToBigInt(public_key.n as string)
  const sign = BigInt('0x' + Buffer.from(sign_buff).toString('hex'))

  return [e, sign, n, hash]
}

export const extractDecryptedCert = (
  pdfFile: Buffer,
  signaturePosition = 1
) => {
  const certPos = getSubstringIndex(pdfFile, '/Cert <', signaturePosition)

  const certEnd = pdfFile.indexOf('>', certPos)
  const byteRange = pdfFile.subarray(certPos, certEnd).toString()

  const decryptedCert = Buffer.from(byteRange.slice(7))

  return { decryptedCert }
}

/**
 * extract Cert from anon aadhaar card
 * @param pdf the encrypted pdf buffer
 * @returns certificate in pdf
 */
export async function extractCert(pdf: Buffer, password: string) {
  const decryptedPdf: Uint8Array = await decryptPDF(pdf, password)
  const { decryptedCert } = extractDecryptedCert(Buffer.from(decryptedPdf))
  return new x509.X509Certificate(decryptedCert)
}
