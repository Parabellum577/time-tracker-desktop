import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { push } from 'connected-react-router'

import { RootAction } from '@store/rootReducer'
import LogoDF from '@components/LogoDF'
import IconWrapper from '@components/IconWrapper'
import ForgotForm from './forgotForm'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./forgot-pass.module.scss')

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      routeToSignInPage: push,
    },
    dispatch,
  )

interface IForgotPassProps {
  routeToSignInPage: (path: string) => void
}

class ForgotPass extends React.PureComponent<IForgotPassProps> {
  public componentDidMount = () => {
    setAnalyticsView('ForgotPassword')
  }

  public redirectToSignIn = () => {
    this.props.routeToSignInPage('/login')
  }

  public render() {
    return (
      <div className={styles.forgotPage}>
        <div className={styles.loginHeader}>
          <section className={styles.loginLogoBlock} onClick={this.redirectToSignIn}>
            {<LogoDF />}
          </section>
          <p className={styles.signInHint}>Forgot your password?</p>
        </div>
        <ForgotForm />
        <div className={styles.buttonsRow}>
          <NavLink to="/login" className={styles.returnLink}>
            <div className={styles.returnBlock}>
              <div className={styles.chevron}>
                <IconWrapper name="chevron_left" classes={styles.chevronIcon} />
              </div>
              <span>Back</span>
            </div>
          </NavLink>
        </div>
        <p className={styles.version}>Version {process.env.version}</p>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(ForgotPass)
