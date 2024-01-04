import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { AadhaarPdfValidation } from './interface'
import { Buffer } from 'buffer'
import jsQR from 'jsqr'
import { convertBigIntToByteArray, decompressByteArray } from 'anon-aadhaar-pcd'
import { pki } from 'node-forge'
import { AadhaarQRValidation } from './interface'

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

const getSubstringIndex = (str: Buffer, substring: string, n: number) => {
  let times = 0
  let index = 0

  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1)
    times += 1
  }

  return index
}

export function text(emoji: string, text: string) {
  const msp = '\u2003' // 1em space
  return `${emoji}${msp}${text}`
}

/**
 * Handle the upload of the pdf, extract the signature and the signed data.
 * @param pdf pdf buffer
 * @returns {Signature, signedData}
 */
export const uploadPdf = (
  e: ChangeEvent<HTMLInputElement>,
  setpdfStatus: Dispatch<SetStateAction<null | AadhaarPdfValidation>>,
): Promise<{ pdf: Buffer }> => {
  return new Promise((resolve, reject) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader()
        fileReader.readAsBinaryString(e.target.files[0])
        fileReader.onload = e => {
          if (e.target) {
            try {
              const { signature } = extractSignature(
                Buffer.from(e.target.result as string, 'binary'),
              )

              if (signature != '') {
                resolve({
                  pdf: Buffer.from(e.target.result as string, 'binary'),
                })
                setpdfStatus(AadhaarPdfValidation.SIGNATURE_PRESENT)
              } else {
                setpdfStatus(AadhaarPdfValidation.SIGNATURE_NOT_PRESENT)
              }
            } catch (error) {
              setpdfStatus(AadhaarPdfValidation.ERROR_PARSING_PDF)
              reject(error)
            }
          }
        }
      } catch {
        setpdfStatus(null)
        reject()
      }
    }
  })
}

/**
 * Handle the upload of the pdf, extract the signature and the signed data.
 * @param pdf pdf buffer
 * @returns {Signature, signedData}
 */
export const uploadQRpng = (
  e: ChangeEvent<HTMLInputElement>,
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>,
): Promise<{ qrValue: string }> => {
  return new Promise((resolve, reject) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(e.target.files[0])
        fileReader.onload = e => {
          if (e.target && e.target.result) {
            try {
              const image = new Image()
              image.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = image.width
                canvas.height = image.height
                const ctx = canvas.getContext('2d')

                if (!ctx) throw Error('Image cannot be reconstructed')

                ctx.drawImage(image, 0, 0)
                const imageData = ctx.getImageData(
                  0,
                  0,
                  image.width,
                  image.height,
                )

                const qrValue = jsQR(imageData.data, image.width, image.height)

                if (qrValue != null) {
                  resolve({
                    qrValue: qrValue.data,
                  })
                  setQrStatus(AadhaarQRValidation.QR_CODE_SCANNED)
                } else {
                  setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR)
                }
              }
              image.src = e.target.result.toString()
            } catch (error) {
              setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR)
              console.error(error)
              reject(error)
            }
          }
        }
      } catch {
        setQrStatus(null)
        reject(new Error('No file selected'))
      }
    }
  })
}

/**
 * Fetch the public key certificate from the serverless function endpoint.
 * @param url Endpoint URL to fetch the public key.
 * @returns {Promise<string | null>} The official Aadhaar public key.
 */
export const fetchRawPublicKey = async (
  certUrl: string,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nodejs-serverless-function-express-eight-iota.vercel.app/api/get-raw-pk?url=${certUrl}`,
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch public key from server`)
    }

    const { certData } = await response.json()
    return certData
  } catch (error) {
    console.error('Error fetching public key:', error)
    return null
  }
}

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export const verifySignature = async (n: string): Promise<boolean> => {
  const bigIntData = BigInt(n)

  const byteArray = convertBigIntToByteArray(bigIntData)

  const decompressedByteArray = decompressByteArray(byteArray)

  // Read signature data
  const signature = decompressedByteArray.slice(
    decompressedByteArray.length - 256,
    decompressedByteArray.length,
  )

  const signedData = decompressedByteArray.slice(
    0,
    decompressedByteArray.length - 256,
  )

  const cert = await fetchRawPublicKey(
    'https://www.uidai.gov.in/images/authDoc/uidai_offline_publickey_26022021.cer',
  )

  if (cert === null) throw Error('Error while fetch')

  const publicKey = pki.certificateFromPem(cert).publicKey
  const publicKeyPem = pki.publicKeyToPem(publicKey)

  // fetch the part of the PEM string between header and footer
  const pemHeader = '-----BEGIN PUBLIC KEY-----'
  const pemFooter = '-----END PUBLIC KEY-----'
  const pemContents = publicKeyPem.substring(
    pemHeader.length,
    publicKeyPem.length - pemFooter.length - 2,
  )

  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents)
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString)

  const pk = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['verify'],
  )

  const isSignatureValid = await window.crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    pk,
    signature.buffer,
    signedData.buffer,
  )

  return isSignatureValid
}
