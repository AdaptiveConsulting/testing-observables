import { Observable, Subscription } from 'rxjs'
import { Mock } from 'vitest'

/**
 * Utility function for testing observables.
 * Returns an object containing mock observer functions.
 *
 * To ensure your test does not cause a memory leak, assert that `complete`
 * has been called; this will verify that this utility has unsubscribed
 * from the observable under test. Alternatively, explicitly unsubscribe
 * the subscription that is returned.
 *
 * Example usage:
 *
 *    const { next, error, complete, subscription, latestEmission, emissionCount } =
 *      spyOnObservable(observableToTest$.pipe(take(1)))
 *
 *    expect(next).toHaveBeenCalledTimes(1)
 *    expect(next).toHaveBeenCalledWith(someValue)
 *    expect(latestEmission()).toBe(someValue)
 *    expect(error).not.toHaveBeenCalled()
 *    subscription.unsubscribe()
 *    expect(complete).toHaveBeenCalled()
 */
export function spyOnObservable(observable$: Observable<unknown>) {
  const next: Mock<any, any> = vi.fn()
  const error: Mock<any, any> = vi.fn()
  const complete: Mock<any, any> = vi.fn()
  const emissionCount = () => next.mock.calls.length
  const latestEmission = () => {
    try {
      return next.mock.calls.at(-1)![0]
    } catch (e) {
      throw new Error('expected next to have been called')
    }
  }

  let subscription: Subscription

  subscription = observable$.subscribe({
    next,
    error,
    complete: () => {
      subscription?.unsubscribe()
      complete()
    },
  })

  return { next, error, complete, subscription, latestEmission, emissionCount }
}
