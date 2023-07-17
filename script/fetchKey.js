/* eslint-disable @typescript-eslint/no-var-requires */
const https = require('https')
const fs = require('fs')
const path = require('path')

const fileUrl =
  'https://anon-aadhaar-pcd.s3.eu-west-3.amazonaws.com/circuit_final.zkey' // Replace with the actual URL of the file to fetch
const targetDir = path.join(__dirname, '../artifacts', 'circuit_final.zkey') // Replace 'path_inside_your_package' with the desired directory path inside your package

https
  .get(fileUrl, response => {
    if (response.statusCode !== 200) {
      console.error(
        'Failed to fetch the file:',
        response.statusCode,
        response.statusMessage
      )
      process.exit(1)
    }

    const fileStream = fs.createWriteStream(targetDir)
    response.pipe(fileStream)

    fileStream.on('finish', () => {
      fileStream.close()
      console.log('File fetched and placed in the package:', targetDir)
    })
  })
  .on('error', err => {
    console.error('Error fetching the file:', err.message)
    process.exit(1)
  })
