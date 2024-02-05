import { readFileSync, writeFileSync } from 'fs'
import pako from 'pako'
import path from 'path'

const main = () => {
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
    writeFileSync(
      `../build/chunked_zkey/circuit_final_${count}.gz`,
      chunkCompressed,
    )

    i += chunkSize
    count++
  }
}

main()
