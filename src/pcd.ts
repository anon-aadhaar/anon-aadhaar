import {
  DisplayOptions,
  PCD,
  PCDArgument,
  PCDPackage,
  SerializedPCD,
  StringArgument,
} from "@pcd/pcd-types";
import {
  PCDInitArgs,
  IdentityPCDTypeName,
  IdentityPCDClaim,
  IdentityPCDProof,
  IdentityPCDArgs,
  FullProof,
} from "./types";

import { v4 as uuidv4 } from "uuid";
//@ts-ignore
import { groth16 } from "snarkjs";
//@ts-ignore
import snarkjs from "snarkjs";

import { splitToWordsWithName, unpackProof } from "./utils";
import axios from "axios";
import { IdentityPCDCardBody } from "./CardBody";

export class IdentityPCD implements PCD<IdentityPCDClaim, IdentityPCDProof> {
  type = IdentityPCDTypeName;
  claim: IdentityPCDClaim;
  proof: IdentityPCDProof;
  id: string;

  public constructor(
    id: string,
    claim: IdentityPCDClaim,
    proof: IdentityPCDProof
  ) {
    this.id = id;
    this.claim = claim;
    this.proof = proof;
  }
}

// initial function
let initArgs: PCDInitArgs | undefined = undefined;
export async function init(args: PCDInitArgs): Promise<void> {
  initArgs = args;
}

async function zkProof(pcdArgs: IdentityPCDArgs): Promise<IdentityPCDProof> {
  const input = Object.assign(
    {},
    splitToWordsWithName(
      pcdArgs.signature as bigint,
      BigInt(32),
      BigInt(64),
      "sign"
    ),
    splitToWordsWithName(BigInt(65337), BigInt(32), BigInt(64), "exp"),
    splitToWordsWithName(
      BigInt(pcdArgs.mod),
      BigInt(32),
      BigInt(64),
      "modulus"
    ),
    splitToWordsWithName(
      BigInt(pcdArgs.message),
      BigInt(32),
      BigInt(5),
      "hashed"
    )
  );

  const circuit = new snarkjs.Circuit(
    await (
      await axios.get(initArgs?.circuitURL as string)
    ).data
  );
  const provingKey = await (await axios.get(initArgs?.zkeyProveFilePath as string)).data;
  const wtns = circuit.calculateWitness(input);
  const { proof, _ } = snarkjs.groth.genProof(
    snarkjs.unstringifyBigInts(provingKey),
    snarkjs.unstringifyBigInts(wtns)
  );

  return {
    exp: pcdArgs.exp,
    mod: pcdArgs.mod,
    proof,
  };
}

export async function prove(args: IdentityPCDArgs): Promise<IdentityPCD> {
  if (!initArgs) {
    throw new Error(
      "cannot make semaphore signature proof: init has not been called yet"
    );
  }

  const id = uuidv4();
  const pcdClaim: IdentityPCDClaim = {
    exp: args.exp,
    mod: args.mod,
  };
  const pcdProof = await zkProof(args);

  return new IdentityPCD(id, pcdClaim, pcdProof);
}

const downloadVerifier = async (url: string) => {
  const vkeyVerifier = await (await axios.get(url)).data;
  return vkeyVerifier;
};

export async function verify(pcd: IdentityPCD): Promise<boolean> {
  const vkeyVerifier = await downloadVerifier(initArgs?.zkeyVerifyKeyFilePath as string);

  let exp = splitToWordsWithName(BigInt(65337), BigInt(32), BigInt(64), "exp");
  let mod = splitToWordsWithName(
    BigInt(pcd.proof.mod),
    BigInt(32),
    BigInt(64),
    "modulus"
  );
  return snarkjs.groth.isValid(
    snarkjs.unstringifyBigInts(vkeyVerifier),
    snarkjs.unstringifyBigInts(pcd.proof.proof),
    snarkjs.unstringifyBigInts(Object.values(exp).concat(Object.values(mod)))
  );
}

export function serialize(
  pcd: IdentityPCD
): Promise<SerializedPCD<IdentityPCD>> {
  return Promise.resolve({
    type: IdentityPCDTypeName,
    pcd: JSON.stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim,
    }),
  } as SerializedPCD<IdentityPCD>);
}

export function deserialize(serialized: string): Promise<IdentityPCD> {
  return JSON.parse(serialized);
}

export function getDisplayOptions(pcd: IdentityPCD): DisplayOptions {
  return {
    header: "ZK Signature",
    displayName: "pcd-" + pcd.type,
  };
}

export const IdentityPCDPackage: PCDPackage<
  IdentityPCDClaim,
  IdentityPCDProof,
  IdentityPCDArgs
> = {
  name: IdentityPCDTypeName,
  renderCardBody: IdentityPCDCardBody,
  getDisplayOptions,
  prove,
  verify,
  serialize,
  deserialize,
};
