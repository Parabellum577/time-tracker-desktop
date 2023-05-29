import * as React from 'react'
import { connect } from 'react-redux'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import classNames from 'classnames'

import IconWrapper from '@components/IconWrapper'
import { bindActionCreators, Dispatch } from 'redux'
import { RootAction, IRootState } from '@store/rootReducer'
import * as userActions from '@store/currentUser/actions'
import * as alertActions from '@store/alerts/actions'
import Hint from '@components/Hint'

const styles = require('./styles.module.scss')

interface IOptions {
  name: string
  option: string
  title?: string
  hint?: string
  state?: string
  hasIcon: boolean
}

const mapStateToProps = (state: IRootState) => ({
  userSettings: state.user.defaultUserSettings,
  openPlannings: state.plannings.openPlannings,
  coldPlannings: state.plannings.coldPlannings,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      handleUserSettings: userActions.handleUserSettings.request,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

interface IPreferencesState {
  anchorEl: null | HTMLElement
}

type IPreferencesProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

class Preferences extends React.PureComponent<IPreferencesProps, IPreferencesState> {
  public state: IPreferencesState = {
    anchorEl: null,
  }

  public handleError = () => {
    this.props.showAlert({ alertType: 'error', alertMessage: 'Stop tracking time in order to launch this option' })
  }

  public getThumb = (item: IOptions) => {
    const isActivePlaning = this.props.openPlannings.some(p => p.Active)
    const hasError = item.name === 'isOverSpentMode' && isActivePlaning

    return (
      <div
        className={styles.switchBlock}
        data-name={item.name}
        onClick={hasError ? this.handleError : this.handleOptionState}
      >
        <Switch
          classes={{
            switchBase: classNames(styles.customSwitchBase, {
              [styles.withError]: hasError,
            }),
            bar: styles.customBar,
            root: styles.customRoot,
            icon: styles.customIcon,
            iconChecked: styles.customIconChecked,
            checked: styles.checkedBar,
          }}
          checked={item.state === 'on' ? true : false}
          title={hasError ? 'Stop tracking time in order to launch this option' : null}
        />
        <span>{item.option}</span>
      </div>
    )
  }

  public handleOptionState = (e: React.MouseEvent) => {
    const name: string = e.currentTarget.getAttribute('data-name')
    if (!isNaN(+name)) {
      this.props.handleUserSettings([{ Key: 'idle', Value: name }])
      this.setState({ anchorEl: null })
    } else {
      this.props.handleUserSettings([{ Key: name }])
    }
  }

  public openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  public handleAnchor = () => {
    this.setState({ anchorEl: null })
  }

  public getMenuDropdown = () => {
    const afkOptions = ['1', '5', '10', '15']
    return (
      <Menu
        anchorEl={this.state.anchorEl}
        open={!!this.state.anchorEl}
        onClose={this.handleAnchor}
        PaperProps={{
          style: {
            width: 120,
            marginLeft: -16,
          },
        }}
      >
        {afkOptions.map(a => (
          <MenuItem
            selected={false}
            key={a}
            data-name={a}
            style={{
              padding: '6px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              background: '#fff',
              color: '#000',
              fontFamily: 'SFUIDisplay',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={this.handleOptionState}
          >
            <span style={{ cursor: 'pointer' }}>{a}</span>
            {this.props.userSettings.idle === a && <IconWrapper name="checkIcon" />}
          </MenuItem>
        ))}
      </Menu>
    )
  }

  public render() {
    const generalOptions: IOptions[] = [
      {
        name: 'isAppDefaultLaunch',
        option: 'Automatically launch timetracker',
        hint: 'Launch timetracker automatically when you sign in to OS',
        state: this.props.userSettings.isAppDefaultLaunch,
        hasIcon: true,
      },
      {
        name: 'isOverSpentMode',
        option: 'Overspent mode',
        hint: 'Turn on overspent mode to proceed time tracking when you reach your planned time',
        state: this.props.userSettings.isOverSpentMode,
        hasIcon: true,
      },
      // {
      //   name: 'isAutoDailyReport',
      //   option: 'Automatic daily report',
      //   hint: 'Report tracked time automatically at 23:59 PM',
      //   state: this.props.userSettings.isAutoDailyReport,
      //   hasIcon: true,
      // },
      {
        name: 'isNotifications',
        option: 'Notifications',
        hint: 'Enable or disable desktop notifications',
        state: this.props.userSettings.isNotifications,
        hasIcon: true,
      },
      // {
      //   name: 'isSound',
      //   option: 'Play App Sounds',
      //   state: this.props.userSettings.isSound,
      //   hasIcon: false,
      // },
    ]
    const otherOptions: IOptions[] = [
      // {
      //   name: 'isInstantColdStart',
      //   option: 'Coldstart at System Start',
      //   title: 'Coldstart',
      //   hint: 'Launch Cold time automatically on system startup',
      //   state: this.props.userSettings.isInstantColdStart,
      //   hasIcon: true,
      // },
      // {
      //   name: 'isScreenshootNotifications',
      //   option: 'Screenshot Notifications',
      //   title: 'Screenshots',
      //   hint: 'Display notification when screenshot is taken',
      //   state: this.props.userSettings.isScreenshootNotifications,
      //   hasIcon: true,
      // },
    ]

    return (
      <div className={styles.main}>
        <div className={styles.menuBlock}>
          <p className={styles.menuTitle}>General</p>
          <div className={styles.menuBody}>
            {generalOptions.map(item => (
              <div className={styles.switchContainer} key={item.option}>
                {this.getThumb(item)}
                {item.hasIcon && (
                  <Hint hintText={item.hint} customClassName={styles.hintCustomWrap} position="right">
                    <IconWrapper name="questionIcon" />
                  </Hint>
                )}
              </div>
            ))}
          </div>
        </div>
        {otherOptions.map(opt => (
          <div className={styles.menuBlock} key={opt.name}>
            <p className={styles.menuTitle}>{opt.title}</p>
            <div className={styles.menuBody}>
              <div className={styles.switchContainer}>
                {this.getThumb(opt)}
                {opt.hasIcon && (
                  <Hint hintText={opt.hint} customClassName={styles.hintCustomWrap} position="right">
                    <IconWrapper name="questionIcon" />
                  </Hint>
                )}
              </div>
              {/* {opt.title === 'Coldstart' && (
                <div className={styles.afkBlock}>
                  <span>Idle detection</span>
                  <div className={styles.timeBlock}>
                    <span className={styles.timeTitle}>Minutes</span>
                    <div className={styles.time} onClick={this.openMenu}>
                      <span>{this.props.userSettings.idle}</span>
                      <IconWrapper name="arrowDownIcon" classes={styles.arrowIcon} />
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        ))}
        {this.getMenuDropdown()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences)
