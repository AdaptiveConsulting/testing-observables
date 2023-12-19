import { Observable, mergeWith, scan, startWith } from 'rxjs'
import { pricesDto$, resetPrices$ } from './service'
import { Price } from './model'

export const prices$: Observable<Record<string, number>> = pricesDto$.pipe(
  mergeWith(resetPrices$),
  scan(
    (accum, current: Price | void) =>
      !current
        ? {}
        : {
            ...accum,
            [current.symbol]: current.price,
          },
    {}
  ),
  startWith({})
)
