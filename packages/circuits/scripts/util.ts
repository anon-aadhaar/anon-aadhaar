import pako from 'pako'

export function compressByteArray(byteArray: Uint8Array): Uint8Array {
  const compressedArray = pako.deflate(byteArray)
  return new Uint8Array(compressedArray)
}

export function getEndIndex(byteArray: Uint8Array): number {
  let countDelimiter = 0
  let endIndex = 0
  for (let i = 0; i < byteArray.length; i++) {
    if (countDelimiter < 16) {
      if (byteArray[i] !== 255) {
        continue
      } else {
        countDelimiter += 1
      }
    } else {
      endIndex = i
      break
    }
  }

  return endIndex
}

export function replaceBytesBetween(
  arr: Uint8Array,
  replaceWith: Uint8Array,
  start: number,
  end: number,
): Uint8Array {
  if (start < 0 || end >= arr.length || start > end) {
    console.error('Invalid start or end index.')
    return arr
  }

  const before = arr.subarray(0, start)

  const after = arr.subarray(end + 1)

  const result = new Uint8Array(
    before.length + replaceWith.length + after.length,
  )

  result.set(before, 0)
  result.set(replaceWith, before.length)
  result.set(after, before.length + replaceWith.length)

  return result
}

// Return timestamp in format “DDMMYYYYHHMMSSsss” (including milliseconds)
export function returnNewDateString(): string {
  const newDate = new Date()
  return (
    newDate.getUTCFullYear().toString() +
    newDate.getUTCMonth().toString().padStart(2, '0') +
    newDate.getUTCDay().toString().padStart(2, '0') +
    newDate.getUTCHours().toString().padStart(2, '0') +
    newDate.getUTCMinutes().toString().padStart(2, '0') +
    newDate.getUTCSeconds().toString().padStart(2, '0') +
    newDate.getUTCMilliseconds().toString().padStart(3, '0')
  )
}

export function convertByteArrayToBigInt(byteArray: Uint8Array): bigint {
  let result = BigInt(0)
  for (let i = 0; i < byteArray.length; i++) {
    result = result * BigInt(256) + BigInt(byteArray[i])
  }
  return result
}

export const rawDataToCompressedQR = (data: Uint8Array) => {
  const compressedDataBytes = compressByteArray(data)
  const compressedBigInt = convertByteArrayToBigInt(compressedDataBytes)
  return compressedBigInt
}
