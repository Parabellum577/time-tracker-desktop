import { call, take, race, put, select } from 'redux-saga/effects'
import { SagaIterator } from 'redux-saga'
import { getType } from 'typesafe-actions'

import * as loginActions from '../auth/actions'
import * as alertActions from '../alerts/actions'
import * as actions from './actions'
import api from '@api'
import { IBasicIssue, IFullIssue } from '@types'
import extendIssues from '@services/extendIssues'
import { IRootState } from '@store/rootReducer'

export function* getBookmarksSaga(): SagaIterator {
  while (true) {
    yield race({
      getBookmarksAction: take(getType(actions.getBookmarks.request)),
      loginUserAction: take(getType(loginActions.loginUser.success)),
    })
    try {
      const basicBookmarks: IBasicIssue[] = yield call(api.tracker.GetBookmarks)
      const bookmarks = yield call(extendIssues, basicBookmarks)
      yield put(actions.getBookmarks.success(bookmarks))
    } catch (error) {
      console.error(error)
    }
  }
}

export const bookmarksArrayFromStore = (state: IRootState) => state.bookmarks.extendedBookmarks

export function* handleBookmarkSaga(): SagaIterator {
  while (true) {
    const { payload } = yield take(getType(actions.handleBookmark.request))
    try {
      const bookmarks: IFullIssue[] = yield select(bookmarksArrayFromStore)
      const isRemove = bookmarks.some(bookmark => bookmark.ID === payload.ID)
      const bookmarkPayload = {
        TrackerID: payload.TrackerID,
        ProjectID: payload.ProjectID,
        IssueID: payload.ID,
      }
      yield put(actions.handleBookmark.success(payload))
      if (isRemove) {
        yield call(api.tracker.RemoveBookmark, bookmarkPayload)
        yield put(
          alertActions.showAlertMessage.request({
            alertType: 'success',
            alertMessage: 'Removed from Favorites',
          }),
        )
      } else {
        yield call(api.tracker.CreateBookmark, bookmarkPayload)
        yield put(
          alertActions.showAlertMessage.request({
            alertType: 'success',
            alertMessage: 'Added to Favorites',
          }),
        )
      }
    } catch (error) {
      console.error('handleBookmarkSaga: ', error)
    }
  }
}
