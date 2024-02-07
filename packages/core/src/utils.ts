import { PackedGroth16Proof } from './types'
import { Groth16Proof } from 'snarkjs'
import pako from 'pako'
import { storageService as defaultStorageService } from './storage'

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
 * Packs a proof into a format compatible with AnonAadhaar.sol contract.
 * @param originalProof The proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
export function packGroth16Proof(
  groth16Proof: Groth16Proof
): PackedGroth16Proof {
  return [
    groth16Proof.pi_a[0],
    groth16Proof.pi_a[1],
    groth16Proof.pi_b[0][1],
    groth16Proof.pi_b[0][0],
    groth16Proof.pi_b[1][1],
    groth16Proof.pi_b[1][0],
    groth16Proof.pi_c[0],
    groth16Proof.pi_c[1],
  ]
}

/**
 * Fetch the public key file from the serverless function endpoint.
 * @param url Endpoint URL from where to fetch the public key.
 * @returns {Promise<string | null>} The official Aadhaar public key in bigint string format.
 *
 * See the endpoint implementation here: [Endpoint Code](https://github.com/anon-aadhaar-private/nodejs-serverless-function-express/blob/main/api/get-public-key.ts)
 */
export const fetchPublicKey = async (
  certUrl: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nodejs-serverless-function-express-eight-iota.vercel.app/api/get-public-key?url=${certUrl}`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch public key from server`)
    }

    const publicKeyData = await response.json()
    return publicKeyData.publicKey || null
  } catch (error) {
    console.error('Error fetching public key:', error)
    return null
  }
}

export function convertBigIntToByteArray(bigInt: bigint) {
  const byteLength = Math.max(1, Math.ceil(bigInt.toString(2).length / 8))

  const result = new Uint8Array(byteLength)
  let i = 0
  while (bigInt > 0) {
    result[i] = Number(bigInt % BigInt(256))
    bigInt = bigInt / BigInt(256)
    i += 1
  }
  return result.reverse()
}

export function decompressByteArray(byteArray: Uint8Array) {
  const decompressedArray = pako.inflate(byteArray)
  return decompressedArray
}

export const enum SELECTOR_ID {
  null = 0,
  emailOrPhone,
  referenceId,
  name,
  dob,
  gender,
  careOf,
  district,
  landmark,
  house,
  location,
  pinCode,
  postOffice,
  state,
  street,
  subDistrict,
  VTC,
}

export function readData(data: number[], index: number) {
  let count = 0
  let start = 0
  let end = data.indexOf(255, start)

  while (count != index) {
    start = end + 1
    end = data.indexOf(255, start)
    count++
  }

  return data.slice(start, end)
}

export function extractPhoto(qrData: number[]) {
  let begin = 0
  for (let i = 0; i < 16; ++i) {
    begin = qrData.indexOf(255, begin + 1)
  }

  const end = qrData.length - 65
  return {
    begin,
    end,
    photo: qrData.slice(begin, end + 1),
  }
}

export const searchZkeyChunks = async (
  zkeyPath: string,
  storageService = defaultStorageService,
  useTestAadhaar = false
) => {
  for (let i = 0; i < 10; i++) {
    const fileName = useTestAadhaar
      ? `circuit_final_test_${i}.zkey`
      : `circuit_final_prod_${i}.zkey`
    const item = await storageService.getItem(fileName)
    if (item) {
      console.log(`${fileName} already found in localforage!`)
      continue
    }
    await downloadAndStoreCompressedZkeyChunks(
      zkeyPath,
      i,
      fileName,
      storageService
    )
  }
}

const downloadAndStoreCompressedZkeyChunks = async (
  zkeyPath: string,
  index: number,
  fileName: string,
  storageService = defaultStorageService
) => {
  try {
    const response = await fetch(zkeyPath + `/circuit_final_${index}.gz`)

    if (!response.ok)
      throw Error('Error while fetching compressed chunked zkey')

    console.log(`Fetched zkey chunk #${index}`)

    const compressedChunk = await response.arrayBuffer()
    const uncompressedChunk = pako.ungzip(compressedChunk)

    await storageService.setItem(fileName, uncompressedChunk)
  } catch (e) {
    console.log(e)
  }
}
