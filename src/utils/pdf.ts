/* eslint-disable @typescript-eslint/no-unused-vars */
import { IdentityPCDArgs } from '../types'
import { extractSignature, getSubstringIndex } from '../utils'
import forge, { sha1 } from 'node-forge'

function derToCert(der: string) {
  const asnObj = forge.asn1.fromDer(
    new forge.util.ByteStringBuffer(Buffer.from(der, 'hex'))
  )
  const asn1Cert = forge.pki.certificateFromAsn1(asnObj)
  return asn1Cert
}

export class PDFUtils {
  pdf: Buffer

  constructor(pdfBuffer: Buffer) {
    this.pdf = pdfBuffer
  }

  extractSignature() {
    throw Error('unimplement yet!')
  }

  extractCert() {
    const pdfCertObjOpen = '/Cert <'
    const pdfCertObjClose = '>'

    const begin = getSubstringIndex(this.pdf, pdfCertObjOpen, 1)
    const end = this.pdf.indexOf(pdfCertObjClose, begin)
    const cerRange = this.pdf
      .subarray(begin + pdfCertObjOpen.length, end)
      .toString()
    return derToCert(cerRange)
  }

  toPCDArgs(): IdentityPCDArgs {
    const { signedData, signature, ByteRange } = extractSignature(this.pdf)
    const cert: forge.pki.Certificate = this.extractCert()
    const publicKey = cert.publicKey as forge.pki.rsa.PublicKey

    const md = forge.md.sha1.create()
    md.update(signedData.toString('hex'))

    const args = {
      base_message: md.digest().toHex(),
      modulus: publicKey.n,
      signature: signature,
    }

    console.log(args)
    return args as any
  }
}
