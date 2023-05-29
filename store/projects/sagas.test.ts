import { take, resetMocks } from '@test-helpers/effects.mock'
import * as actions from './actions'
import { setResponse } from '@test-helpers/api.mock'
import { getProjectsSettingsSaga } from './sagas'

describe('[Store] Projects Sagas', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('[Success] Should handle getProjectSettings Request', () => {
    const projectSettings = {
      project: 'project',
      settings: [
        {
          Key: 'key1',
          Value: 'value1',
        },
      ],
    }
    const callback = jest.fn(() => ({ key: 'key', value: 'value' }))
    setResponse('project', 'GetSettings', callback)
    const generator = getProjectsSettingsSaga()
    generator.next()
    expect(take).toBeCalledTimes(1)
    expect(take).toBeCalledWith('user/GET_PROJECT_SETTINGS_REQUEST')
    generator.next(actions.getProjectSettings.success(projectSettings))
    // expect(select).toBeCalledTimes(1)
    // generator.next(projectSettings)
    // expect(call).toBeCalledTimes(1)
    // expect(put).toBeCalledTimes(2)
    // expect(select).toBeCalledWith(getProjectFunction)
    // expect(select).toBeCalledWith([
    //   {...projectSettings, project: 'project1'},
    //   {...projectSettings, project: 'project2'}
    // ])
  })
})
