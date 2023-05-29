import * as React from 'react'
import classNames from 'classnames'
import * as _ from 'lodash'
import IconWrapper from '@components/IconWrapper'
import { useDispatch } from 'react-redux'
import * as userActions from '@store/currentUser/actions'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('./tutorial.module.scss')

const STEPS_WITH_MODAL: number = 3

const tutorialStepsWithModal = [
  {
    className: styles.firstTutorialStep,
    modalIcon: 'coldIcon',
    modalText: {
      title: 'Track time with single button',
      text: 'Cold time feature allows you to start tracking time immediately and distribute it later in any Task',
    },
  },
  {
    className: styles.secondTutorialStep,
    modalIcon: 'iconSearchLarge',
    modalText: {
      title: 'Search Tasks',
      text: 'Click on a search icon, select a project and add a task in your daily task list',
    },
  },
  {
    className: styles.thirdTutorialStep,
    modalIcon: 'tutorialAvatar',
    modalText: {
      title: 'Profile Menu',
      text: 'The profile menu contains all the settings. Click on an avatar to browse the items',
    },
  },
]

const Tutorial: React.FC = () => {
  // const [tutorialState, tutorialStateSwitch] = React.useState(tutorialStepsWithModal)
  // const [tutorialIndexState, tutorialIndexSwitch] = React.useState(0)
  const userSettings = useShallowEqualSelector(state => state.user.defaultUserSettings)
  // const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)

  // const userTrackersArrayIsEmpty = _.isEmpty(userTrackers.filter(tracker => tracker.Type !== 'TGTRACKER'))

  const dispatch = useDispatch()

  const setTutorialWithModalCompleted = React.useCallback(() => {
    const action = userActions.handleUserSettings.request([{ Key: 'isDesktopInstalled', Value: 'on' }])
    dispatch(action)
  }, [dispatch])

  React.useEffect(() => {
    if (userSettings.isDesktopInstalled === 'off') {
      setTutorialWithModalCompleted()
    }
  }, [])

  // const dispatchArrayOfTutorialActions = React.useCallback(() => {
  //   if (userSettings.isShowedIntegrationTutorial === 'off' || userSettings.isShowedPersonalProjectTutorial === 'off') {
  //     const action = userActions.handleUserSettings.request([
  //       { Key: 'isShowedIntegrationTutorial', Value: 'on' },
  //       { Key: 'isShowedPersonalProjectTutorial', Value: 'on' },
  //     ])
  //     dispatch(action)
  //   }
  // }, [dispatch, userSettings])

  // React.useEffect(() => {
  //   checkForIntegration()
  // }, [userSettings, userTrackers])

  // const checkForIntegration = () => {
  //   if (!userTrackersArrayIsEmpty) {
  //     dispatchArrayOfTutorialActions()
  //   }
  // }

  // const nextStep = () => {
  //   tutorialIndexSwitch(tutorialIndexState + 1)
  //   stepsChecker()
  // }

  // const stepsChecker = () => {
  //   if (tutorialIndexState === 2) {
  //     setTutorialWithModalCompleted()
  //   }
  // }

  // const tutorialWithModal = React.useCallback(() => {
  //   return tutorialIndexState < STEPS_WITH_MODAL && userSettings.isDesktopInstalled === 'off' ? (
  //     <div className={classNames(styles.tutorialWrap, tutorialState[tutorialIndexState].className)}>
  //       <span className={styles.tutorialIndicator} />
  //       <div className={styles.modalWindow}>
  //         <span className={styles.arrowIcon} />
  //         <div className={styles.iconBlock}>
  //           <IconWrapper name={tutorialState[tutorialIndexState].modalIcon} />
  //         </div>
  //         <h3>{tutorialState[tutorialIndexState].modalText.title}</h3>
  //         <p>{tutorialState[tutorialIndexState].modalText.text}</p>
  //         <button onClick={nextStep} className={styles.btnNext} type="button">
  //           Next
  //         </button>
  //       </div>
  //     </div>
  //   ) : null
  // }, [userSettings, tutorialIndexState])

  // return <React.Fragment>{tutorialWithModal()}</React.Fragment>
  return null
}

export default React.memo(Tutorial)
