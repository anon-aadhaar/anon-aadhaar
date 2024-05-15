import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  return isReady && <AnonAadhaarProvider _useTestAadhaar={true} _appName="AFK"><Component {...pageProps} /></AnonAadhaarProvider>;
}
