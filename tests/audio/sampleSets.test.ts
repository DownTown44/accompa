import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GUITAR_SET, nearestSample, PIANO_SET, sampleUrl } from '../../src/audio/sampleSets'
import { pitch } from '../../src/core/pitch'

describe('the piano set', () => {
  it('has a non-empty mp3 on disk for every bundled note and no other mp3', () => {
    const dir = join(__dirname, '../../public/samples/piano')
    const onDisk = readdirSync(dir).filter((f) => f.endsWith('.mp3')).sort()
    expect(onDisk).toEqual(PIANO_SET.notes.map((n) => `${n.name}.mp3`).sort())
    for (const file of onDisk) expect(statSync(join(dir, file)).size).toBeGreaterThan(0)
  })

  it('bundles the 21 notes from C2 to C7', () => {
    expect(PIANO_SET.notes.map((n) => n.name)).toEqual(
      'C2 Ds2 Fs2 A2 C3 Ds3 Fs3 A3 C4 Ds4 Fs4 A4 C5 Ds5 Fs5 A5 C6 Ds6 Fs6 A6 C7'.split(' '),
    )
    expect(PIANO_SET.notes.map((n) => n.midi)).toEqual(Array.from({ length: 21 }, (_, i) => 36 + 3 * i))
  })

  it.each([
    [60, 'C4', 0],
    [61, 'C4', 1],
    [59, 'C4', -1],
    [36, 'C2', 0],
    [96, 'C7', 0],
    [30, 'C2', 0],
    [100, 'C7', 0],
    [62, 'Ds4', -1],
    [63, 'Ds4', 0],
  ])('plays MIDI %i from %s shifted by %i semitones', (midi, name, semitones) => {
    const found = nearestSample(pitch(midi))
    expect(found.name).toBe(name)
    expect(found.rate).toBeCloseTo(2 ** (semitones / 12), 12)
  })

  it('is never more than one semitone from a bundled note', () => {
    for (let midi = 36; midi <= 96; midi++) {
      const { rate } = nearestSample(pitch(midi))
      expect(Math.abs(Math.log2(rate) * 12)).toBeLessThanOrEqual(1 + 1e-9)
    }
  })

  it('builds same-origin URLs under the base path', () => {
    const url = sampleUrl(PIANO_SET, 'C4')
    expect(url).toBe(`${import.meta.env.BASE_URL}samples/piano/C4.mp3`)
    expect(url.startsWith('/')).toBe(true)
    expect(url.startsWith('//')).toBe(false)
  })
})

describe('the guitar set', () => {
  it('has a non-empty flac on disk for every bundled note and no other file', () => {
    const dir = join(__dirname, '../../public/samples/guitar')
    const onDisk = readdirSync(dir).filter((f) => f.endsWith('.flac')).sort()
    expect(onDisk).toEqual(GUITAR_SET.notes.map((n) => `${n.name}.flac`).sort())
    for (const file of onDisk) expect(statSync(join(dir, file)).size).toBeGreaterThan(0)
  })

  it('bundles the 18 notes', () => {
    expect(GUITAR_SET.notes.map((n) => n.name)).toEqual(
      'F2 G2 A2 B2 D3 F3 Gs3 B3 D4 F4 G4 As4 C5 Ds5 Fs5 Gs5 B5 C6'.split(' '),
    )
    expect(GUITAR_SET.notes.map((n) => n.midi)).toEqual([41, 43, 45, 47, 50, 53, 56, 59, 62, 65, 67, 70, 72, 75, 78, 80, 83, 84])
    expect(GUITAR_SET.extension).toBe('flac')
    expect(PIANO_SET.extension).toBe('mp3')
  })

  it.each([
    [53, 'F3', 0],
    [52, 'F3', -1],
    [54, 'F3', 1],
    [42, 'F2', 1],
    [44, 'G2', 1],
    [46, 'A2', 1],
    [79, 'Fs5', 1],
    [40, 'F2', -1],
    [85, 'C6', 1],
    [86, 'C6', 2],
    [30, 'F2', -1],
    [100, 'C6', 2],
  ])('plays guitar MIDI %i from %s shifted by %i semitones', (midi, name, semitones) => {
    const found = nearestSample(pitch(midi), GUITAR_SET)
    expect(found.name).toBe(name)
    expect(found.rate).toBeCloseTo(2 ** (semitones / 12), 12)
  })

  it('builds flac URLs under the base path', () => {
    expect(sampleUrl(GUITAR_SET, 'Gs3')).toBe(`${import.meta.env.BASE_URL}samples/guitar/Gs3.flac`)
  })
})
