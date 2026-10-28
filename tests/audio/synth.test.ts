import { describe, expect, it, vi } from 'vitest'
import { createSynthEngine } from '../../src/audio/synth'
import { pitch } from '../../src/core/pitch'
import { asContext, FakeContext, FakeGain, flush } from './support/fakeContext'

describe('synth engine', () => {
  it('creates no context before the first gesture', () => {
    const create = vi.fn()
    const engine = createSynthEngine(create)
    expect(engine.status()).toBe('idle')
    expect(create).not.toHaveBeenCalled()
  })

  it('plays an arpeggio in list order at increasing times', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60), pitch(67)], 'piano', 'arpeggio')
    const [first, second] = ctx.oscillators
    expect(ctx.oscillators).toHaveLength(2)
    expect(first.startedAt).not.toBeNull()
    expect(second.startedAt!).toBeGreaterThan(first.startedAt!)
    expect(first.frequency.value).toBeCloseTo(261.63, 1)
    expect(second.frequency.value).toBeCloseTo(392, 0)
    expect(engine.status()).toBe('running')
  })

  it('keeps the order of a descending list', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([pitch(67), pitch(60)], 'piano', 'arpeggio')
    const [first, second] = ctx.oscillators
    expect(first.frequency.value).toBeGreaterThan(second.frequency.value)
    expect(second.startedAt!).toBeGreaterThan(first.startedAt!)
  })

  it('starts every note of a block together', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([pitch(60), pitch(64), pitch(67)], 'piano', 'block')
    expect(new Set(ctx.oscillators.map((o) => o.startedAt)).size).toBe(1)
    expect(ctx.oscillators).toHaveLength(3)
  })

  it('steps an eight-note arpeggio low to high at equal intervals', () => {
    const ctx = new FakeContext('running')
    const notes = [60, 62, 64, 65, 67, 69, 71, 72].map(pitch)
    createSynthEngine(asContext(ctx)).play(notes, 'piano', 'arpeggio')
    const starts = ctx.oscillators.map((o) => o.startedAt!)
    const freqs = ctx.oscillators.map((o) => o.frequency.value)
    expect(ctx.oscillators).toHaveLength(8)
    expect([...freqs].sort((a, b) => a - b)).toEqual(freqs)
    const steps = starts.slice(1).map((t, i) => t - starts[i])
    expect(steps.every((d) => d > 0)).toBe(true)
    expect(steps[0]).toBeCloseTo(0.55, 10)
    steps.forEach((d) => expect(d).toBeCloseTo(steps[0], 10))
  })

  it('starts all eight notes of a block together', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([60, 62, 64, 65, 67, 69, 71, 72].map(pitch), 'piano', 'block')
    expect(ctx.oscillators).toHaveLength(8)
    expect(new Set(ctx.oscillators.map((o) => o.startedAt)).size).toBe(1)
  })

  it('tunes A4 to 440 Hz', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([pitch(69)], 'piano', 'block')
    expect(ctx.oscillators[0].frequency.value).toBeCloseTo(440, 5)
  })

  it('replays the same list identically', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60), pitch(64)], 'piano', 'arpeggio')
    engine.play([pitch(60), pitch(64)], 'piano', 'arpeggio')
    const [a1, a2, b1, b2] = ctx.oscillators
    expect([b1.frequency.value, b2.frequency.value]).toEqual([a1.frequency.value, a2.frequency.value])
    expect(b2.startedAt! - b1.startedAt!).toBeCloseTo(a2.startedAt! - a1.startedAt!, 10)
  })

  it('resumes a suspended context in the gesture and then plays', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    expect(ctx.resumes).toBe(1)
    await flush()
    expect(ctx.oscillators).toHaveLength(1)
    expect(engine.status()).toBe('running')
  })

  it('reports blocked when the context stays suspended, and plays nothing', async () => {
    const ctx = new FakeContext('suspended', 'suspended')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    await flush()
    expect(engine.status()).toBe('blocked')
    expect(ctx.oscillators).toHaveLength(0)
  })

  it('unlock creates the context, resumes it and notifies subscribers', async () => {
    const ctx = new FakeContext('suspended', 'suspended')
    const engine = createSynthEngine(asContext(ctx))
    const listener = vi.fn()
    engine.subscribe(listener)
    engine.unlock()
    await flush()
    expect(engine.status()).toBe('blocked')
    expect(listener).toHaveBeenCalled()
    ctx.state = 'running'
    ctx.onstatechange?.()
    expect(engine.status()).toBe('running')
  })

  it('stops notifying after unsubscribe', async () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    const listener = vi.fn()
    engine.subscribe(listener)()
    engine.play([pitch(60)], 'piano', 'block')
    expect(listener).not.toHaveBeenCalled()
  })

  it('never throws when audio is unavailable, and reports blocked', () => {
    const engine = createSynthEngine(() => {
      throw new Error('no audio')
    })
    expect(() => engine.play([pitch(60)], 'piano', 'block')).not.toThrow()
    expect(() => engine.unlock()).not.toThrow()
    expect(engine.status()).toBe('blocked')
  })

  it('stops sounding notes', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60), pitch(64)], 'piano', 'block')
    engine.stop()
    expect(ctx.oscillators.every((o) => o.stoppedNow)).toBe(true)
  })

  it('cuts the previous notes when a new list starts', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    engine.play([pitch(62)], 'piano', 'block')
    expect(ctx.oscillators[0].stoppedNow).toBe(true)
    expect(ctx.oscillators[1].stoppedNow).toBe(false)
  })

  it('lets only the latest request start when several wait on resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    engine.play([pitch(64)], 'piano', 'block')
    await flush()
    expect(ctx.oscillators).toHaveLength(1)
    expect(ctx.oscillators[0].frequency.value).toBeCloseTo(329.63, 1)
  })

  it('does not start a request that was stopped while waiting on resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    engine.stop()
    await flush()
    expect(ctx.oscillators).toHaveLength(0)
  })

  it('reports blocked instead of throwing when scheduling fails after a resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    ctx.failOscillators = true
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'piano', 'block')
    await flush()
    expect(engine.status()).toBe('blocked')
  })
})

describe('synth strum', () => {
  it('starts note i at i x 40 ms after the first, in list order', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([67, 60, 64].map(pitch), 'piano', 'strum')
    const starts = ctx.oscillators.map((o) => o.startedAt!)
    expect(starts[1] - starts[0]).toBeCloseTo(0.04, 10)
    expect(starts[2] - starts[0]).toBeCloseTo(0.08, 10)
    expect(ctx.oscillators[0].frequency.value).toBeGreaterThan(ctx.oscillators[1].frequency.value)
  })

  it('starts and stops the last of six notes 5 x 40 ms after the first', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([40, 45, 50, 55, 59, 64].map(pitch), 'piano', 'strum')
    const [first, , , , , last] = ctx.oscillators
    expect(last.startedAt! - first.startedAt!).toBeCloseTo(0.2, 10)
    expect(last.stoppedAt! - first.stoppedAt!).toBeCloseTo(0.2, 10)
    expect(last.stoppedAt! - last.startedAt!).toBeCloseTo(first.stoppedAt! - first.startedAt!, 10)
  })

  it('scales the peak gain of every note as a block of the same six notes does', () => {
    const peaks = (mode: 'block' | 'strum') => {
      const ctx = new FakeContext('running')
      const gains: FakeGain[] = []
      ctx.createGain = () => {
        const g = new FakeGain()
        gains.push(g)
        return g
      }
      createSynthEngine(asContext(ctx)).play([40, 45, 50, 55, 59, 64].map(pitch), 'piano', mode)
      return gains.map((g) => g.gain.linearRampToValueAtTime.mock.calls.map((c) => c[0]))
    }
    expect(peaks('strum')).toHaveLength(6)
    expect(peaks('strum')).toEqual(peaks('block'))
  })

  it('stops a sounding strum when a new one starts', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([60, 64].map(pitch), 'piano', 'strum')
    const first = [...ctx.oscillators]
    engine.play([60, 64].map(pitch), 'piano', 'strum')
    expect(first.every((o) => o.stoppedNow)).toBe(true)
    expect(ctx.oscillators).toHaveLength(4)
  })
})
