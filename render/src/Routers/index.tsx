import * as React from 'react'
import * as _ from 'lodash'
import { Redirect, Router, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { ipcRenderer } from 'electron'
import { push } from 'connected-react-router'

import LoginPage from '../Components/LoginPage'
import history from '@store/history'
import Main from '../Components/Main'
import ProtectedRoute from './protectedRoute'
import UnauthorizedRoute from './unauthorizedRoute'
import Alert from '@components/Alert'
import { RootAction, IRootState } from '@store/rootReducer'
import { otsLogin } from '@store/auth/actions'
import * as planningsActions from '@store/plannings/actions'
import { isSameTask } from '@services/helpers'

const style = require('./styles.module.scss')

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      loginByOTS: otsLogin.request,
      startColdPlanning: planningsActions.startColdPlanning.request,
      routePush: push,
    },
    dispatch,
  )

const mapStateToProps = (state: IRootState) => ({
  authorized: state.auth.authorized,
  location: state.router.location.pathname,
})

type IRoutersProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

interface ITaskContext {
  TrackerID: number
  ProjectID: string
  IssueID: string
  TrackerType: string
  clearContext: VoidFunction
  setTrackerType: (trackerType: string) => void
}

const defaultTaskContext = {
  TrackerID: -1,
  ProjectID: '',
  IssueID: '',
  TrackerType: '',
  clearContext: () => {},
  setTrackerType: (trackerType: string) => {},
}

export const MainContext = React.createContext<ITaskContext>(defaultTaskContext)

class Routers extends React.PureComponent<IRoutersProps, ITaskContext> {
  public state = { ...defaultTaskContext }

  public setTrackerType = (trackerType: string) => {
    this.setState({ ...defaultTaskContext, TrackerType: trackerType })
  }

  public clearContext = () => {
    this.setState({ ...defaultTaskContext, clearContext: this.clearContext })
  }

  public componentDidMount = () => {
    ipcRenderer.on('ots-login', (event: any, ots: string) => {
      this.props.loginByOTS({ OTS: ots })
    })

    ipcRenderer.send('app-ready')
  }

  public render() {
    return (
      <Router history={history}>
        <section className={style.container}>
          <MainContext.Provider
            value={{ ...this.state, clearContext: this.clearContext, setTrackerType: this.setTrackerType }}
          >
            <Switch>
              <Redirect exact={true} from="/" to="/login" />
              <UnauthorizedRoute path="/login" component={LoginPage} />
              <ProtectedRoute path="/main" component={Main} />
            </Switch>
            <Alert />
            <div id="portal-container" />
          </MainContext.Provider>
        </section>
      </Router>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Routers)
