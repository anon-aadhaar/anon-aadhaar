import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { AadhaarPdfValidation } from './interface'
import { Buffer } from 'buffer'

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
