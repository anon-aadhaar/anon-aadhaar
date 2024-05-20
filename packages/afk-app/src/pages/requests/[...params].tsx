/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { generateAFKProofs } from '@/identity/createAFKProof'
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react'
import { FieldsToRevealArray, fieldsLabel } from '../../utils/types'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { icons } from '../../styles/MainIcons'

const ParamsPage = () => {
  const router = useRouter()
  const { _identity } = useAFKIentity()
  const [isConnected, setIsconnected] = useState(false)
  const [requestedReveal, setRequestedReveal] =
    useState<FieldsToRevealArray | null>(null)
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
    if (params) {
      const parsedParams = JSON.parse(params as string)
      if (parsedParams.fieldsToReveal) {
        setRequestedReveal(parsedParams.fieldsToReveal)
      }
    }
  }, [params])

  const onCancel = (params: any) => {
    if (!params) throw new Error('Error parsing params')
    const { returnUrl } = JSON.parse(params)

    window.location.href = returnUrl
  }

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
      <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative isolate px-6 pt-6 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <p className="text-4xl text-center mx-auto w-auto">🌍</p>
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to consumer app
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              {isConnected ? (
                <>
                  <div className="space-y-6">
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
                  </div>

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
                      <button
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-red-400 hover:bg-red-50 focus-visible:ring-transparent"
                        onClick={() => onCancel(params)}
                      >
                        <span className="text-sm font-semibold leading-6">
                          Cancel
                        </span>
                      </button>

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
                </>
              ) : (
                <div className="space-y-6">
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
                </div>
              )}
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Learn more about AFK
            </p>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ParamsPage
