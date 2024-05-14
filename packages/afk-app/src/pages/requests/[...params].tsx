import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { generateAFKProofs } from '@/identity/createAFKProof'
import { useRouter } from 'next/router'

const ParamsPage = () => {
  const router = useRouter()
  const { _identity } = useAFKIentity()
  const { params } = router.query

  // To do: receive request and generate the proof accordingly

  const generateProofandRedirect = async () => {
    if (!params) throw Error('Error parsing params')
    const fiedsToReveal = JSON.parse(params).fieldsToReveal

    if (!_identity) throw Error('An Identity must be set to log-in')
    const proof = await generateAFKProofs(_identity.privateKey, fiedsToReveal)

    console.log(proof)

    const payload = encodeURIComponent(
      JSON.stringify({
        proof: proof,
      }),
    )

    console.log(payload)
    // return payload
  }

  //   encodeURIComponent(
  //     JSON.stringify({
  //       bio: 'India',
  //       fieldsToReveal: ['ageAbove18', 'gender'],
  //       returnUrl: 'localhost:3000',
  //     }),
  //   ),
  //     console.log(JSON.parse(params).bio)

  return (
    <div>
      <h1>Request Page</h1>
      <p>The App x is requesting you to reveal the following items:</p>
      {params && (
        <ul>
          {params.map((param, index) => (
            <li key={index}>{param}</li>
          ))}
        </ul>
      )}
      <div className="flex justify-center flex-row gap-2">
        <button className="w-50 bg-white text-black">Cancel</button>
        <button
          className="w-50 bg-white text-black"
          onClick={() => generateProofandRedirect()}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default ParamsPage
