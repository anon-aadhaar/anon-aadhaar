# @anon-aadhaar/react

anon-aadhaar-react is a React component library to embed the [anon-aadhaar](https://github.com/privacy-scaling-explorations/anon-aadhaar) protocol in your project, and let you verify that a user has a regular Aadhaar ID, by generating ZKProofs in the client.

## 🛠️ Installation

Install anon-aadhaar-react with npm

```bash
  npm install @anon-aadhaar/react
```

Install anon-aadhaar-react with yarn

```bash
  yarn add @anon-aadhaar/react
```

## 📜 Usage

### `<AnonAadhaarProvider>`

`AnonAadhaarProvider` for the `AnonAadhaarContext`. It manages the authentication state, login requests, and communication with the proving component. This provider initializes the authentication state from local storage on page load and handles updates to the state when login requests are made and when new proofs are received.

```ts
import { AnonAadhaarProvider } from '@anon-aadhaar/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    // Add the Anon Aadhaar Provider at the root of your app
    <AnonAadhaarProvider>
      <Component {...pageProps} />
    </AnonAadhaarProvider>
  )
}
```

| Parameter         | Description                                                                                                | Default Value |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| `_useTestAadhaar` | Optional. A boolean flag to determine the usage of test or real Aadhaar data.                              | `false`       |
| `_artifactslinks` | Optional. Links of your own custom artifacts. By defaults it will be set to Anon Aadhaar production files. | undefined     |

---

### `useAnonAadhaar()`

`useAnonAadhaar()` is a custom React hook that facilitates access to the Anon Aadhaar authentication state and a method to initiate login requests. This hook is specifically designed for use in components nested within `AnonAadhaarProvider`.

The hook returns an array containing:

1. `AnonAadhaarState`: An object representing the current authentication state, which includes:
   - `status`: Indicates the current authentication status, which can be:
     - `"logged-out"`: The user is not logged in.
     - `"logging-in"`: The login process is underway.
     - `"logged-in"`: The user is successfully logged in.
   - When `status` is `"logged-in"`, `AnonAadhaarState` also includes:
     - `serializedAnonAadhaarProof`: The serialized proof of the Anon Aadhaar authentication.
     - `anonAadhaarProof`: The actual Anon Aadhaar proof object.
2. `startReq`: A function to trigger the login process.

```tsx
const [AnonAadhaar] = useAnonAadhaar()

useEffect(() => {
  console.log('Country Identity status: ', AnonAadhaar.status)
}, [AnonAadhaar])
```

---

### `<LogInWithAnonAadhaar />`

```tsx
<LogInWithAnonAadhaar nullifierSeed={1234} />
```

`LogInWithAnonAadhaar` provides a user interface for logging in and logging out using the AnonAadhaarContext.

| Parameter        | Description                                                       | Default Value | Optional |
| ---------------- | ----------------------------------------------------------------- | ------------- | -------- |
| `signal`         | A unique identifier used to trigger the proof generation process. | undefined     | Yes      |
| `fieldsToReveal` | Specifies which fields should be revealed during the process.     | undefined     | Yes      |
| `nullifierSeed`  | A unique number used to generate a nullifier for the proof.       | undefined     | No       |

---

### `verifySignature`

**Description**: `verifySignature` is a function that authenticates digital signatures on Aadhaar data. It operates by converting string data into a byte array and then decompressing it to extract the signature and the signed data. A public key, fetched from UIDAI's server, is used to verify the authenticity of the signature.

**Usage**:

```ts
const isValidSignature = await verifySignature(qrData, useTestAadhaar)
```

**Parameters**:

- `qrData`: A string representation of the Aadhaar QR code data to be verified.
- `useTestAadhaar`: Boolean flag to toggle between test and real Aadhaar data.

**Returns**: A promise resolving to a boolean indicating the validity of the signature.

---

### `proveAndSerialize`

**Description**: The `proveAndSerialize` function generates SNARK proofs using the Anon Aadhaar proving system. It takes `AnonAadhaarArgs` as input and returns a promise with the generated proof (`AnonAadhaarCore`) and its serialized form.

**Usage**:

```ts
const { anonAadhaarProof, serialized } =
  await proveAndSerialize(anonAadhaarArgs)
```

**Parameters**:

- `anonAadhaarArgs`: Arguments required to generate the `anonAadhaarProof`.

**Returns**: A promise that resolves to an object containing the generated anonAadhaarProof and its serialized form.

---

### `processAadhaarArgs`

**Description**: `processAadhaarArgs` processes QR data to create arguments needed for proof generation in the Anon Aadhaar system.

**Usage**:

```ts
const anonAadhaarArgs = await processAadhaarArgs(qrData, useTestAadhaar)
```

**Parameters**:

- `qrData`: A string representation of the Aadhaar QR code data to be verified.
- `useTestAadhaar`: Boolean flag to toggle between test and real Aadhaar data.

**Returns**: A promise resolving to the `AnonAadhaarArgs` object, which contains parameters needed for proof generation.

### `LaunchProveModal`

The `LaunchProveModal` component offers a seamless interface for users to initiate the proof generation process and bypass the conventional authentication flow. It leverages the `AnonAadhaarContext` to manage the initiation and completion of the zero-knowledge proof generation, enhancing user privacy and security.

```tsx
import { LaunchProveModal } from '@anon-aadhaar/react'

function YourComponent() {
  return (
    <div>
      <LaunchProveModal
        signal="yourSignalIdentifier"
        buttonStyle={{ backgroundColor: 'blue', color: 'white' }}
        buttonTitle="Generate a proof"
        nullifierSeed={1234}
      />
    </div>
  )
}
```

| Parameter        | Description                                                       | Default Value        | Optional |
| ---------------- | ----------------------------------------------------------------- | -------------------- | -------- |
| `signal`         | A unique identifier used to trigger the proof generation process. | undefined            | Yes      |
| `buttonStyle`    | CSS properties to customize the appearance of the button.         | `{}`                 | Yes      |
| `buttonTitle`    | Text displayed on the button to indicate the action to the user.  | `'Generate a proof'` | Yes      |
| `fieldsToReveal` | Specifies which fields should be revealed during the process.     | undefined            | Yes      |
| `nullifierSeed`  | A unique number used to generate a nullifier for the proof.       | undefined            | No       |

This component simplifies the user interaction by providing a single button that, when clicked, opens the proof generation modal window.

### `useProver` Hook

```tsx
import { useProver } from '@anon-aadhaar/react'

function YourComponent() {
  const [proverState, anonAadhaarCore] = useProver()

  // Use proverState and anonAadhaarCore as needed
}
```

| Return Value      | Description                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ProverState`     | The current state of the proof generation processwith relevant state details.                                                              |
| `AnonAadhaarCore` | Represents the deserialized proof of authentication, if available, indicating a successful proof generation. Otherwise, it is `undefined`. |
