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

  it('should not error', () => {
    expect(error).not.toBeCalled()
  })
})
