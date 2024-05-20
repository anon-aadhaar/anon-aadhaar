/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { generateAFKProofs } from '@/identity/createAFKProof'
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react'
import { FieldsToReveal, fieldsLabel } from '../../utils/types'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { icons } from '../../styles/MainIcons'

const ParamsPage = () => {
  const router = useRouter()
  const { _identity } = useAFKIentity()
  const [isConnected, setIsconnected] = useState(false)
  const [requestedReveal, setRequestedReveal] = useState<
    FieldsToReveal[] | null
  >(null)
  const [anonAadhaar] = useAnonAadhaar()
  const { params } = router.query

  const eyeBlob = new Blob([icons.eye], { type: 'image/svg+xml' })
  const revealillustration = useMemo(
    () => URL.createObjectURL(eyeBlob),
    [icons.eye],
  )

  const eyeOffBlob = new Blob([icons.eyeOff], { type: 'image/svg+xml' })
  const noRevealillustration = useMemo(
    () => URL.createObjectURL(eyeOffBlob),
    [icons.eyeOff],
  )

  useEffect(() => {
    if (anonAadhaar.status === 'logged-in') setIsconnected(true)
  }, [anonAadhaar])

  useEffect(() => {
    if (params && typeof params === 'string') {
      const parsedParams = JSON.parse(params)
      if (parsedParams.fieldsToReveal) {
        setRequestedReveal(parsedParams.fieldsToReveal)
      }
    }
  }, [params])

  const generateProofandRedirect = async (params: any) => {
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <p className="text-4xl text-center mx-auto w-auto">🌍</p>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to consumer app
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" action="#" method="POST">
              <div>
                <p>
                  By continuing, AFK will share your Aadhaar proof of
                  personhood, and the following:
                </p>
                <div className="flex flex-col gap-2 mt-10">
                  {requestedReveal
                    ? fieldsLabel.map(({ key, label }) =>
                        requestedReveal.includes(key) ? (
                          <div className="flex items-center" key={key}>
                            <div className="flex flex-row w-full border items-center border-green-600 rounded-md font-rajdhani font-semibold text-black py-2 px-3">
                              <img
                                src={revealillustration}
                                className="h-6 mr-2"
                              />
                              {label}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center" key={key}>
                            <div className="flex flex-row w-full border items-center border-slate-300 rounded-md font-rajdhani font-semibold text-black py-2 px-3">
                              <img
                                src={noRevealillustration}
                                className="h-6 mr-2"
                              />
                              {label}
                            </div>
                          </div>
                        ),
                      )
                    : fieldsLabel.map(({ key, label }) => (
                        <div className="flex items-center" key={key}>
                          <div className="flex flex-row w-full border items-center border-gray-600 rounded-md font-rajdhani font-semibold text-black py-2 px-3">
                            <img
                              src={noRevealillustration}
                              className="h-6 mr-2"
                            />
                            {label}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </form>

            <div>
              <div className="relative mt-10">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6"></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                >
                  <span className="text-sm font-semibold leading-6">
                    Cancel
                  </span>
                </a>

                <button
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                  onClick={() => generateProofandRedirect(params)}
                >
                  <span className="text-sm font-semibold leading-6">
                    Continue
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Learn more about AFK
          </p>
        </div>
      </div>
    </>
    // <div>
    //   <h1>Request Page</h1>
    //   {isConnected ? (
    //     <>
    //       <p>The App x is requesting you to reveal the following items:</p>
    //       {params && params}
    //       <div className="flex justify-center flex-row gap-2">
    //         <button className="w-50 bg-white text-black">Cancel</button>
    //         <button
    //           className="w-50 bg-white text-black"
    //           onClick={() => generateProofandRedirect(params)}
    //         >
    //           Continue
    //         </button>
    //       </div>
    //     </>
    //   ) : (
    //     <>
    //       <p>First you need to connect</p>
    //       {_identity && (
    //         <LogInWithAnonAadhaar
    //           nullifierSeed={_identity.privateKey}
    //           fieldsToReveal={[
    //             'revealAgeAbove18',
    //             'revealGender',
    //             'revealPinCode',
    //             'revealState',
    //           ]}
    //         />
    //       )}
    //     </>
    //   )}
    // </div>
  )
}

export default ParamsPage
