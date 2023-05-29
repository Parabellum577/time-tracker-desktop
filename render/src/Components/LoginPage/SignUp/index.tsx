import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { NavLink } from 'react-router-dom'
import { push } from 'connected-react-router'

import { RootAction } from '@store/rootReducer'
import LogoDF from '@components/LogoDF'
import * as authActions from '@store/auth/actions'
import SignUpForm from './signUpForm'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./sign-up.module.scss')

interface ISignUpProps {
  login: typeof authActions.loginUser.request
  routeToSignInPage: (path: string) => void
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      routeToSignInPage: push,
    },
    dispatch,
  )

class SignUp extends React.PureComponent<ISignUpProps> {
  public componentDidMount = () => {
    setAnalyticsView('SignUp')
  }

  public redirectToSignIn = () => {
    this.props.routeToSignInPage('/login')
  }

  public render() {
    return (
      <div className={styles.loginMainBlock}>
        <header className={styles.loginHeader}>
          <section className={styles.loginLogoBlock} onClick={this.redirectToSignIn}>
            <LogoDF />
          </section>
          <p className={styles.signUpHint}>Create New Account</p>
        </header>
        <div className={styles.content}>
          <SignUpForm />
          <NavLink className={styles.newAccount} to="/login/signIn">
            <p>Already have an account? Sign In</p>
          </NavLink>
          <p className={styles.version}>Version {process.env.version}</p>
        </div>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(SignUp)
