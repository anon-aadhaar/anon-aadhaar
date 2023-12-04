import { pki, md, asn1 } from 'node-forge'
import { extractCert, extractSignature, handleError } from './utils'
import { WitnessPDFInputs } from './types'
import { Buffer } from 'buffer'

/**
 * Extract all the information needed to generate the witness from the pdf.
 * @param pdf pdf buffer
 * @param pwd pdf password
 * @returns {witness}
 */
export const extractWitness = async (
  pdfData: Buffer,
  password: string
): Promise<WitnessPDFInputs | Error> => {
  try {
    // Extractiong the Pdf Data that have to be hashed and the RSA signature of the hash
    const { signedData, signature } = extractSignature(pdfData)

    if (signature === '') throw Error('Missing pdf signature')

    // RSA signature ASN1 encoded
    const asn1sig = asn1.fromDer(signature).value as string

    // Extracting the x509 certificate from PDF
    const x509Certificate = await extractCert(pdfData, password)

    // Load RSA publicKey from x509 cert in PEM format
    const RSAPublicKey = pki.certificateFromPem(
      x509Certificate.toString('pem')
    ).publicKey

    // Initiate sha1 hash algo
    const sha1 = md.sha1.create()

    // Hash PDF data with sha1
    sha1.update(signedData.toString('binary')) // defaults to raw encoding

    // Recover the signed hash from RSA signature
    const decryptData = Buffer.from(
      (RSAPublicKey as pki.rsa.PublicKey).encrypt(asn1sig, 'RAW'),
      'binary'
    )

    // Convert sha1 hash from PDF Data to bytes
    const hash = Buffer.from(sha1.digest().bytes(), 'binary')

    // Compare hash from signature and hash computed from PDF Data
    const isValid = Buffer.compare(decryptData.subarray(236, 256), hash) === 0

    if (!isValid) throw Error('Signature not valid')

    const msgBigInt = BigInt('0x' + hash.toString('hex'))
    const sigBigInt = BigInt(
      '0x' + Buffer.from(asn1sig, 'binary').toString('hex')
    )
    const modulusBigInt = BigInt(
      '0x' + (RSAPublicKey as pki.rsa.PublicKey).n.toString(16)
    )

    return { msgBigInt, sigBigInt, modulusBigInt }
  } catch (error) {
    return handleError(error, '[Unable to extract the witness from the pdf]')
  }
}
