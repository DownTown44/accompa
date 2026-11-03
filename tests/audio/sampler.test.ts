import { describe, expect, it, vi } from 'vitest'
import { createSamplerEngine } from '../../src/audio/sampler'
import { GUITAR_SET, PIANO_SET } from '../../src/audio/sampleSets'
import { ARPEGGIO_STEP, STRUM_SPREAD } from '../../src/audio/timing'
import { pitch } from '../../src/core/pitch'
import { asContext, FakeContext, flush } from './support/fakeContext'

const loaded = async (ctx: FakeContext, set = PIANO_SET) => {
  const load = (url: string) => Promise.resolve(new TextEncoder().encode(url).buffer as ArrayBuffer)
  const decode = (data: ArrayBuffer) =>
    Promise.resolve({ name: new TextDecoder().decode(data) } as unknown as AudioBuffer)
  const engine = createSamplerEngine(set, asContext(ctx), load, decode)
  engine.prepare?.('piano')
  await flush()
  return engine
}
const bufferName = (source: { buffer: unknown }) => (source.buffer as { name: string }).name.split('/').pop()

describe('sampler engine', () => {
  it('fetches nothing at creation, then 21 same-origin files on prepare, and nothing on a second prepare', () => {
    const load = vi.fn((_url: string) => new Promise<ArrayBuffer>(() => {}))
    const engine = createSamplerEngine(PIANO_SET, asContext(new FakeContext('running')), load)
    expect(load).not.toHaveBeenCalled()
    engine.prepare?.('piano')
    expect(load).toHaveBeenCalledTimes(21)
    engine.prepare?.('piano')
    expect(load).toHaveBeenCalledTimes(21)
    for (const [url] of load.mock.calls) {
      expect(url.startsWith(import.meta.env.BASE_URL)).toBe(true)
      expect(url.startsWith('//')).toBe(false)
      expect(url).not.toContain('://')
    }
  })

  it('prepares on play as a safety net, and only once', () => {
    const load = vi.fn((_url: string) => new Promise<ArrayBuffer>(() => {}))
    const engine = createSamplerEngine(GUITAR_SET, asContext(new FakeContext('running')), load)
    engine.play([pitch(60)], 'guitar', 'block')
    engine.play([pitch(62)], 'guitar', 'block')
    expect(load).toHaveBeenCalledTimes(18)
  })

  it('plays the guitar set as flac buffers at its own gain, in list order bass first for a strum', async () => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx, GUITAR_SET)
    engine.play([pitch(53), pitch(52), pitch(85)], 'guitar', 'strum')
    expect(ctx.sources.map(bufferName)).toEqual(['F3.flac', 'F3.flac', 'C6.flac'])
    expect(ctx.sources.map((s) => s.playbackRate.value)).toEqual([1, 2 ** (-1 / 12), 2 ** (1 / 12)])
    const [a, b, c] = ctx.sources.map((s) => s.startedAt!)
    expect(b - a).toBeCloseTo(STRUM_SPREAD, 10)
    expect(c - a).toBeCloseTo(2 * STRUM_SPREAD, 10)
    expect(ctx.gains[0].gain.value).toBe(GUITAR_SET.gain / Math.sqrt(3))
  })

  it('stays silent and throws nothing when a fetch fails', async () => {
    const ctx = new FakeContext('running')
    const engine = createSamplerEngine(PIANO_SET, asContext(ctx), () => Promise.reject(new Error('404')))
    engine.prepare?.('piano')
    await flush()
    expect(() => engine.play([pitch(60)], 'piano', 'block')).not.toThrow()
    expect(ctx.sources).toHaveLength(0)
  })

  it('makes no sound before the set has decoded', () => {
    const ctx = new FakeContext('running')
    const engine = createSamplerEngine(PIANO_SET, asContext(ctx), () => new Promise<ArrayBuffer>(() => {}))
    engine.play([pitch(60)], 'piano', 'block')
    expect(ctx.sources).toHaveLength(0)
  })

  it('plays a block from the nearest notes at one time, gain over the square root of the count', async () => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx)
    engine.play([60, 64, 67].map(pitch), 'piano', 'block')
    expect(ctx.sources.map(bufferName)).toEqual(['C4.mp3', 'Ds4.mp3', 'Fs4.mp3'])
    expect(ctx.sources.map((s) => s.playbackRate.value)).toEqual([1, 2 ** (1 / 12), 2 ** (1 / 12)])
    expect(new Set(ctx.sources.map((s) => s.startedAt)).size).toBe(1)
    expect(ctx.gains.map((g) => g.gain.value)).toEqual([0, 1, 2].map(() => PIANO_SET.gain / Math.sqrt(3)))
  })

  it.each([
    ['arpeggio', ARPEGGIO_STEP],
    ['strum', STRUM_SPREAD],
  ] as const)('steps a %s in list order', async (mode, step) => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx)
    engine.play([60, 64, 67].map(pitch), 'piano', mode)
    const [a, b, c] = ctx.sources.map((s) => s.startedAt!)
    expect(b - a).toBeCloseTo(step, 10)
    expect(c - a).toBeCloseTo(2 * step, 10)
  })

  it('cuts the previous sources on a new play, and stop silences the rest', async () => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx)
    engine.play([pitch(60)], 'piano', 'block')
    engine.play([pitch(62)], 'piano', 'block')
    expect(ctx.sources[0].stoppedNow).toBe(true)
    expect(ctx.sources[1].stoppedNow).toBe(false)
    engine.stop()
    expect(ctx.sources[1].stoppedNow).toBe(true)
  })

  it('replays the same list as the same sources in the same order', async () => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx)
    engine.play([60, 64].map(pitch), 'piano', 'arpeggio')
    engine.play([60, 64].map(pitch), 'piano', 'arpeggio')
    expect(ctx.sources.slice(0, 2).map(bufferName)).toEqual(ctx.sources.slice(2).map(bufferName))
  })

  it('resumes a suspended context in the gesture and lets only the latest request start', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = await loaded(ctx)
    engine.play([pitch(60)], 'piano', 'block')
    engine.play([pitch(64)], 'piano', 'block')
    await flush()
    expect(ctx.sources).toHaveLength(1)
    expect(engine.status()).toBe('running')
  })

  it('unlock resumes a suspended context inside the gesture', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = await loaded(ctx)
    engine.unlock()
    await flush()
    expect(engine.status()).toBe('running')
  })

  it('plays two pitches that share a nearest note as two sources of the same buffer', async () => {
    const ctx = new FakeContext('running')
    const engine = await loaded(ctx)
    engine.play([pitch(60), pitch(59)], 'piano', 'block')
    expect(ctx.sources.map(bufferName)).toEqual(['C4.mp3', 'C4.mp3'])
    expect(ctx.sources.map((s) => s.playbackRate.value)).toEqual([1, 2 ** (-1 / 12)])
  })

  it('never throws when audio is unavailable', () => {
    const engine = createSamplerEngine(
      PIANO_SET,
      () => {
        throw new Error('no audio')
      },
      () => Promise.reject(new Error('x')),
    )
    expect(() => engine.play([pitch(60)], 'piano', 'block')).not.toThrow()
    expect(engine.status()).toBe('blocked')
  })
})
