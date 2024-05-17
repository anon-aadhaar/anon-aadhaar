import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { generateAFKProofs } from '@/identity/createAFKProof'
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const ParamsPage = () => {
  const router = useRouter()
  const { _identity } = useAFKIentity()
  const [isConnected, setIsconnected] = useState(false)
  const [anonAadhaar] = useAnonAadhaar()
  const { params } = router.query

  useEffect(() => {
    if (anonAadhaar.status === 'logged-in') setIsconnected(true)
  }, [anonAadhaar])

  // To do: receive request and generate the proof accordingly

  const generateProofandRedirect = async params => {
    if (!params) throw new Error('Error parsing params')
    const { fieldsToReveal, returnUrl } = JSON.parse(params)

    console.log('Fields to reveal: ', fieldsToReveal)
    console.log('Return url: ', returnUrl)

    if (!_identity) throw new Error('An Identity must be set to log-in')

    try {
      const proof = await generateAFKProofs(
        _identity.privateKey,
        fieldsToReveal,
      )

      console.log(proof)

      const payload = encodeURIComponent(
        JSON.stringify({
          proof: proof,
        }),
      )

      // Redirect back to port 3000 with the payload
      window.location.href = `${returnUrl}?payload=${payload}`
    } catch (error) {
      console.error('Error generating proof:', error)
    }
  }

  return (
    <div>
      <h1>Request Page</h1>
      {isConnected ? (
        <>
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
              onClick={() => generateProofandRedirect(params)}
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          <p>First you need to connect</p>
          {_identity && (
            <LogInWithAnonAadhaar
              nullifierSeed={_identity.privateKey}
              fieldsToReveal={[
                'revealAgeAbove18',
                'revealGender',
                'revealPinCode',
                'revealState',
              ]}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ParamsPage
