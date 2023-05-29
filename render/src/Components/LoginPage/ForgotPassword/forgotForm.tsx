import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import classNames from 'classnames'
import { push } from 'connected-react-router'

import { RootAction } from '@store/rootReducer'
import api from '@api'
import * as alertActions from '@store/alerts/actions'
import { isEmailValid } from '@services/typesValidation'
import IconWrapper from '@components/IconWrapper'

const styles = require('./forgot-pass.module.scss')

interface IForgotFormState {
  email: string
  isEmailWithError: boolean
  isTouched: boolean
}

interface IForgotFormProps {
  routeToSignInPage: (path: string) => void
  showAlert: typeof alertActions.showAlertMessage.request
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      routeToSignInPage: push,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

class ForgotForm extends React.PureComponent<IForgotFormProps, IForgotFormState> {
  public state: IForgotFormState = {
    email: '',
    isEmailWithError: false,
    isTouched: false,
  }

  public componentDidMount = () => {
    document.addEventListener('keydown', this.handleKeyDown)
    const emailFromSignInPage = localStorage.getItem('userSignInEmail')
    if (emailFromSignInPage && !this.state.email) {
      this.setState({
        email: emailFromSignInPage,
      })
    }
  }

  public componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown)
    const emailFromSignInPage = localStorage.getItem('userSignInEmail')
    if (emailFromSignInPage) {
      localStorage.removeItem('userSignInEmail')
    }
  }

  public handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleSubmit(e)
    } else if (e.key === 'Escape') {
      this.props.routeToSignInPage('/login')
    }
  }

  public handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    this.setState({ email: e.target.value.trim(), isEmailWithError: false })
  }

  public handleTouchField = () => {
    this.setState({ isTouched: true })
  }

  public handleBlur = () => {
    this.setState({ isTouched: false })
  }

  public redirectToSignIn = () => {
    this.props.routeToSignInPage('/login')
  }

  public handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent) => {
    e.preventDefault()
    try {
      if (!this.state.email || !isEmailValid(this.state.email)) {
        this.setState({ isEmailWithError: true })
      } else {
        const { Result } = await api.user.ForgotPwdSendEmail({ Login: this.state.email })
        if (!Result) {
          this.props.showAlert({ alertType: 'error', alertMessage: 'Email is not exist' })
        } else {
          localStorage.setItem('userEmail', this.state.email)
          this.props.routeToSignInPage('/login')
          this.props.showAlert({ alertType: 'success', alertMessage: 'Email has been sent' })
        }
      }
    } catch (error) {
      this.props.showAlert({ alertType: 'error', alertMessage: error.message })
      console.error(error)
    }
  }

  public render() {
    return (
      <div className={styles.loginBody}>
        <div className={styles.infoBlock}>
          <form className={styles.loginInputBlock} onSubmit={e => e.preventDefault()}>
            <label className={styles.loginInputLabel} htmlFor="email">
              <span>Email</span>
            </label>
            <input
              value={this.state.email}
              type="text"
              className={classNames(styles.loginInputField, {
                [styles.inputWithError]: this.state.isEmailWithError,
              })}
              placeholder="Your email address"
              autoComplete="off"
              maxLength={76}
              onChange={this.handleChangeName}
              onFocus={this.handleTouchField}
              onBlur={this.handleBlur}
            />
            {this.state.isEmailWithError && (
              <div className={styles.errorIcon}>
                <IconWrapper name="error" classes={styles.icon} />
              </div>
            )}
            {this.state.isEmailWithError && this.state.isTouched && (
              <span className={styles.errorMessage}>Please enter a valid email</span>
            )}
            <span className={styles.recommendation}>
              Enter your email address above and we'll get you back on track.
            </span>
            <button onClick={this.handleSubmit}>Send Me Instructions</button>
          </form>
        </div>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(ForgotForm)
