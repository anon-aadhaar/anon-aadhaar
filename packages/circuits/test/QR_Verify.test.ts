import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')

import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray, bufferToHex } from '@zk-email/helpers/dist/binaryFormat'
import { genData, splitToWords } from 'anon-aadhaar-pcd'
import { convertBigIntToByteArray, decompressByteArray } from './script'
import fs from 'fs';
import crypto from 'crypto';

describe('Test QR Verify circuit', function () {
  this.timeout(0)
  it('Test circuit with Sha256RSA signature', async () => {
    const signedData = 'Hello-world'
    const data = await genData(signedData, 'SHA-256')

    const circuit = await circom_tester(
      path.join(__dirname, '../', 'circuits', 'qr_verify.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      }
    )

    const [paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 2
    )

    await circuit.calculateWitness({
      padded_message: Uint8ArrayToCharArray(paddedMsg),
      message_len: messageLen,
      signature: splitToWords(data[1], BigInt(64), BigInt(32)),
      modulus: splitToWords(data[2], BigInt(64), BigInt(32)),
    })
  })

  it.skip('Test QR code data', async () => {
    const circuit = await circom_tester(
      path.join(__dirname, '../', 'circuits', 'qr_verify.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      }
    )

    const QRData =
      ''

    const QRDataBigInt = BigInt(QRData);

    const QRDataBytes = convertBigIntToByteArray(QRDataBigInt);
    const QRDataDecode = decompressByteArray(QRDataBytes);

    const signatureBytes = QRDataDecode.slice(QRDataDecode.length - 256, QRDataDecode.length);
    
    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256);

    const [paddedMsg, messageLen] = sha256Pad(
        signedData,
        512 * 3
    );
    
    const certData = fs.readFileSync(path.join(__dirname, 'assets', 'uidai_offline_publickey_26022021.cer'));
    const pk = crypto.createPublicKey(certData);


    const modulus = BigInt('0x' + bufferToHex(Buffer.from(pk.export( {format: 'jwk'}).n as string, 'base64url')));
    
    const signature = BigInt('0x' + bufferToHex(Buffer.from(signatureBytes)).toString());

    await circuit.calculateWitness({
        padded_message: Uint8ArrayToCharArray(paddedMsg),
        message_len: messageLen,
        signature: splitToWords(signature, BigInt(64), BigInt(32)),
        modulus: splitToWords(modulus, BigInt(64), BigInt(32)),
      })
  })
})
