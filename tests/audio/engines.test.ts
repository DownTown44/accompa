import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AudioEngine, AudioStatus } from '../../src/audio/engine'
import { createEngine, ENGINES } from '../../src/audio/engines'
import type { Instrument, Sound } from '../../src/core/model'
import { pitch } from '../../src/core/pitch'

const sounds: Sound[] = ['samples', 'synthesized']
const instruments: Instrument[] = ['piano', 'guitar']

describe('engines', () => {
  it.each(sounds.flatMap((sound) => instruments.map((instrument) => [sound, instrument] as const)))(
    'makes a fresh, idle synth for %s on the %s',
    (sound, instrument) => {
      const first = ENGINES[sound][instrument]()
      const second = ENGINES[sound][instrument]()
      expect(first).not.toBe(second)
      expect(first.status()).toBe('idle')
      expect(typeof first.play).toBe('function')
      expect(() => first.stop()).not.toThrow()
    },
  )

  // A tripwire: Story 6.2 deliberately gives the piano its own factory, and this test then changes with it.
  it('keeps every entry on the synth factory', () => {
    const factories = new Set(sounds.flatMap((sound) => instruments.map((instrument) => ENGINES[sound][instrument])))
    expect(factories.size).toBe(1)
  })

  it('routes every combination through one shared engine without throwing', () => {
    for (const sound of sounds) {
      const engine = createEngine(sound)
      expect(engine.status()).toBe('idle')
      for (const instrument of instruments) expect(() => engine.play([pitch(60)], instrument, 'block')).not.toThrow()
      expect(() => engine.stop()).not.toThrow()
    }
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
    table.samples.piano = saved.piano
    table.samples.guitar = saved.guitar
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
