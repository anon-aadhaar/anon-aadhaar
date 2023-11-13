import { describe } from 'mocha'
import { genData, splitToWords } from '../src/utils'
import path from 'path'
import { buildPoseidon } from 'circomlibjs'
import { poseidon } from 'circomlibjs' // v0.0.8

import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
const wasm_tester = require('circom_tester/wasm/tester')

describe.only('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeEach(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('Nullifier workflow', async function () {
    const client_hasher = await wasm_tester(
      path.join(__dirname, 'circuits/hash_test.circom')
    )

    const input = {
      signature: splitToWords(testData[1], BigInt(64), BigInt(32)),
      modulus: splitToWords(testData[2], BigInt(64), BigInt(32)),
      base_message: splitToWords(testData[3], BigInt(64), BigInt(32)),
    }

    const client_outputs = await client_hasher.calculateWitness(input)

    const m = client_outputs[1]

    // server side update merkle tree and sent client secret sk

    const sk = BigInt(1234555) // random value.

    const poseidon = await buildPoseidon()

    const compute_leaf = poseidon([sk, m])

    const leaf_num = BigInt(poseidon.F.toString(compute_leaf))

    const tree = new IncrementalMerkleTree(poseidon, 16, BigInt(0), 2) // Binary tree.

    tree.insert(leaf_num)

    const merkle_proof = tree.createProof(0)

    // client side proving nullifer

    const nullifer_circuit = await wasm_tester(
      path.join(__dirname, '../circuits/Nullifier/nullifier.circom')
    )

    const nullifer_input = {
      sk,
      pdf_hash: testData[3],
      path_index: merkle_proof.pathIndices,
      path_elements: merkle_proof.siblings.map((h, index) => {
          if (index === 0) return h[0];
          return poseidon.F.toString(h[0])
      })
    }

    console.log(nullifer_input)
    const nullifer_witness = await nullifer_circuit.calculateWitness(
      nullifer_input
    )

    console.log(nullifer_witness)
  })
})
