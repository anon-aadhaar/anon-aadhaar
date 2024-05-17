import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import jsQR from 'jsqr'
import { AadhaarQRValidation } from './types'

export function text(emoji: string, text: string) {
  const msp = '\u2003' // 1em space
  return `${emoji}${msp}${text}`
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

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/**
 * Fetch the public key certificate from the serverless function endpoint.
 * @param url Endpoint URL to fetch the public key.
 * @returns {Promise<string | null>} The official Aadhaar public key.
 */
export const fetchCertificateFile = async (
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

export async function fetchKey(keyURL: string, maxRetries = 3) {
  let attempts = 0
  while (attempts < maxRetries) {
    try {
      const response = await fetch(keyURL)
      if (!response.ok) {
        throw new Error(
          `Error while fetching ${keyURL} artifacts from prover: ${response.statusText}`,
        )
      }

      const data = await response.text()
      return data
    } catch (error) {
      attempts++
      if (attempts >= maxRetries) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
    }
  }
  return keyURL
}

export const createBlobURL = (icon: string) => {
  const blob = new Blob([icon], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}
