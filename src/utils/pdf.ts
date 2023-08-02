/* eslint-disable @typescript-eslint/no-unused-vars */
import { IdentityPCDArgs } from '../types'
import { extractSignature, getSubstringIndex } from '../utils'

export class PDFUtils {
  pdf: Buffer

  constructor(pdfBuffer: Buffer) {
    this.pdf = pdfBuffer
  }

  extractSignature() {
    throw Error('unimplement yet!')
  }

  extractCert() {
    const begin = getSubstringIndex(this.pdf, '/Cert <', 1)
    console.log(begin)
    const end = this.pdf.indexOf('>', begin)
    const cerRange = this.pdf.subarray(begin, end + 1).toString()
    console.log(cerRange)
  }

  // toPCDArgs(): IdentityPCDArgs {
  //   const { signedData, signature, ByteRange } = extractSignature(this.pdf)

  //   return {}
  // }
}
