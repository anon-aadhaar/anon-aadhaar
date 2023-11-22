# anon-aadhaar-react

anon-aadhaar-react is a React component library to embed the [anon-aadhaar](https://github.com/privacy-scaling-explorations/anon-aadhaar) circuit in your project, and let you verify that a user has a regular Aadhaar ID, by generating ZKProofs.

## Installation

Install anon-aadhaar-react with npm

```bash
  npm install anon-aadhaar-react
```

Install anon-aadhaar-react with yarn

```bash
  yarn add anon-aadhaar-react
```

## Usage/Examples

**`<AnonAadhaarProvider>`**

```ts
import { AnonAadhaarProvider } from 'anon-aadhaar-react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    // Add the Anon Aadhaar Provider at the root of your app
    <AnonAadhaarProvider appId={YOUR APP ID}>
      <Component {...pageProps} />
    </AnonAadhaarProvider>
  )
}
```

`AnonAadhaarProvider` for the `AnonAadhaarContext`. It manages the authentication state, login requests, and communication with the proving component. This provider initializes the authentication state from local storage on page load and handles updates to the state when login requests are made and when new proofs are received.
You'll need to provide an app Id to the SDK, and all the generated proofs will be linked to this same appId.

--

**`useAnonAadhaar()`**

```tsx
const [AnonAadhaar] = useAnonAadhaar()

useEffect(() => {
  console.log('Country Identity status: ', AnonAadhaar.status)
}, [AnonAadhaar])
```

`useAnonAadhaar()` is a custom React hook that provides access to the authentication state and the login request function from the AnonAadhaarContext. This hook is intended to be used within components that are descendants of the AnonAadhaarProvider.
returns:

- `status`: see AnonAadhaarState
- `request`: context request method

--

**`<LogInWithAnonAadhaar />`**

```tsx
<LogInWithAnonAadhaar />
```

`LogInWithAnonAadhaar` provides a user interface for logging in and logging out using the AnonAadhaarContext.

![image](https://github.com/Meyanis95/anon-aadhaar-react/assets/67648863/2a67ba43-8538-44c3-9314-da74ee455f68)

## License

[MIT](https://choosealicense.com/licenses/mit/)
