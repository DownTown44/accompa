import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AudioEngine, AudioStatus } from '../../src/audio/engine'
import { createEngine, ENGINES } from '../../src/audio/engines'
import type { Instrument, Sound } from '../../src/core/model'
import { pitch } from '../../src/core/pitch'

const sounds: Sound[] = ['samples', 'synthesized']
const instruments: Instrument[] = ['piano', 'guitar']

// The real piano sampler fetches at creation; no test may reach a network.
beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no network in tests')))
})

describe('engines', () => {
  it.each(sounds.flatMap((sound) => instruments.map((instrument) => [sound, instrument] as const)))(
    'makes a fresh, idle engine for %s on the %s',
    (sound, instrument) => {
      const first = ENGINES[sound][instrument]()
      const second = ENGINES[sound][instrument]()
      expect(first).not.toBe(second)
      expect(first.status()).toBe('idle')
      expect(typeof first.play).toBe('function')
      expect(() => first.stop()).not.toThrow()
    },
  )

  // A tripwire: Story 6.3 gives the guitar its own factory, and this test then changes with it.
  it('gives only samples on the piano its own factory', () => {
    expect(ENGINES.samples.guitar).toBe(ENGINES.synthesized.piano)
    expect(ENGINES.synthesized.guitar).toBe(ENGINES.synthesized.piano)
    expect(ENGINES.samples.piano).not.toBe(ENGINES.synthesized.piano)
  })

  it('routes every combination through one shared engine without throwing', () => {
    for (const sound of sounds) {
      const engine = createEngine(sound)
      expect(engine.status()).toBe('idle')
      for (const instrument of instruments) expect(() => engine.play([pitch(60)], instrument, 'block')).not.toThrow()
      expect(() => engine.stop()).not.toThrow()
    }
  })

  it('fetches the 21 piano files for samples and requests nothing for synthesized', () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('no network in tests')))
    vi.stubGlobal('fetch', fetchSpy)
    const synthesized = createEngine('synthesized')
    synthesized.play([pitch(60)], 'piano', 'block')
    synthesized.play([pitch(60)], 'guitar', 'block')
    expect(fetchSpy).not.toHaveBeenCalled()
    createEngine('samples')
    expect(fetchSpy).toHaveBeenCalledTimes(21)
    vi.unstubAllGlobals()
  })

  it('builds a separate router per call', () => {
    expect(createEngine('samples')).not.toBe(createEngine('samples'))
  })
})

describe('the router', () => {
  const table = ENGINES as unknown as Record<Sound, Record<Instrument, () => AudioEngine>>
  const saved = { piano: ENGINES.samples.piano, guitar: ENGINES.samples.guitar }
  const spyEngine = () =>
    ({ play: vi.fn(), stop: vi.fn(), unlock: vi.fn(), status: vi.fn((): AudioStatus => 'idle'), subscribe: vi.fn(() => () => {}) }) satisfies AudioEngine

  afterEach(() => {
    vi.unstubAllGlobals()
    table.samples.piano = saved.piano
    table.samples.guitar = saved.guitar
  })

  it('builds the piano engine when the router is created and the guitar on first use', () => {
    const piano = vi.fn(spyEngine)
    const guitar = vi.fn(spyEngine)
    table.samples.piano = piano
    table.samples.guitar = guitar
    const router = createEngine('samples')
    expect(piano).toHaveBeenCalledTimes(1)
    expect(guitar).not.toHaveBeenCalled()
    router.play([pitch(60)], 'guitar', 'block')
    expect(guitar).toHaveBeenCalledTimes(1)
  })

  it('builds one engine for both instruments when they share a factory, and forwards the exact play arguments', () => {
    const engine = spyEngine()
    const factory = vi.fn(() => engine)
    table.samples.piano = factory
    table.samples.guitar = factory
    const router = createEngine('samples')
    router.play([pitch(60)], 'piano', 'block')
    router.play([pitch(64), pitch(67)], 'guitar', 'strum')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(engine.play.mock.calls).toEqual([
      [[pitch(60)], 'piano', 'block'],
      [[pitch(64), pitch(67)], 'guitar', 'strum'],
    ])
  })

  it('builds each instrument its own engine when the factories differ, plays on the chosen one, and stops every built engine', () => {
    const piano = spyEngine()
    const guitar = spyEngine()
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    router.play([pitch(60)], 'guitar', 'block')
    expect(guitar.play).toHaveBeenCalledTimes(1)
    expect(piano.play).not.toHaveBeenCalled()
    router.play([pitch(60)], 'piano', 'block')
    router.stop()
    expect(piano.stop).toHaveBeenCalledTimes(1)
    expect(guitar.stop).toHaveBeenCalledTimes(1)
  })

  it('takes unlock, status and subscribe from the piano engine until the status follows the instrument', () => {
    const piano = spyEngine()
    const guitar = spyEngine()
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    router.unlock()
    router.status()
    router.subscribe(() => {})
    expect(piano.unlock).toHaveBeenCalledTimes(1)
    expect(piano.status).toHaveBeenCalledTimes(1)
    expect(piano.subscribe).toHaveBeenCalledTimes(1)
    expect(guitar.unlock).not.toHaveBeenCalled()
  })
})
