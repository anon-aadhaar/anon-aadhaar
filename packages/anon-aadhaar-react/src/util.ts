import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { AadhaarPdfValidation } from './interface'

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
  setpdfStatus: Dispatch<SetStateAction<'' | AadhaarPdfValidation>>,
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
        setpdfStatus('')
        reject()
      }
    }
  })
}

/**
 * Fetch the public key PEM file from the serverless function endpoint.
 * @param url Endpoint URL to fetch the public key.
 * @returns {Promise<string | null>} The official Aadhaar public key.
 */
export const fetchPublicKey = async (
  certUrl: string,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nodejs-serverless-function-express-eight-iota.vercel.app/api/get-public-key?url=${certUrl}`,
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
