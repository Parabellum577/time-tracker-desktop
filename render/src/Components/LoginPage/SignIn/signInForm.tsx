import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'

import { isEmailValid } from '@services/typesValidation'
import IconWrapper from '@components/IconWrapper'
import * as authActions from '@store/auth/actions'
import * as alertActions from '@store/alerts/actions'
import { RootAction, IRootState } from '@store/rootReducer'

const styles = require('./sign-in-form.module.scss')

const mapStateToProps = (state: IRootState) => ({
  auth: state.auth,
  isOnline: state.internetConnection.isOnline,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      login: authActions.loginUser.request,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

interface ISignInFormState {
  email: string
  errorEmail: string
  errorPassword: string
  isPasswordVisible: boolean
  isTouchedEmail: boolean
  isTouchedPassword: boolean
  password: string
}

type IConnectProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

class SignInForm extends React.PureComponent<IConnectProps, ISignInFormState> {
  public initialState: ISignInFormState = {
    email: '',
    errorEmail: '',
    errorPassword: '',
    isPasswordVisible: false,
    isTouchedEmail: false,
    isTouchedPassword: false,
    password: '',
  }

  public state = { ...this.initialState }

  public componentWillMount = () => {
    const emailFromForgetPage = localStorage.getItem('userEmail')
    if (emailFromForgetPage && !this.state.email) {
      this.setState({
        email: emailFromForgetPage,
      })
    }
    const emailFromSignInPage = localStorage.getItem('userSignInEmail')
    if (emailFromSignInPage) {
      localStorage.removeItem('userSignInEmail')
    }
  }

  public componentDidMount = () => {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  public componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown)
    const emailFromForgetPage = localStorage.getItem('userEmail')
    if (emailFromForgetPage) {
      localStorage.removeItem('userEmail')
    }
    if (this.state.email) {
      localStorage.setItem('userSignInEmail', this.state.email)
    }
  }

  public handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.validateSignUpFields()
    }
  }

  public validateSignUpFields = () => {
    let emailError: string
    let passwordError: string

    if (!this.state.email || !isEmailValid(this.state.email)) {
      emailError = 'Please enter a valid email'
    }
    if (!this.state.password) {
      passwordError = 'Please choose a password'
    }

    if (emailError || passwordError) {
      this.setState({
        errorEmail: emailError,
        errorPassword: passwordError,
      })
    } else {
      this.handleSubmit()
    }
  }

  public handleTogglePassword = () => {
    event.preventDefault()
    this.setState({ isPasswordVisible: !this.state.isPasswordVisible })
  }

  public handleSubmit = async () => {
    event.preventDefault()
    const { email, password, errorEmail, errorPassword } = this.state
    if (!errorEmail && !errorPassword) {
      !this.props.isOnline
        ? this.props.showAlert({ alertType: 'error', alertMessage: 'No internet connection' })
        : this.props.login({ Login: email, Password: password })
    }
  }

  public handleTouchField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target: string = e.currentTarget.getAttribute('data-name')
    if (target === 'email') {
      this.setState({ isTouchedEmail: true })
    } else if (target === 'password') {
      this.setState({ isTouchedPassword: true })
    }
  }

  public handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target: string = e.currentTarget.getAttribute('data-name')
    if (target === 'email') {
      this.setState({ isTouchedEmail: false })
    } else if (target === 'password') {
      this.setState({ isTouchedPassword: false })
    }
  }

  public handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const nextValue: string = e.target.value.trim()
    const target: string = e.currentTarget.getAttribute('data-name')
    if (target === 'email') {
      this.setState({ email: nextValue, errorEmail: '' })
    } else if (target === 'password') {
      this.setState({ password: nextValue, errorPassword: '' })
    }
  }

  public render() {
    return (
      <form className={styles.loginForm} onSubmit={e => e.preventDefault()}>
        <section className={styles.loginInputBlock}>
          <label className={styles.loginInputLabel} htmlFor="Email">
            <span>Email</span>
          </label>
          <div className={styles.loginInputFieldOverBlock}>
            <input
              autoComplete="off"
              className={classNames(styles.loginInputField, {
                [styles.inputWithError]: !!this.state.errorEmail,
              })}
              data-name="email"
              maxLength={76}
              onBlur={this.handleBlur}
              onChange={this.handleChangeName}
              onFocus={this.handleTouchField}
              placeholder="Email address"
              type="text"
              value={this.state.email}
            />
            {this.state.errorEmail && <span className={styles.errorIcon} />}
            {this.state.errorEmail && this.state.isTouchedEmail && (
              <span className={styles.errorMessage}>{this.state.errorEmail}</span>
            )}
          </div>
        </section>
        <section className={styles.loginInputBlock}>
          <label className={styles.loginInputLabel} htmlFor="password">
            Password
          </label>
          <div className={styles.loginInputFieldOverBlock}>
            <input
              autoComplete="off"
              className={classNames(styles.loginInputField, {
                [styles.inputWithError]: !!this.state.errorPassword,
              })}
              data-name="password"
              maxLength={64}
              onBlur={this.handleBlur}
              onChange={this.handleChangeName}
              onFocus={this.handleTouchField}
              placeholder="Password"
              type={this.state.isPasswordVisible ? 'text' : 'password'}
              value={this.state.password}
            />
            {this.state.errorPassword && <span className={styles.errorIcon} />}
            {this.state.errorPassword && this.state.isTouchedPassword && (
              <span className={styles.errorMessage}>{this.state.errorPassword}</span>
            )}
          </div>
          {!this.state.errorPassword && (
            <div className={styles.eyeIcon} onClick={this.handleTogglePassword}>
              <IconWrapper name={this.state.isPasswordVisible ? 'eyeSlash' : 'eye'} classes={styles.icon} />
            </div>
          )}
          <NavLink className={styles.forgotPass} to="/login/recovery">
            <p>Forgot password?</p>
          </NavLink>
        </section>
        <button className={styles.signInBtn} disabled={this.props.auth.loading} onClick={this.validateSignUpFields}>
          Sign In
        </button>
      </form>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInForm)
