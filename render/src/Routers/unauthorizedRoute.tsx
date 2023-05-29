import * as React from 'react'
import { connect } from 'react-redux'
import { IRootState } from '@store/rootReducer'
import { Route, Redirect, RouteProps } from 'react-router-dom'

const mapStateToProps = (state: IRootState) => ({
  authorized: state.auth.authorized,
})

export interface IUnAuthorizedRouteProps extends RouteProps {
  authorized: boolean
  component: React.ComponentType<any>
}

export class UnAuthorizedRoute extends React.PureComponent<IUnAuthorizedRouteProps> {
  public render() {
    if (this.props.authorized) {
      return <Redirect to="/main" />
    } else {
      return <Route {...this.props} />
    }
  }
}

export default connect(mapStateToProps)(UnAuthorizedRoute)
