import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { pitch } from '../../../../src/core/pitch'
import { PianoKeyboard } from '../../../../src/ui/instruments/piano/PianoKeyboard'

const key = (container: HTMLElement, midi: number) => container.querySelector(`[data-pitch="${midi}"]`) as SVGRectElement
const labels = (container: HTMLElement) => [...container.querySelectorAll('.octave-label')].map((t) => t.textContent)

describe('PianoKeyboard', () => {
  it('draws 21 white and 15 black keys labelled C3 C4 C5', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[]} />)
    expect(container.querySelectorAll('.key-white')).toHaveLength(21)
    expect(container.querySelectorAll('.key-black')).toHaveLength(15)
    expect(labels(container)).toEqual(['C3', 'C4', 'C5'])
  })

  it('relabels when the window moves', () => {
    const { container } = render(<PianoKeyboard start={60} lit={[]} />)
    expect(labels(container)).toEqual(['C4', 'C5', 'C6'])
  })

  it('draws black keys after white keys and matches the mockup geometry', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[]} />)
    const rects = [...container.querySelectorAll('rect')]
    expect(rects.findIndex((r) => r.classList.contains('key-black'))).toBe(21)
    expect(key(container, 48).getAttribute('x')).toBe('1')
    expect(key(container, 49).getAttribute('x')).toBe('40')
    expect(key(container, 49).getAttribute('width')).toBe('36')
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 1199 330')
  })

  it('reports press and release with the key pitch', () => {
    const calls: string[] = []
    const { container } = render(
      <PianoKeyboard start={48} lit={[]} onNotePress={(p) => calls.push(`down ${p}`)} onNoteRelease={(p) => calls.push(`up ${p}`)} />,
    )
    fireEvent.pointerDown(key(container, 49))
    fireEvent.pointerUp(key(container, 49))
    fireEvent.pointerDown(key(container, 50))
    fireEvent.pointerCancel(key(container, 50))
    expect(calls).toEqual(['down 49', 'up 49', 'down 50', 'up 50'])
  })

  it('does nothing without handlers', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[]} />)
    fireEvent.pointerDown(key(container, 48))
    fireEvent.pointerUp(key(container, 48))
  })

  it('shows a dot on each lit key in the window and ignores others', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[48, 49, 100, 20].map(pitch)} />)
    const dots = [...container.querySelectorAll('[data-lit]')].map((d) => d.getAttribute('data-lit'))
    expect(dots).toEqual(['48', '49'])
    expect(container.querySelectorAll('.lit-dot-black')).toHaveLength(1)
  })

  it('is one focus stop', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[]} onNotePress={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Piano keyboard' }).getAttribute('tabindex')).toBe('0')
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(1)
  })

  it('ignores non-primary buttons', () => {
    const onNotePress = vi.fn()
    const onNoteRelease = vi.fn()
    const { container } = render(<PianoKeyboard start={48} lit={[]} onNotePress={onNotePress} onNoteRelease={onNoteRelease} />)
    fireEvent.pointerDown(key(container, 48), { button: 2 })
    fireEvent.pointerDown(key(container, 48), { button: 1 })
    fireEvent.pointerUp(key(container, 48))
    expect(onNotePress).not.toHaveBeenCalled()
    expect(onNoteRelease).not.toHaveBeenCalled()
  })

  it('releases only the pressed key', () => {
    const onNoteRelease = vi.fn()
    const { container } = render(<PianoKeyboard start={48} lit={[]} onNoteRelease={onNoteRelease} />)
    fireEvent.pointerUp(key(container, 48))
    fireEvent.pointerDown(key(container, 48))
    fireEvent.pointerUp(key(container, 50))
    expect(onNoteRelease).not.toHaveBeenCalled()
  })
})

describe('root marker', () => {
  it('rings only the root key', () => {
    const { container } = render(<PianoKeyboard start={48} lit={[pitch(60), pitch(67)]} root={pitch(60)} />)
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(2)
    expect(container.querySelectorAll('.root-ring')).toHaveLength(1)
    expect(container.querySelector('[data-root]')!.getAttribute('data-lit')).toBe('60')
  })
})
