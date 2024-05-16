export enum AadhaarQRValidation {
  QR_CODE_SCANNED = 'QR code scanned, verifying QR Code 🔎',
  SIGNATURE_VERIFIED = 'Signature verified ✅',
  ERROR_PARSING_QR = 'QR code invalid ❌',
}

export type ModalViews = 'Verify' | 'Prove' | 'Proving'
