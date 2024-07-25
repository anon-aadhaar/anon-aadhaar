enum BaseUrlArtifacts {
  Prod = 'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/',
  // Test = 'https://d1l6t78iyuhldt.cloudfront.net/v1.0.0',
  // Staging = 'https://dhzposh38rt8g.cloudfront.net',
}

enum Version {
  V1 = 'v1.0.0',
  V2 = 'v2.0.0',
}

enum Artifacts {
  WASM_URL = '/aadhaar-verifier.wasm',
  ZKEY_URL = '/circuit_final.zkey',
  VK_URL = '/vkey.json',
  ZKEY_CHUNKS = '/chunked_zkey',
}

export const artifactUrls = {
  V1: {
    wasm: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.ZKEY_CHUNKS,
  },
  v2: {
    wasm: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.ZKEY_CHUNKS,
  },
  // test: {
  //   wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
  //   zkey: BaseUrlArtifacts.Test + Artifacts.ZKEY_URL,
  //   vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  //   chunked: BaseUrlArtifacts.Test + Artifacts.ZKEY_CHUNKS,
  // },
  // staging: {
  //   wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
  //   zkey: BaseUrlArtifacts.Staging + Artifacts.ZKEY_CHUNKS,
  //   vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  // },
}

export const testCertificateUrl =
  'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/testCertificate.pem'

export const CIRCOM_FIELD_P = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
)

// From https://www.uidai.gov.in/images/authDoc/uidai_offline_publickey_26022021.cer
export const productionPublicKeyHash =
  '18063425702624337643644061197836918910810808173893535653269228433734128853484'

//From test signing RSA keys located in /circuits/asset/testPublicKey.pem
export const testPublicKeyHash =
  '15134874015316324267425466444584014077184337590635665158241104437045239495873'
