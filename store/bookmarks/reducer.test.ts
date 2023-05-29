import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IBookmarks } from './types'
import bookmarks from './reducer'
import { SIMPLE_ISSUE } from '@test-helpers/sample'

describe('[Store] Bookmarks Reducer', () => {
  it('[Success] [Snapshot] Should handle getBookmarks', () => {
    const getBookmarksAction: ActionType<typeof actions> = {
      type: getType(actions.getBookmarks.success),
      payload: [{ ...SIMPLE_ISSUE }, { ...SIMPLE_ISSUE }],
    }

    const currentState: IBookmarks = {
      extendedBookmarks: [{ ...SIMPLE_ISSUE }, { ...SIMPLE_ISSUE }],
    }

    expect(bookmarks(currentState, getBookmarksAction)).toMatchSnapshot()
  })

  it('[Failure] Should handle getBookmarks', () => {
    const getBookmarksAction: ActionType<typeof actions> = {
      type: getType(actions.getBookmarks.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IBookmarks = {
      extendedBookmarks: [],
    }

    expect(bookmarks(currentState, getBookmarksAction)).toMatchSnapshot()
  })
})
