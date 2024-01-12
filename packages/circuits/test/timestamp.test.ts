// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')
import path from 'path'


// Convert date to string format expected by circom
// ASCII encoding of YYYYMMDDHHMMSS
function formatDate(date: Date) {
  return date
    .toISOString()
    .replace(/[ZT-]|:|\./g, '') // remove Z, T, :, . from string
    .split('')
    .slice(0, 14) // remove milliseconds
    .map(s => s.charCodeAt(0)) // Convert to ascii
}


describe.only('date-to-timestamp', function () {
  this.timeout(0)

  let circuit: any

  this.beforeAll(async () => {
    circuit = await circom_tester(
      path.join(__dirname, './', 'circuits', 'timestamp-test.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      },
    )
  })

  it('should calculate unix time for date string correctly', async () => {
    const now = new Date()
    const timestamp = Math.floor(now.getTime() / 1000)

    const witness = await circuit.calculateWitness({
      in: formatDate(now),
    })

    await circuit.checkConstraints(witness);

    await circuit.assertOut(witness, {
      out: timestamp,
    })
  })

  it('should calculate unix time for date in a leap year before feb correctly', async () => {
    const now = new Date('2020-01-01T10:00:00.000Z')
    const timestamp = Math.floor(now.getTime() / 1000)

    const witness = await circuit.calculateWitness({
      in: formatDate(now),
    })

    await circuit.assertOut(witness, {
      out: timestamp,
    })
  })

  it('should calculate unix time for date in a leap year after feb correctly', async () => {
    const now = new Date('2020-10-01T10:00:00.000Z')
    const timestamp = Math.floor(now.getTime() / 1000)

    const witness = await circuit.calculateWitness({
      in: formatDate(now),
    })

    await circuit.assertOut(witness, {
      out: timestamp,
    })
  })
})

describe('date-to-timestamp > rounded', function () {
  this.timeout(0)

  let circuit: any

  this.beforeAll(async () => {
    circuit = await circom_tester(
      path.join(__dirname, './', 'circuits', 'timestamp-round-test.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      }
    )
  })

  it('should calculate timetamp rounded to hour correctly', async () => {
    const now = new Date()
    const timestamp = Math.floor(now.getTime() / 1000)
    const roundedTimestamp = Math.floor(timestamp / 3600) * 3600

    const witness = await circuit.calculateWitness({
      in: formatDate(now),
    })

    await circuit.assertOut(witness, {
      out: roundedTimestamp,
    })
  })
})
