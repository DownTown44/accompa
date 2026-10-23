import { describe, expect, it, vi } from 'vitest'
import { createSynthEngine } from '../../src/audio/synth'
import { pitch } from '../../src/core/pitch'

class FakeOscillator {
  type = ''
  frequency = { value: 0 }
  startedAt: number | null = null
  stoppedAt: number | null = null
  stoppedNow = false
  onended: (() => void) | null = null
  connect<T>(target: T): T {
    return target
  }
  start(at: number) {
    this.startedAt = at
  }
  stop(at?: number) {
    if (at === undefined) this.stoppedNow = true
    else this.stoppedAt = at
  }
}

class FakeGain {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect<T>(target: T): T {
    return target
  }
}

class FakeContext {
  state: 'running' | 'suspended'
  currentTime = 1
  destination = {}
  onstatechange: (() => void) | null = null
  oscillators: FakeOscillator[] = []
  resumes = 0
  failOscillators = false
  constructor(
    initial: 'running' | 'suspended',
    private afterResume: 'running' | 'suspended' = 'running',
  ) {
    this.state = initial
  }
  createOscillator() {
    if (this.failOscillators) throw new Error('no oscillator')
    const osc = new FakeOscillator()
    this.oscillators.push(osc)
    return osc
  }
  createGain() {
    return new FakeGain()
  }
  resume() {
    this.resumes++
    this.state = this.afterResume
    this.onstatechange?.()
    return Promise.resolve()
  }
}

const asContext = (ctx: FakeContext) => () => ctx as unknown as AudioContext
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

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
    engine.play([pitch(60), pitch(67)], 'arpeggio')
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
    createSynthEngine(asContext(ctx)).play([pitch(67), pitch(60)], 'arpeggio')
    const [first, second] = ctx.oscillators
    expect(first.frequency.value).toBeGreaterThan(second.frequency.value)
    expect(second.startedAt!).toBeGreaterThan(first.startedAt!)
  })

  it('starts every note of a block together', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([pitch(60), pitch(64), pitch(67)], 'block')
    expect(new Set(ctx.oscillators.map((o) => o.startedAt)).size).toBe(1)
    expect(ctx.oscillators).toHaveLength(3)
  })

  it('tunes A4 to 440 Hz', () => {
    const ctx = new FakeContext('running')
    createSynthEngine(asContext(ctx)).play([pitch(69)], 'block')
    expect(ctx.oscillators[0].frequency.value).toBeCloseTo(440, 5)
  })

  it('replays the same list identically', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60), pitch(64)], 'arpeggio')
    engine.play([pitch(60), pitch(64)], 'arpeggio')
    const [a1, a2, b1, b2] = ctx.oscillators
    expect([b1.frequency.value, b2.frequency.value]).toEqual([a1.frequency.value, a2.frequency.value])
    expect(b2.startedAt! - b1.startedAt!).toBeCloseTo(a2.startedAt! - a1.startedAt!, 10)
  })

  it('resumes a suspended context in the gesture and then plays', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
    expect(ctx.resumes).toBe(1)
    await flush()
    expect(ctx.oscillators).toHaveLength(1)
    expect(engine.status()).toBe('running')
  })

  it('reports blocked when the context stays suspended, and plays nothing', async () => {
    const ctx = new FakeContext('suspended', 'suspended')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
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
    engine.play([pitch(60)], 'block')
    expect(listener).not.toHaveBeenCalled()
  })

  it('never throws when audio is unavailable, and reports blocked', () => {
    const engine = createSynthEngine(() => {
      throw new Error('no audio')
    })
    expect(() => engine.play([pitch(60)], 'block')).not.toThrow()
    expect(() => engine.unlock()).not.toThrow()
    expect(engine.status()).toBe('blocked')
  })

  it('stops sounding notes', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60), pitch(64)], 'block')
    engine.stop()
    expect(ctx.oscillators.every((o) => o.stoppedNow)).toBe(true)
  })

  it('cuts the previous notes when a new list starts', () => {
    const ctx = new FakeContext('running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
    engine.play([pitch(62)], 'block')
    expect(ctx.oscillators[0].stoppedNow).toBe(true)
    expect(ctx.oscillators[1].stoppedNow).toBe(false)
  })

  it('lets only the latest request start when several wait on resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
    engine.play([pitch(64)], 'block')
    await flush()
    expect(ctx.oscillators).toHaveLength(1)
    expect(ctx.oscillators[0].frequency.value).toBeCloseTo(329.63, 1)
  })

  it('does not start a request that was stopped while waiting on resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
    engine.stop()
    await flush()
    expect(ctx.oscillators).toHaveLength(0)
  })

  it('reports blocked instead of throwing when scheduling fails after a resume', async () => {
    const ctx = new FakeContext('suspended', 'running')
    ctx.failOscillators = true
    const engine = createSynthEngine(asContext(ctx))
    engine.play([pitch(60)], 'block')
    await flush()
    expect(engine.status()).toBe('blocked')
  })
})
