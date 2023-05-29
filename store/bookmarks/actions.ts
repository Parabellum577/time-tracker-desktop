import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IFullIssue } from '@types'

export const getBookmarks = createAsyncAction(
  'bookmarks/GET_BOOKMARKS_REQUEST',
  'bookmarks/GET_BOOKMARKS_SUCCESS',
  'bookmarks/GET_BOOKMARKS_FAILURE',
)<void, IFullIssue[], IError>()

export const handleBookmark = createAsyncAction(
  'bookmarks/HANDLE_BOOKMARK_REQUEST',
  'bookmarks/HANDLE_BOOKMARK_SUCCESS',
  'bookmarks/HANDLE_BOOKMARK_FAILURE',
)<IFullIssue, IFullIssue, IError>()

export const clearBookmarks = createAction('plannings/CLEAR_BOOKMARKS', action => () => action())
