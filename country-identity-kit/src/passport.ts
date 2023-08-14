// Feature still in development

// import {
//   constructPassportPcdProveAndAddRequestUrl,
//   openPassportPopup,
//   useSerializedPCD,
// } from '@pcd/passport-interface'
// import { IdentityPCDPackage } from 'pcd-country-identity'
// import { ArgumentTypeName } from '@pcd/pcd-types'
// import { useEffect } from 'react'

// export const PCDPASS_URL = 'http://localhost:3000/'

// export function requestIdentitypProof(args: {
//   msgBigInt: bigint
//   sigBigInt: bigint
//   modulusBigInt: bigint
// }) {
//   const popupUrl = window.location.origin + '/popup'
//   const proofUrl = constructPassportPcdProveAndAddRequestUrl<
//     typeof IdentityPCDPackage
//   >(
//     PCDPASS_URL,
//     popupUrl,
//     IdentityPCDPackage.name,
//     {
//       base_message: {
//         argumentType: ArgumentTypeName.BigInt,
//         userProvided: false,
//         value: args.msgBigInt?.toString(),
//         description: '',
//       },
//       signature: {
//         argumentType: ArgumentTypeName.BigInt,
//         userProvided: false,
//         value: args.sigBigInt?.toString(),
//         description: '',
//       },
//       modulus: {
//         argumentType: ArgumentTypeName.BigInt,
//         userProvided: false,
//         value: args.modulusBigInt?.toString(),
//         description: '',
//       },
//     },
//     {
//       genericProveScreen: true,
//       description: 'Generate a proof of identity using your Aadhaar card.',
//       title: 'Identity Proof',
//     },
//   )

//   openPassportPopup(popupUrl, proofUrl)
// }

// export function useIdentityProof(
//   pcdStr: string,
//   onVerified: (valid: boolean) => void,
// ) {
//   const identityPCD = useSerializedPCD(IdentityPCDPackage, pcdStr)

//   useEffect(() => {
//     if (identityPCD) {
//       const { verify } = IdentityPCDPackage
//       verify(identityPCD).then(onVerified)
//     }
//   }, [identityPCD, onVerified])

//   return {
//     proof: identityPCD?.proof,
//   }
// }
