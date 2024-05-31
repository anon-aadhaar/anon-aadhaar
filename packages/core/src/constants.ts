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
