const put = jest.fn(action => action)

const call = jest.fn()

const take = jest.fn()

const race = jest.fn()

const select = jest.fn()

const fork = jest.fn()

const cancel = jest.fn()

const delay = jest.fn()

const cancelled = jest.fn()

const resetMocks = () => {
  put.mockRestore()
  call.mockRestore()
  take.mockRestore()
  race.mockRestore()
  select.mockRestore()
  fork.mockRestore()
  cancel.mockRestore()
  delay.mockRestore()
  cancelled.mockRestore()
}

export { call, put, take, race, select, fork, cancel, delay, cancelled, resetMocks }
