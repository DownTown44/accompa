import { vi } from 'vitest'

export class FakeOscillator {
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

export class FakeGain {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect<T>(target: T): T {
    return target
  }
}

export class FakeContext {
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
  sources: FakeSource[] = []
  createBufferSource() {
    const source = new FakeSource()
    this.sources.push(source)
    return source
  }
  decodeAudioData(data: ArrayBuffer) {
    return Promise.resolve({ data } as unknown as AudioBuffer)
  }
  createOscillator() {
    if (this.failOscillators) throw new Error('no oscillator')
    const osc = new FakeOscillator()
    this.oscillators.push(osc)
    return osc
  }
  gains: FakeGain[] = []
  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }
  resume() {
    this.resumes++
    this.state = this.afterResume
    this.onstatechange?.()
    return Promise.resolve()
  }
}

export class FakeSource {
  buffer: unknown = null
  playbackRate = { value: 1 }
  startedAt: number | null = null
  stoppedNow = false
  onended: (() => void) | null = null
  connect<T>(target: T): T {
    return target
  }
  start(at: number) {
    this.startedAt = at
  }
  stop() {
    this.stoppedNow = true
  }
}

export const asContext = (ctx: FakeContext) => () => ctx as unknown as AudioContext
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
