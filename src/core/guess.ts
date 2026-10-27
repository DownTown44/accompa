// A guess is an interval or a chord quality name.
// A guess is in play when it is in the pool or is the current answer.
export function inPlay<T>(guess: T, pool: readonly T[], answer: T): boolean {
  return pool.includes(guess) || guess === answer
}

// A guess counts when it is in play and has not been tried.
export function canGuess<T>(guess: T, pool: readonly T[], answer: T, tried: readonly T[]): boolean {
  return inPlay(guess, pool, answer) && !tried.includes(guess)
}
