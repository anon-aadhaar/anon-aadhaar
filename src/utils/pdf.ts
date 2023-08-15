/* eslint-disable @typescript-eslint/no-unused-vars */
import { Certificate } from 'tls'
import { IdentityPCDArgs } from '../types'
import forge, { pki, sha1 } from 'node-forge'
import { ArgumentTypeName } from '@pcd/pcd-types'

const getSubstringIndex = (str: Buffer, substring: string, n: number) => {
  let times = 0
  let index = 0

  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1)
    times += 1
  }

  return index
}

function derToCert(der: string) {
  const asnObj = forge.asn1.fromDer(
    new forge.util.ByteStringBuffer(Buffer.from(der, 'hex'))
  )
  const asn1Cert = forge.pki.certificateFromAsn1(asnObj)
  return asn1Cert
}

export class PDFUtils {
  getEncryptObj(pdf: Buffer) {
    const encryptObjStart = getSubstringIndex(pdf, '/Encrypt', 1)
    const encryptEnd = pdf.indexOf('R', encryptObjStart)

    const encryptContent = pdf
      .subarray(encryptObjStart, encryptEnd + 1)
      .toString()

    const matches = /\/Encrypt (\d+) (\d+) R/.exec(encryptContent)

    if (matches == null) {
      return null
    } else {
      const encryptObjId = matches[1]
      const encryptObjGen = matches[2]

      const start = `${encryptObjId} ${encryptObjGen} obj`
      const end = `endobj`
      const encryptStart = getSubstringIndex(pdf, start, 1)
      const encryptEnd = pdf.indexOf(end, encryptStart)

      return pdf
        .subarray(encryptStart + start.length, encryptEnd)
        .filter(v => v !== 0x0a)
    }
  }

  getEncryptionKey(encryptObj, password) {
    console.log(encryptObj)
    const tmp = encryptObj.subarray(2, encryptObj.length - 2)
    const dict = tmp
      .toString()
      .split('/')
      .filter((v: string) => v !== '')
  }

  extractSignature(pdf: Buffer, signaturePosition = 1) {
    const byteRangePos = getSubstringIndex(
      pdf,
      '/ByteRange [',
      signaturePosition
    )

    const byteRangeEnd = pdf.indexOf(']', byteRangePos)
    const byteRange = pdf.subarray(byteRangePos, byteRangeEnd + 1).toString()
    const matches = /\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/.exec(
      byteRange
    )

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

  extractCert(pdf: Buffer, password?: string): forge.pki.Certificate {
    // TODO: extract Certificate from pdf encryption file.
    const pdfCertObjOpen = '/Cert <'
    const pdfCertObjClose = '>'

    const begin = getSubstringIndex(pdf, pdfCertObjOpen, 1)
    const end = pdf.indexOf(pdfCertObjClose, begin)
    const cerRange = pdf.subarray(begin + pdfCertObjOpen.length, end).toString()
    return derToCert(cerRange)
  }

  toPCDArgsFromCert(pdf: Buffer, cert: forge.pki.Certificate): IdentityPCDArgs {
    const { signedData, signature, ByteRange } = this.extractSignature(pdf)
    const publicKey = cert.publicKey as forge.pki.rsa.PublicKey

    const md = forge.md.sha1.create()
    md.update(signedData.toString('binary'))

    const args: IdentityPCDArgs = {
      base_message: {
        argumentType: ArgumentTypeName.BigInt,
        value:
          BigInt(
            '0x' + Buffer.from(md.digest().bytes(), 'binary').toString('hex')
          ) + '',
      },
      modulus: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt('0x' + publicKey.n.toString(16)) + '',
      },
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value:
          BigInt(
            '0x' +
              Buffer.from(
                forge.asn1.fromDer(signature).value as string,
                'binary'
              ).toString('hex')
          ) + '',
      },
    }
    return args
  }

  toPCDArgs(pdf: Buffer, password?: string): IdentityPCDArgs {
    const cert: forge.pki.Certificate = this.extractCert(pdf)
    return this.toPCDArgsFromCert(pdf, cert)
  }
}
