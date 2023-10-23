import { extractCert, extractSignature } from 'anon-aadhaar-pcd'
import * as forge from 'node-forge'

/**
 * Extract all the information needed to generate the witness from the pdf.
 * @param pdf pdf buffer
 * @param pwd pdf password
 * @returns {witness}
 */
export const extractWitness = async (
  pdfData: Buffer,
  password: string,
): Promise<{
  msgBigInt: bigint
  sigBigInt: bigint
  modulusBigInt: bigint
} | void> => {
  try {
    const { signature } = extractSignature(pdfData)

    if (signature === '') throw Error('Missing pdf signature')

    const asn1sig = forge.asn1.fromDer(signature).value as string

    const cer = await extractCert(pdfData, password)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cert = (forge as any).pki.certificateFromPem(cer.toString('pem'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (forge as any).md.sha1.create()
    md.update(pdfData.toString('binary')) // defaults to raw encoding

    const decryptData = Buffer.from(
      cert.publicKey.encrypt(asn1sig, 'RAW'),
      'binary',
    )
    const hash = Buffer.from(md.digest().bytes(), 'binary')

    const isValid = Buffer.compare(decryptData.subarray(236, 256), hash) === 0

    if (isValid) {
      const msgBigInt = BigInt('0x' + hash.toString('hex'))
      const sigBigInt = BigInt(
        '0x' + Buffer.from(asn1sig, 'binary').toString('hex'),
      )
      const modulusBigInt = BigInt('0x' + cert.publicKey.n.toString(16))
      // setsignatureValidity(AadhaarSignatureValidition.SIGNATURE_VALID)
      // setcertificateStatus(
      //   AadhaarCertificateValidation.CERTIFICATE_CORRECTLY_FORMATTED,
      // )
      return { msgBigInt, sigBigInt, modulusBigInt }
    }
  } catch (error) {
    //   setsignatureValidity(AadhaarSignatureValidition.SIGNATURE_INVALID)
    //   setcertificateStatus(
    //     AadhaarCertificateValidation.ERROR_PARSING_CERTIFICATE,
    //   )
    console.log(error)
  }
}
