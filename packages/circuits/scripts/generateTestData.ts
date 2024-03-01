import {
  convertBigIntToByteArray,
  decompressByteArray,
} from '@anon-aadhaar/core'

const data = ''

const main = () => {
  // Add QR data here (bigInt)
  const QRData = BigInt(data)

  const qrDataBytes = convertBigIntToByteArray(BigInt(QRData))
  const decodedData = decompressByteArray(qrDataBytes)

  //   const signatureBytes = decodedData.slice(
  //     decodedData.length - 256,
  //     decodedData.length,
  //   )

  const signedData = decodedData.slice(0, decodedData.length - 256)

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

  enum Fields {
    'Version',
    'Email_mobile_present_bit_indicator_value',
    'ReferenceId',
    'Name',
    'DOB',
    'Gender',
    'CareOf',
    'Distrcit',
    'Landmark',
    'House',
    'Location',
    'PinCode',
    'PostOffice',
    'State',
    'Street',
    'SubDisctrict',
    'VTC',
    'PhoneNumberLast4',
  }

  const ID: { [key: string]: string } = {}
  for (let i = 0; i < allDataParsed.length; i++) {
    let result = ''
    for (let j = 0; j < allDataParsed[i].length; j++) {
      result += String.fromCharCode(allDataParsed[i][j])
    }
    ID[Fields[i]] = result
  }

  console.log(ID)
}

main()
