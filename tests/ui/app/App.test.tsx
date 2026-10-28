import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { press } from '../support/keys'

it('renders the accompa name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'accompa' })).toBeTruthy()
})

it('does not leak DOM between renders', () => {
  render(<App />)
  expect(screen.getAllByRole('heading', { name: 'accompa' })).toHaveLength(1)
})

it('prepares the active instrument at startup and the other one on a swap', () => {
  const engine = createFakeEngine()
  render(<App engine={engine} />)
  expect(engine.prepares).toEqual(['piano'])
  press('i')
  expect(engine.prepares).toEqual(['piano', 'guitar'])
  press('i')
  expect(engine.prepares).toEqual(['piano', 'guitar', 'piano'])
})
