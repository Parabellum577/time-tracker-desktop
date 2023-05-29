import { take, resetMocks, call, put } from '@test-helpers/effects.mock'
import { clearAlertsSaga, handleShowAlerts } from './sagas'
import * as actions from './actions'
import { SIMPLE_ALERT } from '@test-helpers/sample'

describe('[Store] Alert Sagas', () => {
  beforeEach(() => {
    resetMocks()
  })

  // it('[Success] Should handle showAlertMessage Request', () => {
  //   const newAlert = SIMPLE_ALERT
  //   const currentState = {
  //     alertsArray: [{ ...SIMPLE_ALERT }]
  //   }
  //   const generator = showAlertsSaga()
  //   generator.next()
  //   expect(take).toBeCalledTimes(1)
  //   expect(take).toBeCalledWith(actions.showAlertMessage.request(newAlert).type)
  //   generator.next([])
  //   expect(select).toBeCalledTimes(1)
  //   generator.next()
  //   expect(call).toBeCalledTimes(1)
  //   expect(call).toBeCalledWith(actions.showAlertMessage.success(newAlert))
  // })

  it('[Success] Should emit handleShowAlerts', () => {
    const newAlert = { ...SIMPLE_ALERT }
    const generator = handleShowAlerts(actions.showAlertMessage.request(newAlert).payload)
    generator.next()
    expect(put).toBeCalledTimes(1)
    expect(put).toBeCalledWith(actions.showAlertMessage.success(newAlert))
    expect(generator.next().done).toBe(true)
  })

  it('[Failed] Should emit handleShowAlerts', () => {
    const newAlert = { ...SIMPLE_ALERT }
    call.mockImplementation(() => {
      throw {
        code: 100,
        message: 'SOME_ERROR',
      }
    })
    put.mockImplementation(action => action)
    const generator = handleShowAlerts(actions.showAlertMessage.request(newAlert).payload)
    expect(generator.next()).toMatchSnapshot()
    expect(generator.next().done).toBe(true)
  })

  it('[Success] Should handle clearAlertMessage Request', () => {
    const generator = clearAlertsSaga()
    generator.next()
    expect(take).toBeCalledTimes(1)
    expect(take).toBeCalledWith(actions.clearAlertMessage.request().type)
    generator.next()
    expect(call).toBeCalledTimes(1)
  })
})
