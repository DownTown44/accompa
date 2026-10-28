import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AudioEngine, AudioStatus } from '../../src/audio/engine'
import { createEngine, ENGINES } from '../../src/audio/engines'
import type { Instrument, Sound } from '../../src/core/model'
import { pitch } from '../../src/core/pitch'

const sounds: Sound[] = ['samples', 'synthesized']
const instruments: Instrument[] = ['piano', 'guitar']

// The real samplers fetch on prepare; no test may reach a network.
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

  it('gives only the synthesized combinations a shared factory', () => {
    expect(ENGINES.synthesized.guitar).toBe(ENGINES.synthesized.piano)
    expect(ENGINES.samples.piano).not.toBe(ENGINES.synthesized.piano)
    expect(ENGINES.samples.guitar).not.toBe(ENGINES.synthesized.piano)
    expect(ENGINES.samples.guitar).not.toBe(ENGINES.samples.piano)
  })

  it('routes every combination through one shared engine without throwing', () => {
    for (const sound of sounds) {
      const engine = createEngine(sound)
      expect(engine.status()).toBe('idle')
      for (const instrument of instruments) expect(() => engine.play([pitch(60)], instrument, 'block')).not.toThrow()
      expect(() => engine.stop()).not.toThrow()
    }
  })

  it('fetches nothing at creation, the active set on prepare once, and nothing for synthesized', () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('no network in tests')))
    vi.stubGlobal('fetch', fetchSpy)
    const synthesized = createEngine('synthesized')
    synthesized.prepare?.('guitar')
    synthesized.play([pitch(60)], 'piano', 'block')
    synthesized.play([pitch(60)], 'guitar', 'block')
    expect(fetchSpy).not.toHaveBeenCalled()
    const samples = createEngine('samples')
    expect(fetchSpy).not.toHaveBeenCalled()
    samples.prepare?.('piano')
    expect(fetchSpy).toHaveBeenCalledTimes(21)
    samples.prepare?.('guitar')
    expect(fetchSpy).toHaveBeenCalledTimes(39)
    samples.prepare?.('piano')
    samples.prepare?.('guitar')
    expect(fetchSpy).toHaveBeenCalledTimes(39)
    const urls = (fetchSpy.mock.calls as unknown as [string][]).map(([url]) => url)
    expect(urls.filter((u) => u.includes('/guitar/') && u.endsWith('.flac'))).toHaveLength(18)
    vi.unstubAllGlobals()
  })

  it('fetches only the guitar set when the session starts on the guitar', () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('no network in tests')))
    vi.stubGlobal('fetch', fetchSpy)
    createEngine('samples').prepare?.('guitar')
    expect(fetchSpy).toHaveBeenCalledTimes(18)
    for (const [url] of fetchSpy.mock.calls as unknown as [string][]) expect(url).toContain('/guitar/')
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

  it('builds no engine at creation and builds each on first use', () => {
    const piano = vi.fn(spyEngine)
    const guitar = vi.fn(spyEngine)
    table.samples.piano = piano
    table.samples.guitar = guitar
    const router = createEngine('samples')
    expect(piano).not.toHaveBeenCalled()
    expect(guitar).not.toHaveBeenCalled()
    router.play([pitch(60)], 'guitar', 'block')
    expect(guitar).toHaveBeenCalledTimes(1)
    expect(piano).not.toHaveBeenCalled()
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
    expect(guitar.stop).toHaveBeenCalledTimes(2)
  })

  it('prepare records the active instrument, builds its engine and prepares it', () => {
    const piano = { ...spyEngine(), prepare: vi.fn() }
    const guitar = { ...spyEngine(), prepare: vi.fn() }
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    router.prepare?.('guitar')
    expect(guitar.prepare).toHaveBeenCalledWith('guitar')
    expect(piano.prepare).not.toHaveBeenCalled()
    router.status()
    expect(guitar.status).toHaveBeenCalledTimes(1)
    expect(piano.status).not.toHaveBeenCalled()
  })

  it('unlocks every built engine', () => {
    const piano = spyEngine()
    const guitar = spyEngine()
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    router.prepare?.('piano')
    router.unlock()
    expect(piano.unlock).toHaveBeenCalledTimes(1)
    expect(guitar.unlock).not.toHaveBeenCalled()
    router.play([pitch(60)], 'guitar', 'block')
    router.unlock()
    expect(piano.unlock).toHaveBeenCalledTimes(2)
    expect(guitar.unlock).toHaveBeenCalledTimes(1)
  })

  it('status and subscribe follow the active instrument, and a swap notifies listeners', () => {
    const make = (status: AudioStatus) => {
      const listeners = new Set<() => void>()
      return {
        ...spyEngine(),
        status: vi.fn(() => status),
        subscribe: vi.fn((l: () => void) => {
          listeners.add(l)
          return () => listeners.delete(l)
        }),
        emit: () => listeners.forEach((l) => l()),
        listeners,
      }
    }
    const piano = make('running')
    const guitar = make('blocked')
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    const listener = vi.fn()
    router.subscribe(listener)
    expect(router.status()).toBe('running')
    piano.emit()
    expect(listener).toHaveBeenCalledTimes(1)
    router.prepare?.('guitar')
    expect(listener).toHaveBeenCalledTimes(2)
    expect(router.status()).toBe('blocked')
    expect(piano.listeners.size).toBe(0)
    guitar.emit()
    expect(listener).toHaveBeenCalledTimes(3)
    piano.emit()
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('attaches once for several listeners, detaches after the last unsubscribe and attaches again on a new one', () => {
    const detach = vi.fn()
    const piano = { ...spyEngine(), subscribe: vi.fn(() => detach) }
    table.samples.piano = () => piano
    table.samples.guitar = () => spyEngine()
    const router = createEngine('samples')
    router.prepare?.('piano')
    const first = router.subscribe(() => {})
    const second = router.subscribe(() => {})
    expect(piano.subscribe).toHaveBeenCalledTimes(1)
    first()
    expect(detach).not.toHaveBeenCalled()
    second()
    expect(detach).toHaveBeenCalledTimes(1)
    router.subscribe(() => {})
    expect(piano.subscribe).toHaveBeenCalledTimes(2)
  })

  it('does not notify listeners when prepare names the instrument that is already active', () => {
    table.samples.piano = () => spyEngine()
    table.samples.guitar = () => spyEngine()
    const router = createEngine('samples')
    router.prepare?.('piano')
    const listener = vi.fn()
    router.subscribe(listener)
    router.prepare?.('piano')
    expect(listener).not.toHaveBeenCalled()
  })

  it('a play stops the other built engines first; a swap on its own cuts nothing', () => {
    const piano = spyEngine()
    const guitar = spyEngine()
    table.samples.piano = () => piano
    table.samples.guitar = () => guitar
    const router = createEngine('samples')
    router.play([pitch(60)], 'piano', 'block')
    router.prepare?.('guitar')
    expect(piano.stop).not.toHaveBeenCalled()
    expect(guitar.stop).not.toHaveBeenCalled()
    router.play([pitch(60)], 'guitar', 'block')
    expect(piano.stop).toHaveBeenCalledTimes(1)
    expect(guitar.stop).not.toHaveBeenCalled()
  })
})
