import { forwardToMain, getInitialStateRenderer, replayActionRenderer } from 'electron-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { routerMiddleware } from 'connected-react-router'

import rootReducer from './rootReducer'
import history from './history'

export function* rootSaga() {
  yield all([])
}

const initialState = getInitialStateRenderer()

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(forwardToMain, routerMiddleware(history), sagaMiddleware)),
)

replayActionRenderer(store)

sagaMiddleware.run(rootSaga)

export default store
