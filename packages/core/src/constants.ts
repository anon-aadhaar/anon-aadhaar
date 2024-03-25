enum BaseUrlArtifacts {
  Test = 'https://d1l6t78iyuhldt.cloudfront.net/v1.0.0',
  Prod = 'https://d1re67zv2jtrxt.cloudfront.net/v1.0.0',
  // Staging = 'https://dhzposh38rt8g.cloudfront.net',
}

enum Artifacts {
  WASM_URL = '/aadhaar-verifier.wasm',
  ZKEY_URL = '/circuit_final.zkey',
  VK_URL = '/vkey.json',
  ZKEY_CHUNKS = '/chunked_zkey',
}

export const artifactUrls = {
  test: {
    wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Test + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Test + Artifacts.ZKEY_CHUNKS,
  },
  prod: {
    wasm: BaseUrlArtifacts.Prod + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Prod + Artifacts.ZKEY_CHUNKS,
  },
  v2: {
    wasm: 'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/aadhaar-verifier.wasm',
    zkey: 'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/circuit_final.zkey',
    vk: 'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/vkey.json',
    chunked:
      'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/v2.0.0/chunked_zkey',
  },
  // staging: {
  //   wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
  //   zkey: BaseUrlArtifacts.Staging + Artifacts.ZKEY_CHUNKS,
  //   vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  // },
}

export const testCertificateUrl =
  'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/testCertificate.pem'
