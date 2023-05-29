import { take, resetMocks, call, put } from '@test-helpers/effects.mock'
import { getBookmarksSaga } from './sagas'
import * as actions from './actions'
import * as loginActions from '../auth/actions'
import { SIMPLE_ISSUE } from '@test-helpers/sample'
import { setResponse } from '@test-helpers/api.mock'
import extendIssues from '@services/extendIssues'

describe('[Store] Bookmarks Sagas', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('[Success] Should handle getBookmarks Request', () => {
    const bookmarksArray = [
      {
        ...SIMPLE_ISSUE,
        ID: '1',
      },
      {
        ...SIMPLE_ISSUE,
        ID: '2',
      },
    ]
    const callback = jest.fn(() => bookmarksArray)
    setResponse('tracker', 'GetBookmarks', callback)
    const generator = getBookmarksSaga()
    generator.next()
    expect(take).toBeCalledTimes(2)
    expect(take).toBeCalledWith(actions.getBookmarks.request().type)
    expect(take).toBeCalledWith(loginActions.loginUser.success().type)
    generator.next()
    expect(call).toBeCalledTimes(1)
    expect(call).toBeCalledWith(callback)
    generator.next(callback)
    generator.next()
    expect(call).toBeCalledTimes(2)
    expect(call).toBeCalledWith(extendIssues, callback)
    generator.next()
    expect(put).toBeCalledTimes(1)
  })
})
