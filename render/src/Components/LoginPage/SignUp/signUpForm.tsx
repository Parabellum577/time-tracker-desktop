import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { push } from 'connected-react-router'

import classNames from 'classnames'

import { isEmailValid } from '@services/typesValidation'
import { openExternal } from '@services/openWindow'
import { IAddUserPayload } from '@api-types'
import api from '@api'
import * as authActions from '@store/auth/actions'
import * as alertActions from '@store/alerts/actions'
import { IAuthState } from '@store/auth/types'
import { RootAction, IRootState } from '@store/rootReducer'
import LoginButtons from '../LoginButtons'
import PasswordHint from '@components/PasswordHint'
import IconWrapper from '@components/IconWrapper'

const styles = require('./sign-up-form.module.scss')

const mapStateToProps = (state: IRootState) => ({
  auth: state.auth,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      login: authActions.loginUser.request,
      routeToSignInPage: push,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

interface ITouchedFields {
  email: boolean
  firstName: boolean
  lastName: boolean
  password: boolean
}

interface IErrors {
  errorEmail: string
  errorFirstName: string
  errorLastName: string
  errorPassword: string
  errorPolicy: string
}

interface IPasswordReq {
  hasLowerCase: boolean
  hasNumbers: boolean
  hasReqLength: boolean
  hasUpperCaseOrNumber: boolean
}

interface ISignUpProps {
  auth: IAuthState
  login: typeof authActions.loginUser.request
  routeToSignInPage: (path: string) => void
  showAlert: typeof alertActions.showAlertMessage.request
}

interface ISignUpState {
  email: string
  errors: IErrors
  firstName: string
  isPasswordHintVisible: boolean
  isPasswordVisible: boolean
  isPolicyAccepted: boolean
  isSignUpPage: boolean
  isTouched: ITouchedFields
  lastName: string
  password: string
  passwordRequirements: IPasswordReq
}

class SignUp extends React.PureComponent<ISignUpProps, ISignUpState> {
  public initialState: ISignUpState = {
    email: '',
    errors: {
      errorEmail: '',
      errorFirstName: '',
      errorLastName: '',
      errorPassword: '',
      errorPolicy: '',
    },
    firstName: '',
    isPasswordVisible: false,
    isSignUpPage: false,
    isTouched: {
      email: false,
      firstName: false,
      lastName: false,
      password: false,
    },
    isPolicyAccepted: false,
    lastName: '',
    password: '',
    passwordRequirements: {
      hasLowerCase: false,
      hasNumbers: false,
      hasReqLength: false,
      hasUpperCaseOrNumber: false,
    },
    isPasswordHintVisible: false,
  }

  public state = { ...this.initialState }

  private inputRef = React.createRef<HTMLInputElement>()

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
      this.validateSignUpFields('fullValidation')
      this.checkDataForSignUp()
    } else if (e.key === 'Escape') {
      this.props.routeToSignInPage('/login')
    }
  }

  public handleTogglePassword = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    this.inputRef.current.focus()
    this.setState({
      isPasswordVisible: !this.state.isPasswordVisible,
      isPasswordHintVisible: true,
      isTouched: {
        ...this.state.isTouched,
        firstName: false,
        lastName: false,
        password: true,
        email: false,
      },
    })
  }

  public handleTouchFieldNew = (e: any) => {
    const target: string = e.currentTarget.getAttribute('data-name')
    if (target === 'firstName' || target === 'lastName' || target === 'email') {
      this.setState({
        isTouched: { ...this.state.isTouched, [target]: true },
        isPasswordHintVisible: false,
      })
    } else if (target === 'password') {
      this.setState({
        isTouched: { ...this.state.isTouched, password: true },
        isPasswordHintVisible: true,
      })
    }
  }

  public handleBlurPass = () => {
    this.validateSignUpFields('password')
  }

  public handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue: string = e.target.value
    const target: string = e.currentTarget.getAttribute('data-name')
    if (target === 'firstName') {
      if (nextValue.match(/\d/)) {
        return
      }
      this.setState({
        firstName: nextValue,
        errors: { ...this.state.errors, errorFirstName: '' },
      })
    } else if (target === 'lastName') {
      if (nextValue.match(/\d/)) {
        return
      }
      this.setState({
        lastName: nextValue,
        errors: { ...this.state.errors, errorLastName: '' },
      })
    } else if (target === 'email') {
      this.setState({
        email: nextValue,
        errors: { ...this.state.errors, errorEmail: '' },
      })
    }
  }

  public handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    let symbol: any
    let isLowerCaseSymbol: boolean = false
    let isUpperOrNumberSymbol: boolean = false
    let isReqLength: boolean = false
    const nextValue: string | number = e.target.value.trim()
    for (symbol of nextValue) {
      if (/[a-z|а-я|ё]+/.test(symbol)) {
        isLowerCaseSymbol = true
      } else if (/[A-Z|А-Я|Ё]+/.test(symbol) || /\d+/.test(symbol)) {
        isUpperOrNumberSymbol = true
      }
    }

    if (nextValue.length >= 8 && nextValue.length <= 64) {
      isReqLength = true
    }

    if (nextValue.length > 64) {
      return
    }

    this.setState({
      isPasswordHintVisible: true,
      password: nextValue,
      passwordRequirements: {
        ...this.state.passwordRequirements,
        hasLowerCase: isLowerCaseSymbol,
        hasUpperCaseOrNumber: isUpperOrNumberSymbol,
        hasReqLength: isReqLength,
      },
      errors: { ...this.state.errors, errorPassword: '' },
    })
  }

  public validateSignUpFields = (arg: any) => {
    let fieldsToValidate = []
    if (arg === 'fullValidation') {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'policy']
    } else {
      typeof arg === 'object'
        ? (fieldsToValidate = [arg.currentTarget.getAttribute('data-name')])
        : (fieldsToValidate = [arg])
    }

    let firstNameError = this.state.errors.errorFirstName || ''
    let lastNameError = this.state.errors.errorLastName || ''
    let emailError = this.state.errors.errorEmail || ''
    let passwordError = this.state.errors.errorPassword || ''
    let policyError = this.state.errors.errorPolicy || ''
    const {
      firstName,
      lastName,
      email,
      password,
      isPolicyAccepted,
      passwordRequirements: { hasLowerCase, hasUpperCaseOrNumber, hasReqLength },
    } = this.state

    fieldsToValidate.forEach(field => {
      if (field === 'firstName' && !firstName) {
        firstNameError = 'Please enter your first name'
      } else if (field === 'lastName' && !lastName) {
        lastNameError = 'Please enter your last name'
      } else if ((field === 'email' && !email) || (field === 'email' && !isEmailValid(email))) {
        emailError = 'Please enter a valid email'
      } else if (field === 'password') {
        if (!password || !hasLowerCase || !hasUpperCaseOrNumber || !hasReqLength) {
          passwordError = 'Please choose an acceptable password'
        }
      } else if (field === 'policy' && !isPolicyAccepted) {
        policyError = 'Please accept timetracker Terms and Policies'
      }
    })

    this.setState({
      errors: {
        ...this.state.errors,
        errorFirstName: firstNameError,
        errorLastName: lastNameError,
        errorEmail: emailError,
        errorPassword: passwordError,
        errorPolicy: policyError,
      },
      isTouched: {
        ...this.state.isTouched,
        firstName: false,
        lastName: false,
        password: false,
        email: false,
      },
      isPasswordHintVisible: false,
    })
  }

  public checkDataForSignUp = () => {
    if (
      !this.state.isPolicyAccepted ||
      this.state.errors.errorPolicy ||
      !this.state.firstName ||
      this.state.errors.errorFirstName ||
      !this.state.lastName ||
      this.state.errors.errorLastName ||
      !this.state.email ||
      this.state.errors.errorEmail ||
      !this.state.password ||
      this.state.errors.errorPassword
    ) {
      this.validateSignUpFields('fullValidation')
    } else {
      this.handleSignUp()
    }
  }

  public handleSignUp = async () => {
    try {
      const newUserPayload: IAddUserPayload = {
        FirstName: this.state.firstName,
        LastName: this.state.lastName,
        Phone: '',
        Skype: '',
        Login: this.state.email,
        Password: this.state.password,
      }
      await api.user.AddUser(newUserPayload)
      this.props.login({ Login: this.state.email, Password: this.state.password })
    } catch (error) {
      this.props.showAlert({ alertType: 'error', alertMessage: error.message })
      console.error(error)
    }
  }

  public openPolicy = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault()
    openExternal(`https://timetracker.com/${e.currentTarget.getAttribute('data-name')}/`)
  }

  public handleCheckBoxOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.validateSignUpFields('fullValidation')
      this.setState({
        isPolicyAccepted: !this.state.isPolicyAccepted,
        errors: { ...this.state.errors, errorPolicy: '' },
      })
    }
  }

  public handleCheckBoxOnClick = () => {
    this.setState({
      isPolicyAccepted: !this.state.isPolicyAccepted,
      errors: { ...this.state.errors, errorPolicy: '' },
    })
  }

  public render() {
    const {
      errors: { errorFirstName, errorLastName, errorEmail, errorPassword, errorPolicy },
      isTouched: { firstName, lastName, email, password },
      passwordRequirements: { hasLowerCase, hasUpperCaseOrNumber, hasReqLength },
      isPasswordHintVisible,
    } = this.state
    const optionalPosition = { bottom: '80%', left: '25%' }

    return (
      <>
        <div className={styles.loginForm}>
          <section className={styles.newUserBlock}>
            <div className={styles.nameBlock}>
              <label className={styles.loginInputLabel}>First name</label>
              <div className={styles.loginInputFieldOverBlock}>
                <input
                  value={this.state.firstName}
                  className={classNames(styles.loginInputField, {
                    [styles.inputWithError]: errorFirstName,
                  })}
                  placeholder="First name"
                  autoComplete="off"
                  maxLength={35}
                  data-name="firstName"
                  onFocus={this.handleTouchFieldNew}
                  onBlur={this.validateSignUpFields}
                  onChange={this.handleChangeName}
                />
                {errorFirstName && <span className={styles.errorIcon} />}
                {errorFirstName && firstName && <span className={styles.errorMessage}>{errorFirstName}</span>}
              </div>
            </div>
            <div className={styles.nameBlock}>
              <label className={styles.loginInputLabel}>Last name</label>
              <div className={styles.loginInputFieldOverBlock}>
                <input
                  value={this.state.lastName}
                  className={classNames(styles.loginInputField, {
                    [styles.inputWithError]: errorLastName,
                  })}
                  placeholder="Last name"
                  autoComplete="off"
                  maxLength={35}
                  data-name="lastName"
                  onFocus={this.handleTouchFieldNew}
                  onBlur={this.validateSignUpFields}
                  onChange={this.handleChangeName}
                />
                {errorLastName && <span className={styles.errorIcon} />}
                {errorLastName && lastName && <span className={styles.errorMessage}>{errorLastName}</span>}
              </div>
            </div>
          </section>
          <section className={styles.loginInputBlock}>
            <label className={styles.loginInputLabel} htmlFor="email">
              <span>Email</span>
            </label>
            <div className={styles.loginInputFieldOverBlock}>
              <input
                value={this.state.email}
                type="text"
                className={classNames(styles.loginInputField, {
                  [styles.inputWithError]: errorEmail,
                })}
                placeholder="Email"
                autoComplete="off"
                maxLength={76}
                data-name="email"
                onFocus={this.handleTouchFieldNew}
                onBlur={this.validateSignUpFields}
                onChange={this.handleChangeName}
              />
              {errorEmail && <span className={styles.errorIcon} />}
              {errorEmail && email && <span className={styles.errorMessage}>{errorEmail}</span>}
            </div>
          </section>
          <section className={styles.loginInputBlock}>
            <label className={styles.loginInputLabel} htmlFor="password">
              Password
            </label>
            <div className={styles.loginInputFieldOverBlock}>
              <input
                ref={this.inputRef}
                value={this.state.password}
                type={this.state.isPasswordVisible ? 'text' : 'password'}
                className={classNames(styles.loginInputField, styles.passwordField, {
                  [styles.inputWithError]: errorPassword,
                })}
                data-name="password"
                placeholder="Password at least 8 characters"
                autoComplete="off"
                maxLength={64}
                onFocus={this.handleTouchFieldNew}
                onBlur={this.validateSignUpFields}
                onChange={this.handleChangePassword}
              />
              {!errorPassword ? (
                <div className={styles.eyeIcon} onMouseDown={this.handleTogglePassword}>
                  <IconWrapper
                    classes={styles.icon}
                    key={`eye-${this.state.isPasswordVisible}`}
                    name={this.state.isPasswordVisible ? 'eyeSlash' : 'eye'}
                  />
                </div>
              ) : (
                <span className={styles.errorIcon} />
              )}
              {errorPassword && password && <span className={styles.errorMessage}>{errorPassword}</span>}
            </div>
            {isPasswordHintVisible && (
              <PasswordHint
                hasLowerCase={hasLowerCase}
                hasReqLength={hasReqLength}
                hasUpperCaseOrNumber={hasUpperCaseOrNumber}
                optionalPosition={optionalPosition}
              />
            )}
          </section>
          <div className={styles.checkBoxList}>
            <div className={styles.checkBoxBlock}>
              <input
                className={styles.checkboxInput}
                type="checkbox"
                data-name="policy"
                id="policy"
                onClick={this.handleCheckBoxOnClick}
                onKeyPress={this.handleCheckBoxOnEnter}
                checked={this.state.isPolicyAccepted}
              />
              <label
                className={classNames(styles.checkboxLabel, {
                  [styles.checkboxInputError]: errorPolicy && !isPasswordHintVisible,
                })}
                htmlFor="policy"
              >
                <span>
                  I agree to the{' '}
                  <a data-name="cookies-policy" onClick={this.openPolicy}>
                    timetracker Cookies Policy
                  </a>
                  ,{' '}
                  <a data-name="privacy-policy" onClick={this.openPolicy}>
                    {' '}
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a data-name="terms-of-use" onClick={this.openPolicy}>
                    Terms of Use
                  </a>
                </span>
              </label>
            </div>
            {errorPolicy && !isPasswordHintVisible && <span className={styles.errorPolicy}>{errorPolicy}</span>}
          </div>
          <button disabled={this.props.auth.loading} className={styles.signUpBtn} onClick={this.checkDataForSignUp}>
            Sign Up
          </button>
        </div>
        <LoginButtons />
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
