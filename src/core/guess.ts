import type { Interval } from './pitch'

// An interval is in play when it is in the pool or is the current answer.
export function inPlay(interval: Interval, pool: readonly Interval[], answer: Interval): boolean {
  return pool.includes(interval) || interval === answer
}

// A guess counts when the interval is in play and has not been tried.
export function canGuess(guess: Interval, pool: readonly Interval[], answer: Interval, tried: readonly Interval[]): boolean {
  return inPlay(guess, pool, answer) && !tried.includes(guess)
}
