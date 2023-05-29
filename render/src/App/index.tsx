import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { remote } from 'electron'

import api from '@services/api'
import store from '@store/render'
import Routers from '../Routers'
import history from '@store/history'
import analyticsInit from '@services/analytics'

import '../index.scss'

// if (process.env.STAGE === 'development') {
//   const APP_ID = '1d6e39ff-a304-4c88-b433-8c0324c22644'
//   try {
//     analyticsInit(APP_ID, remote.app.getVersion())
//   } catch (error) {
//     console.error('analyticsInit error', error)
//   }
// }

class App extends React.PureComponent {
  public componentDidMount() {
    if (process.env.STAGE !== 'production') {
      const windowExtended: any = window
      windowExtended.api = api
    }
  }

  public componentDidCatch() {
    // if (process.env.STAGE !== 'local') {
    //   const { app } = __non_webpack_require__('electron').remote
    //   app.relaunch()
    //   app.exit()
    // }
  }

  public render = () => {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Routers />
        </ConnectedRouter>
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

export default {}
