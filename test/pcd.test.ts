import { describe } from 'mocha'
import { IdentityPCDArgs, PCDInitArgs } from '../src/types'
import { init, prove, verify } from '../src/pcd'
import { assert } from 'chai'
import { genData } from './utils'

describe('PCD tests', function () {
  this.timeout(0)
  it('PCD flow', async () => {
    const dirName = __dirname + '/../artifacts';
    console.log(dirName);
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/rsa_verify_sha1_pkcs1v15.wasm',
      zkeyURL: dirName + '/circuit_final.zkey'
    }

    await init(pcdInitArgs)

    const data = await genData("Hello world", 'SHA-1');
    const pcdArgs: IdentityPCDArgs = {
      exp: BigInt(65337),
      signature: data[1], 
      mod: data[2],
      message: data[3],
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })
})
