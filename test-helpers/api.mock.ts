const api: any = {
  planning: {},
  project: {},
  tracker: {},
  user: {}
}

export const setResponse = (service: string, method: string, callback: any) => {
  api[service][method] = callback
}

export default api

/**
 * Example of using
 * const callback = jest.fn()
 * setResponse('planning', 'GetOpenPlannings', callback)
 * api.planning.GetOpenPlannings()
 * api.planning.GetOpenPlannings()
 * expect(callback).toBeCalledTimes(2)
 */
