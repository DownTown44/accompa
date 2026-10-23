import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'

it('renders the accompa name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'accompa' })).toBeTruthy()
})

it('does not leak DOM between renders', () => {
  render(<App />)
  expect(screen.getAllByRole('heading', { name: 'accompa' })).toHaveLength(1)
})
