import * as React from 'react'
import * as alertActions from '@store/alerts/actions'

import api from '@services/api'
import classNames from 'classnames'
import IconWrapper from '@components/IconWrapper'
import Loading from '@components/Loading'
import PasswordValidate from '@components/PasswordValidate'

import { IUpdatePwdByUser } from '@services/api-types'
import { useDispatch } from 'react-redux'

const styles = require('./styles.module.scss')

const ChangePassword: React.FC = () => {
  const dispatch = useDispatch()
  const [oldUserPassword, setOldUserPassword] = React.useState('')
  const [newUserPassword, setNewUserPassword] = React.useState('')
  const [isOldPasswordShow, setOldPasswordShow] = React.useState(false)
  const [isNewPasswordShow, setNewPasswordShow] = React.useState(false)
  const [isPasswordUpdate, setPasswordUpdate] = React.useState(false)
  const [isPasswordValid, setPasswordValid] = React.useState(false)
  const [isPasswordValidBlockShow, setPasswordValidBlockShow] = React.useState(false)

  const showAlert = React.useCallback(
    data => {
      const action = alertActions.showAlertMessage.request(data)
      dispatch(action)
    },
    [dispatch],
  )

  const updateUserPassword = async () => {
    try {
      setPasswordUpdate(true)

      const payload: IUpdatePwdByUser = {
        OldPassword: oldUserPassword,
        NewPassword: newUserPassword,
      }

      await api.user.UpdatePwdByUser(payload).then(() => {
        setOldUserPassword('')
        setNewUserPassword('')
      })

      showAlert({ alertType: 'success', alertMessage: 'Password successfully changed' })
    } catch (error) {
      showAlert({ alertType: 'error', alertMessage: error.message })
      console.error(error)
    } finally {
      setPasswordUpdate(false)
    }
  }

  const toggleOldPasswordShowing = () => {
    setOldPasswordShow(!isOldPasswordShow)
  }

  const toggleNewPasswordShowing = () => {
    setNewPasswordShow(!isNewPasswordShow)
  }

  const handleUserOldPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldUserPassword(e.target.value)
  }

  const handleUserNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserPassword(e.target.value)
  }

  const togglePasswordValidBlock = () => {
    setPasswordValidBlockShow(!isPasswordValidBlockShow)
  }

  return (
    <div className={styles.changePasswordBlock}>
      <h2>Change Password</h2>
      <div className={styles.inputRow}>
        <label htmlFor="oldPassword">Old Password</label>
        <div className={styles.inputWrap}>
          <input
            type={isOldPasswordShow ? 'text' : 'password'}
            onChange={handleUserOldPassword}
            value={oldUserPassword}
            id="oldPassword"
            disabled={isPasswordUpdate}
          />
          <div
            className={classNames(styles.iconBlock, {
              [styles.iconBlockShow]: !isOldPasswordShow,
            })}
            onClick={toggleOldPasswordShowing}
          >
            <IconWrapper name="eye" width="20px" height="20px" />
          </div>
        </div>
      </div>
      <div className={styles.inputRow}>
        <label htmlFor="newPassword">New Password</label>
        <div className={styles.inputWrap}>
          <input
            type={isNewPasswordShow ? 'text' : 'password'}
            onChange={handleUserNewPassword}
            value={newUserPassword}
            id="newPassword"
            disabled={isPasswordUpdate}
            onFocus={togglePasswordValidBlock}
            onBlur={togglePasswordValidBlock}
            maxLength={64}
          />
          <div
            className={classNames(styles.iconBlock, {
              [styles.iconBlockShow]: !isNewPasswordShow,
            })}
            onClick={toggleNewPasswordShowing}
          >
            <IconWrapper name="eye" width="20px" height="20px" />
          </div>
          <PasswordValidate
            password={newUserPassword}
            setPasswordValid={setPasswordValid}
            isPasswordValidBlockShow={isPasswordValidBlockShow}
          />
        </div>
      </div>
      <div className={styles.btnWrap}>
        <button type="button" onClick={updateUserPassword} disabled={!isPasswordValid || isPasswordUpdate}>
          Save
        </button>
        {isPasswordUpdate && <Loading proportions={36} />}
      </div>
    </div>
  )
}

export default React.memo(ChangePassword)
