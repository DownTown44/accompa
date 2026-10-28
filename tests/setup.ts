// The piano sampler fetches its files when the app builds an engine; no test may reach a network, so every fetch fails at once.
// Tests that look at fetches stub it themselves.
globalThis.fetch = () => Promise.reject(new Error('no network in tests'))
