import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../../src/ui/App'

it('renders the accompa name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'accompa' })).toBeTruthy()
})
