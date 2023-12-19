import { Subject } from 'rxjs'
import { Price } from './model'
import { spyOnObservable } from './spyOnObservable'

// create subjects to mock out the source observables that our
// observable under test depends on
const mockPricesDto$ = new Subject<Price>()
const mockResetPrices$ = new Subject<void>()

// use doMock() rather than mock() so we can reference the
// variables containing the mock observables. mock() is hoisted
// so it does not allow referencing variables in the file scope.
// see https://vitest.dev/api/vi#vi-mock and
// https://vitest.dev/api/vi#vi-domock
vi.doMock('./service', () => ({
  pricesDto$: mockPricesDto$,
  resetPrices$: mockResetPrices$,
}))

// we need to dynamically import the observable under test
// after we call vi.doMock. see https://vitest.dev/api/vi#vi-domock
const { prices$ } = await import('./state')

describe('prices$', () => {
  // spy on the observable under test, using the spyOnObservable utility
  const { latestEmission, error, subscription } = spyOnObservable(prices$)

  // ensure we unsubscribe when we are done to avoid memory leaks
  afterAll(() => {
    subscription.unsubscribe()
  })

  it('should initially emit empty object', () => {
    expect(latestEmission()).toEqual({})
  })

  it('should emit object containing latest prices after pricesDto$ emits', () => {
    // call next() on the subject that mocks out the source observable
    // priceDto$ that the observable under test depends on, to simulate
    // that observable emitting prices, and ensure the new price is
    // emitted as expected in the observable under test
    mockPricesDto$.next({ symbol: 'XOM', price: 48.17 })
    expect(latestEmission()).toEqual({ XOM: 48.17 })

    // add another instrument/price, ensure both instruments
    // appear in the resulting emission
    mockPricesDto$.next({ symbol: 'BA', price: 218.93 })
    expect(latestEmission()).toEqual({ XOM: 48.17, BA: 218.93 })

    // update the price of the first instrument, ensure the price is
    // updated in the resulting emission
    mockPricesDto$.next({ symbol: 'XOM', price: 48.21 })
    expect(latestEmission()).toEqual({ XOM: 48.21, BA: 218.93 })
  })

  it('should emit empty object after resetPrices$ emits', () => {
    // call next() on the subject that mocks out the source observable
    // resetPrices$ that the observable under test depends on, to simulate
    // that observable emitting, and ensure that the prices lookup table
    // is reset to an empty object
    mockResetPrices$.next()
    expect(latestEmission()).toEqual({})
  })

  it('should not error', () => {
    expect(error).not.toBeCalled()
  })
})
