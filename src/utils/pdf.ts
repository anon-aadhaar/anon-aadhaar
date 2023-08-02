import { IdentityPCDArgs } from '../types'
import { extractSignature } from '../utils';

export class PDFUtils {
  pdf: Buffer

  constructor(pdfBuffer: Buffer) {
    this.pdf = pdfBuffer
  }

  toPCDArgs(): IdentityPCDArgs {
    const { signedData, signature, ByteRange } = extractSignature(this.pdf);
    
    return {
        
    }
  }
}
