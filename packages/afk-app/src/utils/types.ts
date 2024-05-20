export type FieldsToReveal = {
  ageAbove18: boolean
  gender: boolean
  state: boolean
  pinCode: boolean
}

export const fieldsLabel: { key: keyof FieldsToReveal; label: string }[] = [
  { key: 'ageAbove18', label: 'Age Above 18' },
  { key: 'gender', label: 'Gender' },
  { key: 'state', label: 'State' },
  { key: 'pinCode', label: 'PIN Code' },
]
