import * as React from 'react'
import * as alertActions from '@store/alerts/actions'
import * as userActions from '@store/currentUser/actions'

import { IUpdateUser } from '@services/types'
import { useDispatch } from 'react-redux'

import Avatar from './Avatar/index'
import api from '@services/api'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import RolePicker from './RolePicker'
import ChangePassword from './ChangePassword'
import Loading from '@components/Loading'

const styles = require('./styles.module.scss')

const UserSettingsPage: React.FC = props => {
  const userInfo = useShallowEqualSelector(state => state.user.currentUser)
  const userEmail = userInfo.Login
  const [firstName, setFirstName] = React.useState(userInfo.FirstName)
  const [lastName, setLastName] = React.useState(userInfo.LastName)
  const [userSkype, setUserSkype] = React.useState(userInfo.Skype)
  const [userRole, setUserRole] = React.useState(userInfo.Role)
  const [isInfoEdit, setInfoEdit] = React.useState(false)
  const [isUpdateUserInfo, setUpdateUserInfo] = React.useState(false)
  const [isRolePickerDisable, setRolePickerDisable] = React.useState(false)

  const dispatch = useDispatch()

  React.useEffect(() => {
    if (
      firstName !== userInfo.FirstName ||
      lastName !== userInfo.LastName ||
      userSkype !== userInfo.Skype ||
      userRole !== userInfo.Role
    ) {
      setInfoEdit(true)
    } else {
      setInfoEdit(false)
    }
  }, [userInfo, firstName, lastName, userSkype, userRole])

  const showAlert = React.useCallback(
    data => {
      const action = alertActions.showAlertMessage.request(data)
      dispatch(action)
    },
    [dispatch],
  )

  const updateUser = React.useCallback(
    data => {
      const action = userActions.updateCurrentUser(data)
      dispatch(action)
    },
    [dispatch],
  )

  const updateUserInfo = async () => {
    try {
      setUpdateUserInfo(true)
      setInfoEdit(false)
      setRolePickerDisable(true)

      const payload: IUpdateUser = {
        FirstName: firstName,
        LastName: lastName,
        Skype: userSkype,
        Phone: userInfo.Phone,
        Avatar: userInfo.Avatar,
        Role: userRole,
      }

      await api.user.UpdateUser(payload).then(() => {
        updateUser(payload)
      })

      showAlert({
        alertType: 'success',
        alertMessage: 'User information was successfully updated',
      })
    } catch (error) {
      console.error(error)
      showAlert({ alertType: 'error', alertMessage: error.message })
    } finally {
      setUpdateUserInfo(false)
      setRolePickerDisable(false)
    }
  }

  const handleFirstName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value)
  }

  const handleLastName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value)
  }

  const handleUserSkype = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSkype(e.target.value)
  }

  return (
    <div className={styles.userSettingsPage}>
      <div className={styles.avatarAndEmailBlock}>
        <div className={styles.avatarBlock}>
          <Avatar updateUser={updateUser} />
        </div>
        <div className={styles.emailBlock}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={userEmail} disabled={true} title={userEmail} />
          <p>Your email associated with your account and can't be changed manually</p>
        </div>
      </div>
      <div className={styles.infoBlock}>
        <div className={styles.row}>
          <div className={styles.inputCol}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={handleFirstName}
              disabled={isUpdateUserInfo}
            />
          </div>
          <div className={styles.inputCol}>
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" value={lastName} onChange={handleLastName} disabled={isUpdateUserInfo} />
          </div>
          <div className={styles.inputCol}>
            <label htmlFor="contact">Contact</label>
            <input
              type="text"
              id="contact"
              value={userSkype}
              onChange={handleUserSkype}
              placeholder="skype"
              disabled={isUpdateUserInfo}
            />
          </div>
          <div className={styles.inputCol}>
            <label htmlFor="role">Role</label>
            <RolePicker setUserRole={setUserRole} userRole={userRole} isPickerDisable={isRolePickerDisable} />
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button type="button" disabled={!isInfoEdit} onClick={updateUserInfo}>
            Save
          </button>
          {isUpdateUserInfo && <Loading proportions={36} />}
        </div>
      </div>
      <ChangePassword />
    </div>
  )
}

export default React.memo(UserSettingsPage)
