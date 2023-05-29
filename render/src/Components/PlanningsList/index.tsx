import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import * as _ from 'lodash'
import * as InfiniteScroll from 'react-infinite-scroller'

import { IPlanning, IFullIssue } from '@types'
import Planning from '@components/Planning'
import IconWrapper from '@components/IconWrapper'
import * as userActions from '@store/currentUser/actions'

import HighlightIndicator from '@components/Tutorial/highlightIndicator'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import EmailConfirm from '@components/EmailConfirm'
import OfflineNotification from '@components/OfflineNotification'
import { PlanningsPageContext } from '@components/PlanningsPage'
import ProblemsWithIntegration from '@components/ProblemsWithIntegration'
import CreateModal from '@components/PlanningModal'
import FiltrationMenu from './FiltrationMenu'

const styles = require('./planningsList.module.scss')
const renderLimitCount: number = 20

interface IOwnProps {
  plannings: IPlanning[]
  issues: IFullIssue[]
}

type IProps = IOwnProps

const PlanningsList: React.FC<IProps> = ({ plannings, issues }) => {
  const dispatch = useDispatch()
  const context = React.useContext(PlanningsPageContext)

  const userSettings = useShallowEqualSelector(state => state.user.defaultUserSettings)
  const currentUser = useShallowEqualSelector(state => state.user.currentUser)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const coldPlannings = useShallowEqualSelector(state => state.plannings.coldPlannings)
  const isOnline = useShallowEqualSelector(state => state.internetConnection.isOnline)

  const [searchValue, setSearchValue] = React.useState('')
  const [filteredPlannings, setFilteredPlannings] = React.useState<IPlanning[]>(plannings)
  const [filteredIssues, setFilteredIssues] = React.useState<IFullIssue[]>(issues)
  const [isShowUnassignedTasks, setIsShowUnassignedTasks] = React.useState(false)
  const [isOpenedCreateTaskForm, setIsOpenedCreateTaskForm] = React.useState(false)
  const [renderLimit, setRenderLimit] = React.useState(renderLimitCount)

  const loadMore = () => {
    setRenderLimit(renderLimit + renderLimitCount)
  }

  const activePlanning = plannings.find(p => p.Active === true)
  const planningsToRender = filteredPlannings.filter(p => p.Active !== true)
  const isEmptyList = _.isEmpty(plannings) && _.isEmpty(issues)
  const userTrackerArrayIsEmpty = _.isEmpty(userTrackers.filter(tracker => tracker.Type !== 'TGTRACKER'))

  const setShowedTutorial = React.useCallback(
    (key: 'isShowedTaskAssignTutorial' | 'isShowedIntegrationTutorial') => {
      if (userSettings[key] === 'off') {
        const action = userActions.handleUserSettings.request([{ Key: key, Value: 'on' }])
        dispatch(action)
      }
    },
    [dispatch, userSettings],
  )

  const isActiveColdStart = coldPlannings.some(p => p.Active)

  const applyFilter = () => {
    setFilteredPlannings(plannings.filter(p => p.IssueTitle.includes(searchValue) || p.IssueID.includes(searchValue)))
    setFilteredIssues(
      issues
        .filter(i => isShowUnassignedTasks || i.IsAssigned)
        .filter(
          i =>
            i.Title.toLowerCase().includes(searchValue.toLowerCase()) ||
            i.ID.toLowerCase().includes(searchValue.toLowerCase()),
        ),
    )
  }

  React.useEffect(() => {
    applyFilter()
  }, [searchValue, plannings, issues, isShowUnassignedTasks])

  React.useEffect(() => {
    if (context.scrollContainerRef && context.scrollContainerRef.current) {
      context.scrollContainerRef.current.scrollTop = 0
    }
  }, [activePlanning ? activePlanning.ID : -1])

  return (
    <>
      <ProblemsWithIntegration />
      {!isOnline && <OfflineNotification />}
      {!currentUser.Activated && <EmailConfirm />}
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className={styles.input}
          placeholder="Search tasks…"
        />
        <FiltrationMenu
          isShowUnassignedTasks={isShowUnassignedTasks}
          setIsShowUnassignedTasks={v => {
            console.trace(v)
            setIsShowUnassignedTasks(v)
          }}
        />
        <div className={styles.addTaskButton} onClick={() => setIsOpenedCreateTaskForm(true)}>
          <IconWrapper name="add" title="Create Task" />
        </div>
        {isOpenedCreateTaskForm && (
          <CreateModal
            onClose={() => setIsOpenedCreateTaskForm(false)}
            type="create"
            project={context.selectedProject}
          />
        )}
      </div>
      {isEmptyList && userSettings.isDesktopInstalled === 'on' ? (
        <div className={styles.emptyListContainer}>
          {isActiveColdStart ? (
            <>
              <IconWrapper classes={styles.emptyListContainerImgActive} name="emptyListImageActive" />
              <h2>Follow the Dream</h2>
            </>
          ) : (
            <>
              <IconWrapper classes={styles.emptyListContainerImg} name="emptyListImage" />
              <h2>Tasklist is Empty</h2>
            </>
          )}

          <div className={styles.emptyListContainerText}>
            {userTrackerArrayIsEmpty ? (
              <>
                {isActiveColdStart ? (
                  <p>Don't forget to log Coldstart time to your task</p>
                ) : (
                  <p>To create or plan a task click on the search icon or connect your task management system</p>
                )}
                <NavLink
                  onClick={() => setShowedTutorial('isShowedIntegrationTutorial')}
                  to={
                    !userTrackerArrayIsEmpty && userSettings.isShowedIntegrationTutorial === 'off'
                      ? '/main/userTrackers'
                      : '/main/addTrackers'
                  }
                  className={
                    userSettings.isShowedIntegrationTutorial === 'off'
                      ? styles.integrationButton
                      : styles.integrationButtonDefault
                  }
                  id="emptyIntegrationButton"
                >
                  <HighlightIndicator
                    className={styles.tutorialIndicator}
                    userSettingsKey="isShowedIntegrationTutorial"
                  />
                  Connect an Integration
                </NavLink>
              </>
            ) : isActiveColdStart ? (
              <p>Don't forget to log Coldstart time to your task</p>
            ) : (
              <p>You don't have planned tasks for today. It's time to do it</p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.listContainer}>
          {activePlanning && <Planning key={activePlanning.ID} planning={activePlanning} />}
          {planningsToRender.map(p => (
            <Planning key={p.ID} planning={p} />
          ))}
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={filteredIssues.length > renderLimit}
            loader={null}
            useWindow={false}
            getScrollParent={() => context.scrollContainerRef.current}
          >
            {_.take(filteredIssues, renderLimit).map(i => (
              <Planning key={i.ID} issue={i} />
            ))}
          </InfiniteScroll>
        </div>
      )}
    </>
  )
}

export default React.memo(PlanningsList)
