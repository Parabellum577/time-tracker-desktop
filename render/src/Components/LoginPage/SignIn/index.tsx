import * as React from 'react'
import { NavLink } from 'react-router-dom'

import LogoDF from '@components/LogoDF'
import LoginButtons from '../LoginButtons'
import SignInForm from './signInForm'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./sign-in.module.scss')

interface ISignInProps {
  errorMessage: string
}

class SignIn extends React.PureComponent<ISignInProps> {
  public componentDidMount = () => {
    setAnalyticsView('SignIn')
  }

  public render() {
    return (
      <div className={styles.loginMainBlock}>
        <header className={styles.loginHeader}>
          <section className={styles.loginLogoBlock}>
            <LogoDF />
          </section>
          <p className={styles.signInHint}>Sign In</p>
        </header>
        <div className={styles.content}>
          <SignInForm />
          <LoginButtons />
          <NavLink className={styles.newAccount} to="/login/signUp">
            Create New Account
          </NavLink>
          <p className={styles.version}>Version {process.env.version}</p>
        </div>
      </div>
    )
  }
}

export default SignIn
