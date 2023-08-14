
# country-identity-kit

Country Identity Kit is a React component library to embed the [anon-aadhaar](https://github.com/privacy-scaling-explorations/anon-aadhaar) circuit in your project, and let you verify that a user has a regular Aadhaar ID, by generating ZKProofs.


## Installation

Install country-identity-kit with npm

```bash
  npm install country-identity-kit
```
Install country-identity-kit with yarn

```bash
  yarn add country-identity-kit
```    


## Usage/Examples

**`<CountryIdentityProvider>`**

```ts
import { CountryIdentityProvider } from "country-identity-kit";

export default function App({ Component, pageProps }: AppProps) {
  return (
    // Add the Country Identity Provider at the root of your app
    <CountryIdentityProvider>
      <Component {...pageProps} />
    </CountryIdentityProvider>
  );
}
```
`CountryIdentityProvider` for the `CountryIdentityContext`. It manages the authentication state, login requests, and communication with the proving component. This provider initializes the
authentication state from local storage on page load and handles updates to the state when login requests are made and when new proofs are received.

--

**`useCountryIdentity()`**

```tsx
const [countryIdentity] = useCountryIdentity();

useEffect(() => {
  console.log("Country Identity status: ", countryIdentity.status);
}, [countryIdentity]);
```
`useCountryIdentity()` is a custom React hook that provides access to the authentication state and the login request function from the CountryIdentityContext. This hook is intended to be used within components that are descendants of the CountryIdentityProvider.
returns:
- `status`: see CountryIdentityState
- `request`: context request method

--

**`<LogInWithCountryIdentity />`**

```tsx
<LogInWithCountryIdentity />
```

`LogInWithCountryIdentity` provides a user interface for logging in and logging out using the CountryIdentityContext. 

![image](https://github.com/Meyanis95/country-identity-kit/assets/67648863/2a67ba43-8538-44c3-9314-da74ee455f68)


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Acknowledgements

This package is part of the work of [Privacy and Scaling Explorations](https://pse.dev/).

