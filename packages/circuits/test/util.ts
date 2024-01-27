export function timestampToUTCUnix(
  rawData: Uint8Array,
  useTestAadhaar: boolean,
) {
  const offset = useTestAadhaar ? 6 : 9
  const extractedArray: Uint8Array = new Uint8Array(10)

  for (let i = 0; i < 10; i++) {
    extractedArray[i] = rawData[i + offset]
  }

  const timestampString = Buffer.from(extractedArray).toString()

  const result = `${timestampString.slice(0, 4)}-${timestampString.slice(
    4,
    6,
  )}-${timestampString.slice(6, 8)}T${timestampString.slice(8, 10)}:00:00.000Z`

  const dateObj = new Date(result)

  dateObj.setUTCHours(dateObj.getUTCHours() - 5)
  dateObj.setUTCMinutes(dateObj.getUTCMinutes() - 30)

  return Math.floor(dateObj.getTime() / 1000)
}
