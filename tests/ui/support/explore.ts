export const cell = (string: number, fret: number) => document.querySelector(`.fb-cell[data-string="${string}"][data-fret="${fret}"]`)!
export const roleOf = (n: number) => document.querySelector(`[data-lit="${n}"]`)?.getAttribute('data-role')
export const legend = () => [...document.querySelectorAll('.role-legend li')].map((n) => n.textContent)
export const readout = () => document.querySelector('.readout-interval')?.textContent
export const bigLabel = () => document.querySelector('.readout-interval span')!.textContent
export const alts = () => [...document.querySelectorAll('.reading-alt')] as HTMLButtonElement[]
