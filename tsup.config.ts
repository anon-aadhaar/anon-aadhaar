export default {
  define: {
    'process.env': JSON.stringify({
      WASM_URL: process.env.WASM_URL,
      ZKEY_URL: process.env.ZKEY_URL,
    }),
  },
}
