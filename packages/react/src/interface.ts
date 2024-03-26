export enum AadhaarQRValidation {
  QR_CODE_SCANNED = 'QR code scanned, verifying QR Code 🔎',
  SIGNATURE_VERIFIED = 'Signature verified ✅',
  ERROR_PARSING_QR = 'QR code invalid ❌',
}

export type FieldsToReveal = {
  revealAgeAbove18: boolean
  revealGender: boolean
  revealState: boolean
  revealPinCode: boolean
}

export const fieldsLabel: { key: keyof FieldsToReveal; label: string }[] = [
  { key: 'revealAgeAbove18', label: 'Age Above 18' },
  { key: 'revealGender', label: 'Gender' },
  { key: 'revealState', label: 'State' },
  { key: 'revealPinCode', label: 'PIN Code' },
]
