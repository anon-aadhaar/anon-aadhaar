import { IdFields } from '@anon-aadhaar/core'

export function timestampToUTCUnix(rawData: Uint8Array) {
  const extractedArray: Uint8Array = new Uint8Array(10)

  for (let i = 0; i < 10; i++) {
    extractedArray[i] = rawData[i + 9]
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

export function dateToUnixTimestamp(dateStr: string): number {
  // Parse the date string into a Date object
  const parts = dateStr.split('-')
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10)

  const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

  // Convert the Date object to a UNIX timestamp
  const unixTimestamp = date.getTime() / 1000

  return unixTimestamp + 19800
}

export function returnFullId(signedData: Uint8Array) {
  const allDataParsed: number[][] = []
  let countDelimiter = 0
  let temp: number[] = []
  for (let i = 0; i < signedData.length; i++) {
    if (countDelimiter < 18) {
      if (signedData[i] !== 255) {
        temp.push(signedData[i])
      } else {
        countDelimiter += 1
        allDataParsed.push(temp)
        temp = []
      }
    }
  }

  const ID: { [key: string]: string } = {}
  for (let i = 0; i < allDataParsed.length; i++) {
    let result = ''
    for (let j = 0; j < allDataParsed[i].length; j++) {
      result += String.fromCharCode(allDataParsed[i][j])
    }
    ID[IdFields[i]] = result
  }

  return ID
}

export function extractFieldByIndex(
  data: Uint8Array,
  index: number,
): Uint8Array {
  let start = -1
  let end = data.length
  let fieldIndex = -1

  for (let i = 0; i < data.length; i++) {
    if (data[i] === 255) {
      fieldIndex++
      if (fieldIndex === index) {
        start = i
      } else if (fieldIndex === index + 1) {
        end = i
        break
      }
    }
  }

  if (start !== -1 && start < end) {
    // Include the starting delimiter in the result
    return data.slice(start, end)
  }

  return new Uint8Array() // Field not found
}

export function bytesToInts(
  bytes: Uint8Array,
  maxBytesInField: number,
): bigint[] {
  const numChunks = Math.ceil(bytes.length / maxBytesInField)
  const ints: bigint[] = new Array(numChunks).fill(BigInt(0))

  for (let i = 0; i < numChunks; i++) {
    let intSum = BigInt(0)
    for (let j = 0; j < maxBytesInField; j++) {
      const idx = maxBytesInField * i + j
      if (idx >= bytes.length) break // Stop if we've processed all bytes

      // Shift byte into position and add to current integer sum
      intSum += BigInt(bytes[idx]) * BigInt(256) ** BigInt(j)
    }
    ints[i] = intSum
  }

  return ints
}
