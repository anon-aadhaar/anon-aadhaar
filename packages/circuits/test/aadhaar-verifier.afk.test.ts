/* eslint-disable @typescript-eslint/no-var-requires */
import { groth16 } from 'snarkjs'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { keccak256 } from '@ethersproject/keccak256'
import { sha256Pad } from '@zk-email/helpers/dist/sha-utils'
// import { buildPoseidon } from "circomlibjs";
import {
  splitToWords,
  convertBigIntToByteArray,
  decompressByteArray,
} from '@anon-aadhaar/core'
import {
  Uint8ArrayToCharArray,
  bufferToHex,
} from '@zk-email/helpers/dist/binary-format'
import assert from 'assert'

const BUILD_DIR = path.join(__dirname, '../build')
const SECRET = 2093073268948711
const APP_ID = 1346066938123

function generateAnonAadhaarAFKInputs(qrData: string) {
  const pkData = fs.readFileSync(
    path.join(__dirname, '../assets', 'testPrivateKey.pem'),
  )
  const pk = crypto.createPublicKey(pkData)

  // Add QR data here (bigInt)
  const QRData = BigInt(qrData)

  const qrDataBytes = convertBigIntToByteArray(BigInt(QRData))
  const decodedData = decompressByteArray(qrDataBytes)

  const signatureBytes = decodedData.slice(
    decodedData.length - 256,
    decodedData.length,
  )

  const signedData = decodedData.slice(0, decodedData.length - 256)
  const [paddedMsg, messageLen] = sha256Pad(signedData, 512 * 3)

  const pubKey = BigInt(
    '0x' +
      bufferToHex(
        Buffer.from(pk.export({ format: 'jwk' }).n as string, 'base64url'),
      ),
  )

  const signature = BigInt(
    '0x' + bufferToHex(Buffer.from(signatureBytes)).toString(),
  )

  const delimiterIndices: number[] = []
  for (let i = 0; i < paddedMsg.length; i++) {
    if (paddedMsg[i] === 255) {
      delimiterIndices.push(i)
    }
    if (delimiterIndices.length === 18) {
      break
    }
  }

  const input = {
    qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
    qrDataPaddedLength: messageLen,
    nonPaddedDataLength: signedData.length,
    delimiterIndices: delimiterIndices,
    signature: splitToWords(signature, BigInt(121), BigInt(17)),
    pubKey: splitToWords(pubKey, BigInt(121), BigInt(17)),
    secret: SECRET,
  }

  return input
}

async function generateProof(circuitName: string, inputs: any) {
  const wasm = fs.readFileSync(
    path.join(BUILD_DIR, `${circuitName}_js/${circuitName}.wasm`),
  )
  const wc = require(
    path.join(BUILD_DIR, `${circuitName}_js/witness_calculator.js`),
  )
  const witnessCalculator = await wc(wasm)
  const buff = await witnessCalculator.calculateWTNSBin(inputs, 0)
  fs.writeFileSync(path.join(BUILD_DIR, `${circuitName}.wtns`), buff)

  const { proof, publicSignals } = await groth16.prove(
    path.join(BUILD_DIR, `${circuitName}.zkey`),
    path.join(BUILD_DIR, `${circuitName}.wtns`),
  )

  const vkey = JSON.parse(
    fs
      .readFileSync(path.join(BUILD_DIR, `${circuitName}.vkey.json`))
      .toString(),
  )

  const proofVerified = await groth16.verify(vkey, publicSignals, proof)

  return { proof, publicSignals, proofVerified }
}

function computeClaimKeyFromName(name: string) {
  return BigInt(keccak256(Buffer.from(name)))
    .toString()
    .slice(0, 8)
}

function stringToPackedInts(str: string) {
  // Convert the string in to integers of 31 bytes
  const packedInts = []

  let currentInt = 0n
  for (let i = 0; i < str.length; i++) {
    const charCode = BigInt(str.charCodeAt(i))
    currentInt += charCode << BigInt((i % 31) * 8)

    if (i % 31 === 30) {
      packedInts.push(currentInt)
      currentInt = 0n
    }

    if (i === str.length - 1) {
      packedInts.push(currentInt)
    }
  }

  return packedInts
}

describe('AFK E2E test', function () {
  this.timeout(0)

  it.only('Run AFK E2E', async () => {
    const aadhaar =
      '32262357718743732071461784703657736210768353301748289070005588327493133638736736117436931591266144691046300710810009813426813090311843400161110360858368747416168739337539748891355016660921950854335049275166408925206913580019839475681267184509230367050607611690008506889995335940196257746403205021336710571139223420499986430025150081114752514545955111054886611969712483906469497307756877507445432687000266571197062195462581160080978898221542152019822339234554616787431774251733416470691354495329753985690024770982542538889791494210862873730956479770633039492008308664166914228123338940640549146009357894167635057218117801387512189817669945315228256612202815872420543340973867036565638036287553700807447675554618618919527184312961677804626701841537343308433738651163679903907823656910306005917730806351466786521704177092887734744858674363852774352473456739577234500755600909052651647995544449869634019560563407245682474484411002459243058058970084276239278965526239592824312290544572577927680261396344274008487874356095699284172005567471361670923680671612658605551046821777547024493185084273331360893136823649603767110049710718626121479036551446109267897490964476300553475576117739221456749544749463748343380407974723449499974811950814084606295605516737756602305161110115948986482240895580687773860060504663809366819724724036285968952522215822599844124995297328119303417969542093875607847788624505616903820846350276464714372860405030055477471235160805337861581127369928524080373354763414526194684810768748329580710248429255013639774739282118880293783871557899776753691118479761788328700140538136044478745088200989804511567468297526328911312765624287070078154119316898168069605390816974969283282913771476963155715131941678007150219007053159123603869013862973443156367275367473340489608326211185194665240997020904558015633535885116705011396262173858113568938172601975326881392988124856422976111181252095265985952772454435466380034370325945716363322784582262488827424416631306889420479891228103222372842594187677800910936639503422121314632342867095101078140398406310084717214690154037062216272887403608356983615577631922277045549380426565958805233360758197376853530088328749019441287910572822331483447736752757315358311532534059147459402031237805470096824185537626056396265289955696738617832689645397613049998692496098213246772612026760042624405832433790655263958973452024386746530927229940755859724919615877497312200594350380675395640249000861541790427352992834229172628358742574397937368997378513866945567810763330463291911009404627818495762594183710678391968142862322070028102276249304360345098990599388195658824308134665678499676349166566961472335167755110077022655765823302265469027146345154108807184710129539197740213817995364303544830004728897876214809185231812509167141667445402255552819672982547838999825316435078224267297151000672251322700507951581135339929475572399011557742784726816125607780863336380980012627301285462051980181992354408925553244149114043295881604907902543885853557258326454866058712540603699213632898817328174621910643519501765169617346353320037487963661306327186041583856180449973888760589467023048188133778773465379281546310534950465490732049'

    console.log('Generating Anon Aadhaar AFK inputs...')
    const aadhaarAFKInputs = generateAnonAadhaarAFKInputs(aadhaar)
    console.log('Done ✔')

    console.log('Generating Anon Aadhaar AFK proof...')
    const aadhaarAFKProof = await generateProof(
      'aadhaar-verifier.afk',
      aadhaarAFKInputs,
    )
    console.log('Done ✔')

    console.log('AA AFK Proof: ', aadhaarAFKProof)

    // console.log(computeClaimKeyFromName("bio.country"));
    // console.log(stringToPackedInts("India")[0]);

    const afkVerifierProof = await generateProof('afk', {
      secret: SECRET,
      issuerIds: [BigInt(37977685).toString(), '0', '0', '0', '0'],
      claimKeys: [
        BigInt(computeClaimKeyFromName('bio.country')).toString(),
        '0',
        '0',
        '0',
        '0',
      ],
      claimValues: [
        stringToPackedInts('India')[0].toString(),
        '0',
        '0',
        '0',
        '0',
      ],
      scope: APP_ID,
      message: 8827718,
    })

    console.log(afkVerifierProof)

    assert(
      afkVerifierProof.publicSignals[1] === aadhaarAFKProof.publicSignals[3],
    )
  })
})
