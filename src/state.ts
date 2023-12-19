import { Observable, map, mergeWith, scan, startWith } from 'rxjs'
import { pricesDto$, resetPrices$ } from './service'

export const prices$: Observable<Record<string, number>> = pricesDto$.pipe(
  scan(
    (accum, current) => ({
      ...accum,
      [current.symbol]: current.price,
    }),
    {}
  ),
  mergeWith(resetPrices$.pipe(map(() => ({})))),
  startWith({})
)
