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

  console.log(ID)
}
