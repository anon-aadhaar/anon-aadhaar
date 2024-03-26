import { readFileSync } from 'fs'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import pako from 'pako'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

type Bucket = {
  name: string
  region: string
}

const Buckets: { [key: string]: Bucket } = {
  prod: { name: 'anon-aadhaar', region: 'ap-south-1' },
  staging: { name: 'anon-aadhaar-staging', region: 'eu-west-3' },
  test: { name: 'anon-aadhaar-test', region: 'ap-south-1' },
}

// S3 config
const s3 = new S3Client({
  region: Buckets.prod.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// Set destination
const bucketName = Buckets.prod.name
const folder_tag = 'v2.0.0'

const main = async () => {
  // TODO
  // Change the way we target zkey to chunk
  const zkeyData = readFileSync(
    path.join(__dirname, '../artifacts', 'circuit_final.zkey'),
  )

  let i = 0
  let chunkSize: number
  let count = 0

  while (i < zkeyData.length) {
    i === 0
      ? (chunkSize = Math.floor(zkeyData.length / 10) + (zkeyData.length % 10))
      : (chunkSize = Math.floor(zkeyData.length / 10))
    const chunkCompressed = pako.gzip(zkeyData.subarray(i, i + chunkSize))

    const keyName = `${folder_tag}/chunked_zkey/circuit_final_${count}.gz`

    // Upload the chunk to S3
    try {
      const parallelUploads3 = new Upload({
        client: s3,
        params: {
          Bucket: bucketName,
          Key: keyName,
          Body: chunkCompressed,
          ContentType: 'application/gzip',
        },
      })

      parallelUploads3.on('httpUploadProgress', progress => {
        console.log(progress)
      })

      await parallelUploads3.done()
      console.log(`Successfully uploaded ${keyName}`)
    } catch (err) {
      console.log('Error', err)
    }

    i += chunkSize
    count++
  }
}

main()
