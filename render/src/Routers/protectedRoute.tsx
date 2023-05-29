import * as React from 'react'
import { connect } from 'react-redux'
import { IRootState } from '@store/rootReducer'
import { Route, Redirect, RouteProps } from 'react-router-dom'

const mapStateToProps = (state: IRootState) => ({
  authorized: state.auth.authorized,
})

export interface IProtectedRouteProps extends RouteProps {
  authorized: boolean
  component: React.ComponentType<any>
}

export class ProtectedRoute extends React.PureComponent<IProtectedRouteProps> {
  public render() {
    if (!this.props.authorized) {
      return <Redirect to="/login" />
    } else {
      return <Route {...this.props} />
    }
  }
}

export default connect(mapStateToProps)(ProtectedRoute)
