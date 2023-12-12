import * as crypto from 'crypto'
import pako from 'pako'
import fs from 'fs'

function convertBase10ToBigInt(value: string): bigint {
  return BigInt(value)
}

export function convertBigIntToByteArray(bigInt: bigint) {
  let byteLength = Math.max(1, Math.ceil(bigInt.toString(2).length / 8))

  let result = new Uint8Array(byteLength)
  let i = 0
  while (bigInt > 0) {
    result[i] = Number(bigInt % BigInt(256))
    bigInt = bigInt / BigInt(256)
    i += 1
  }
  return result.reverse()
}

export function decompressByteArray(byteArray: Uint8Array) {
  let decompressedArray = pako.inflate(byteArray)
  return decompressedArray
}

function findDelimiter(byteArray: Uint8Array, startIndex: number) {
  let delimiterIndex = byteArray.indexOf(255, startIndex)
  return delimiterIndex
}

function readAndConvertToString(
  byteArray: Uint8Array,
  startIndex: number,
  endIndex: number,
) {
  let stringBytes = byteArray.slice(startIndex, endIndex)
  let decoder = new TextDecoder('ISO-8859-1')
  let stringValue = decoder.decode(stringBytes)
  return stringValue
}

export function readSignature(byteArray: Uint8Array) {
  let signatureStartIndex = byteArray.length - 256
  let signature = byteArray.slice(signatureStartIndex, byteArray.length)
  return signature
}

const extract = (n: string) => {
  const bigIntData = convertBase10ToBigInt(n)

  const byteArray = convertBigIntToByteArray(bigIntData)
  console.log('Array of bytes: ', byteArray)

  const decompressedByteArray = decompressByteArray(byteArray)
  console.log(decompressedByteArray)

  let dilimiter = findDelimiter(decompressedByteArray, 0)
  console.log(dilimiter)

  const Email_mobile_present_bit_indicator: Record<number, string> = {
    0: 'Not Email/Mobile',
    1: 'Only Email',
    2: 'Only Mobile',
    3: 'Both email/Mobile',
  }

  const isMobileOrEmailAvailable = readAndConvertToString(
    decompressedByteArray,
    0,
    dilimiter,
  )

  console.log(
    'Is mobile or email?: ',
    Email_mobile_present_bit_indicator[Number(isMobileOrEmailAvailable)],
  )

  const value: string[] = []
  const userDetails = {
    referenceId: '',
    name: '',
    dob: '',
    gender: '',
    careof: '',
    address: {
      district: '',
      landmark: '',
      house: '',
      location: '',
      pincode: '',
      postoffice: '',
      State: '',
      Street: '',
      Subdistrict: '',
      VTC: '',
    },
  }

  for (let i = 0; i < 15; i++) {
    // dilimiter = dilimiter + 1
    const nextDilimeter = findDelimiter(decompressedByteArray, dilimiter + 1)
    console.log('nextDilimeter', dilimiter)

    const referenceId: string = readAndConvertToString(
      decompressedByteArray,
      dilimiter + 1,
      nextDilimeter,
    )
    value.push(referenceId)
    dilimiter = nextDilimeter
    console.log(i, 'referenceId', referenceId)
  }
}

const verifySignature = (n: string) => {
  const bigIntData = convertBase10ToBigInt(n)

  const byteArray = convertBigIntToByteArray(bigIntData)

  const decompressedByteArray = decompressByteArray(byteArray)

  // Read signature data
  const signature = readSignature(decompressedByteArray)
  //   console.log("signature", signature);
  //   console.log("signature", Buffer.from(signature).toString("base64"));
  //   console.log("signature", signature.length);

  const certData = fs.readFileSync(
    __dirname + '/assets/uidai_offline_publickey_26022021.cer',
  )

  const pk = crypto.createPublicKey(certData)

  const signedData = decompressedByteArray.slice(0, -256)

  const isSignatureValid = crypto.verify(
    'sha256WithRSAEncryption',
    signedData,
    pk,
    signature,
  )

  console.log(isSignatureValid)
}
