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

export type FieldKey =
  | 'revealAgeAbove18'
  | 'revealGender'
  | 'revealState'
  | 'revealPinCode'

export type FieldsToRevealArray = FieldKey[]
