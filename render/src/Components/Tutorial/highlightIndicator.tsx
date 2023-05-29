import * as React from 'react'
import classNames from 'classnames'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('./tutorial.module.scss')

interface IHighLightIndicatorProps {
  className: string
  userSettingsKey:
    | 'isShowedSearchBarTutorial'
    | 'isShowedIntegrationTutorial'
    | 'isShowedPersonalProjectTutorial'
    | 'isShowedTaskAssignTutorial'
}

const HighLightIndicator: React.FC<IHighLightIndicatorProps> = props => {
  const userSettings = useShallowEqualSelector(state => state.user.defaultUserSettings)

  return userSettings.isDesktopInstalled === 'on' && userSettings[props.userSettingsKey] === 'off' ? (
    <span className={classNames(styles.tutorialIndicator, props.className)} />
  ) : null
}

export default React.memo(HighLightIndicator)
