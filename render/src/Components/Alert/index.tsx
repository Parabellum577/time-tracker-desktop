import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import classNames from 'classnames'

import time from '@services/time'
import * as alertActions from '@store/alerts/actions'
import { RootAction, IRootState } from '@store/rootReducer'
import { IAlert } from '@store/alerts/types'

const styles = require('./alert.module.scss')

const mapStateToProps = (state: IRootState) => ({
  alerts: state.alerts.alertsArray,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      clearAlert: alertActions.clearAlertMessage.request,
    },
    dispatch,
  )

type IAlertProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

class Alert extends React.PureComponent<IAlertProps> {
  public onClickHandler = () => {
    this.props.clearAlert()
  }

  public render() {
    const { alerts } = this.props
    let message: IAlert['alertMessage']
    let type: IAlert['alertType']

    if (!_.isEmpty(alerts)) {
      message = alerts[0].alertMessage
      type = alerts[0].alertType
    }

    if (typeof message === 'object' && 'message' in message) {
      type = 'error'
      message = message.message
    }

    if (!message || typeof message !== 'string') {
      return null
    }

    return (
      <div className={classNames(styles.notificationMessage, styles[type])} onClick={this.onClickHandler}>
        <p>{message}</p>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Alert)
