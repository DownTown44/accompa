import type { MouseEvent } from 'react'

// A pointer click hands focus back to the page so shortcuts keep working; keyboard activation keeps it.
export function releaseFocusAfterPointer(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) event.currentTarget.blur()
}
