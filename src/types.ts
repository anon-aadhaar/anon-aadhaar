export type BigNumberish= string | bigint

export const IdentityPCDTypeName: string = "identity-pcd";

export interface PCDInitArgs {
  // TODO: how do we distribute these in-package, so that consumers
  // of the package don't have to copy-paste these artifacts?
  // TODO: how do we account for different versions of the same type
  // of artifact? eg. this one is parameterized by group size. Should
  // we pre-generate a bunch of artifacts per possible group size?
  // Should we do code-gen?
  zkeyFilePath: string;
  wasmFilePath: string;
  verificationKeyFilePath: string
}


/**
 * @dev claim this public key signed a message
 */
export interface IdentityPCDClaim {
  mod: BigNumberish, 
  exp: BigNumberish
}

/**
 * @dev proof of claim correct
 */
export interface IdentityPCDProof {
  mod: BigNumberish 
	exp: BigNumberish
	proof: Proof // 3 points on curve if we use groth16
}

/**
 * @dev witness use for create zk proof of IdentityPCD package.
 */
export interface IdentityPCDArgs {
	message: BigNumberish, // private witness
	signature: BigNumberish, // private witness
	mod: BigNumberish 
	exp: BigNumberish
}



export type Proof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
]

export interface FullProof {
  exp: BigNumberish[],
  mod: BigNumberish[], 
  proof: Proof 
}

export interface PCDProof {
  exp: BigNumberish, 
  mod: BigNumberish,
  proof: Proof
}


export type SnarkJSProof = {
  pi_a: BigNumberish[]
  pi_b: BigNumberish[][]
  pi_c: BigNumberish[]
  protocol: string
  curve: string
}