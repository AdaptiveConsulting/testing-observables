import { Observable, Subject, of } from 'rxjs'
import { Price } from './model'

// mock implementation; in a real world application this would be
// associated with a WebSocket stream and would emit when a message
// is received over the WebSocket.
export const pricesDto$: Observable<Price> = of({
  symbol: 'LMT',
  price: 447.01,
})

// when this emits, the price lookup table should be reset
// to an empty object
export const resetPrices$ = new Subject<void>()
