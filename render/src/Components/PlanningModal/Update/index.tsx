import * as React from 'react'
import * as _ from 'lodash'
import { connect, useDispatch } from 'react-redux'

import * as planningsActions from '@store/plannings/actions'
import { IRootState, RootAction } from '@store/rootReducer'
import { bindActionCreators, Dispatch } from 'redux'
import Comment from '../Comment'
import Header from '../Header'
import IssueBlock from '../IssueBlock'
import { IPlanning, INamedID, IProjectDetails } from '@services/types'
import { ISetExtraPayload } from '@services/api-types'
import TimeSelector from '@components/TimeSelector'
import IconWrapper from '@components/IconWrapper'
import { getFullSpentTime, isTrackerWithDisableDetails } from '@services/helpers'
import { formatTime } from '@services/formater'
import BaseIssueStatePicker from '../BaseIssueStatePicker'
import { ModalContext } from '../index'
import * as projectActions from '@store/projects/actions'
import * as userActions from '@store/currentUser/actions'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import api from '@services/api'
import Spinner from '@components/Spinner'

const styles = require('./update.module.scss')

interface IOwnProps {
  handleEditPlanning: (planning: ISetExtraPayload) => void
}

const mapStateToProps = (state: IRootState) => ({
  projects: state.projects.projects,
  currentUser: state.user.currentUser,
  openPlannings: state.plannings.openPlannings,
  closedPlannings: state.plannings.closedPlannings,
  projectsSettings: state.projects.projectsSettings,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      createPlanning: planningsActions.createPlannings.request,
      startPlanning: planningsActions.startPlanning.request,
      getProjectSettings: projectActions.getProjectSettings.request,
      addHighlightedPlanning: planningsActions.addHighlightedPlanning,
      setStatus: planningsActions.setStatus,
      setPriority: planningsActions.setPriority,
    },

    dispatch,
  )

type IUpdateModalProps = IOwnProps & ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

const getEditTimeByPlanning = (planning: IPlanning) => {
  const spentTime = getFullSpentTime(planning)
  const estimationTime = planning ? planning.Estimation || planning.IssueEstimation : 0
  return Math.max(spentTime, estimationTime)
}

const Update: React.FC<IUpdateModalProps> = props => {
  const context = React.useContext(ModalContext)
  const userSettings = useShallowEqualSelector(state => state.user.defaultUserSettings)
  const [comment, setComment] = React.useState(
    context.planning ? context.planning.LastReason || context.planning.OpenComment : '',
  )
  const [estimationError, setEstimationError] = React.useState('')
  const [estimatedTime, setEstimatedTime] = React.useState(getEditTimeByPlanning(context.planning))
  const [maxPlanningTime, setMaxPlanningTime] = React.useState(23.99)
  const [issueStatus, setIssueStatusState] = React.useState<INamedID>(null)
  const [issuePriority, setIssuePriority] = React.useState<INamedID>(null)
  const [issueType, setIssueType] = React.useState<INamedID>(null)
  const [selectedProject, setSelectedProject] = React.useState(context.project || null)
  const [projectDetailsArr, setProjectDetails] = React.useState<IProjectDetails>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  const isIssueStatusInit =
    projectDetailsArr && projectDetailsArr.TrackerType && isTrackerWithDisableDetails(projectDetailsArr.TrackerType)

  const projectItemId = projectDetailsArr ? `${projectDetailsArr.TrackerID} - ${projectDetailsArr.ID}` : null

  React.useEffect(() => {
    if (!context.planning && !context.planningIssue) {
      return
    }
    const { ProjectID, TrackerID } = context.planning ? context.planning : context.planningIssue

    const storedSettings = props.projectsSettings.find(p => p.project === `${ProjectID}-${TrackerID}`)

    if (storedSettings) {
      const maxTime = storedSettings.settings.find(s => s.Key === 'planning-max')

      const totalPlanned = _.filter(props.openPlannings, {
        Outdated: false,
        ProjectID,
        TrackerID,
      })
        .filter(p => (context.planning ? context.planning.ID !== p.ID : true))
        .reduce((red, item) => red + Math.max(item.Estimation, getFullSpentTime(item)), 0)

      const totalReported = _.filter(props.closedPlannings, {
        Outdated: false,
        ProjectID,
        TrackerID,
      }).reduce((red, item) => red + item.Reported, 0)

      const newMaxPlanningTime = (+maxTime.Value || 23.99) - (totalPlanned - totalReported) / 3600

      setMaxPlanningTime(newMaxPlanningTime)
      if (newMaxPlanningTime === 0) {
        setEstimationError(
          `You are allowed to report ${+maxTime.Value ||
            23.59} hours per day to this project. Please report other plannings or edit their planned time.`,
        )
        return
      }
    } else {
      props.getProjectSettings({ ProjectID, TrackerID })
    }
  }, [props.projectsSettings, context.planning])

  React.useEffect(() => {
    if (!selectedProject) {
      return
    }

    api.tracker
      .GetProjectDetails({
        TrackerID: selectedProject.TrackerID,
        ProjectID: selectedProject.ProjectID,
      })
      .then(projectDetails => {
        setProjectDetails(projectDetails)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [selectedProject])

  React.useEffect(() => {
    if (isLoading) {
      return
    }

    const { TrackerID, ProjectID } = context.planning ? context.planning : context.planningIssue
    const IssueID = context.planning ? context.planning.IssueID : context.planningIssue.ID

    api.tracker
      .GetIssue({
        TrackerID,
        ProjectID,
        IssueID,
      })
      .then(res => {
        if (setIssuePriority) {
          setIssuePriority(res.Priority)
        }
        if (setTaskStatus) {
          setTaskStatus(res.Status)
          if (!context.isPlanningExist) {
            setTgTrackerTaskStatusToInProgress()
          }
        }
        if (setIssueType) {
          setIssueType(res.Type)
        }
      })
  }, [
    context.planning ? context.planning.ID : null,
    context.planningIssue ? context.planningIssue.ID : null,
    isLoading,
  ])

  React.useEffect(() => {
    if (estimatedTime === 0 && context.isPlanningExist) {
      context.planning
        ? setEstimatedTime(context.planning.Estimation)
        : setEstimatedTime(context.planningIssue.Estimate)
    }
  }, [
    context.planning ? context.planning.ID : null,
    context.planningIssue ? context.planningIssue.ID : null,
    estimatedTime,
    isLoading,
  ])

  const dispatch = useDispatch()

  const setTutorialWithSearchBarCompleted = React.useCallback(() => {
    if (userSettings.isShowedSearchBarTutorial === 'off') {
      const action = userActions.handleUserSettings.request([{ Key: 'isShowedSearchBarTutorial', Value: 'on' }])
      dispatch(action)
    }
  }, [dispatch, userSettings])

  const setTaskStatus = (itemStatus: INamedID) => {
    setIssueStatusState(itemStatus)
  }

  const changeComment = (newText: string) => {
    setComment(newText)
  }

  const updateEstimatedTime = (value: number) => {
    setEstimatedTime(Math.round(value))
  }

  const setTgTrackerTaskStatusToInProgress = () => {
    if (projectDetailsArr && projectDetailsArr.TrackerType === 'TGTRACKER' && projectDetailsArr.IssueStatuses) {
      setTaskStatus({
        ID: 2,
        Name: 'In Progress',
      })
    }
  }

  const updatePlanning = () => {
    if (!context.isPlanningExist) {
      return
    }

    if (estimatedTime < getFullSpentTime(context.planning)) {
      setEstimationError(
        `Sorry, but planned time cannot be less then spent time. Please plan at least ${formatTime(
          getFullSpentTime(context.planning),
          'Hh Mm',
        )}.`,
      )
      return
    }

    const { ProjectID, TrackerID } = context.planning ? context.planning : context.planningIssue
    const storedSettings = props.projectsSettings.find(p => p.project === `${ProjectID}-${TrackerID}`)
    const maxTime = storedSettings.settings.find(s => s.Key === 'planning-max')

    if (maxPlanningTime === 0) {
      setEstimationError(`You are allowed to report ${+maxTime.Value || 23.59} hours per day to this project`)
      return
    }

    changeComment(comment)

    context.planning.OpenComment = comment

    props.handleEditPlanning({
      Estimation: estimatedTime,
      PlanningID: context.planning.ID,
      Reason: comment,
    })

    if (issueStatus) {
      props.setStatus({
        ProjectID: selectedProject.ProjectID,
        TrackerID: selectedProject.TrackerID,
        IssueID: context.planning.IssueID,
        IssueStatus: issueStatus,
      })
    }

    if (issuePriority) {
      props.setPriority({
        ProjectID: selectedProject.ProjectID,
        TrackerID: selectedProject.TrackerID,
        IssueID: context.planning.IssueID,
        IssuePriority: issuePriority,
      })
    }

    context.onClose()
  }

  const createPlanning = (option: 'start' | 'plan') => {
    if (context.isPlanningExist) {
      return
    }

    if (estimatedTime < 60) {
      setEstimationError('Sorry, but planned time cannot be zero.')
      return
    }

    const taskPayload = {
      ProjectID: context.planningIssue.ProjectID,
      TrackerID: context.planningIssue.TrackerID,
      IssueID: context.planningIssue.ID,
      IssueTitle: context.planningIssue.Title,
      IssueURL: context.planningIssue.URL,
      IssueEstimation: context.planningIssue.Estimate || estimatedTime,
      IssueDueDate: context.planningIssue.DueDate,
      IssueSpent: context.planningIssue.Spent,
      IssueDone: context.planningIssue.Done,
      IssuePriorities: issuePriority,
      IssueStatuses: issueStatus,
      IssueTypes: issueType,
      ActivityID: 0,
      Estimation: estimatedTime,
      Comment: comment,
    }

    if (issueStatus) {
      props.setStatus({
        ProjectID: selectedProject.ProjectID,
        TrackerID: selectedProject.TrackerID,
        IssueID: context.planningIssue.ID,
        IssueStatus: issueStatus,
      })
    }

    if (issuePriority) {
      props.setPriority({
        ProjectID: selectedProject.ProjectID,
        TrackerID: selectedProject.TrackerID,
        IssueID: context.planningIssue.ID,
        IssuePriority: issuePriority,
      })
    }

    if (option === 'plan') {
      props.createPlanning([{ task: taskPayload, isStarted: false }])
      props.addHighlightedPlanning(context.planningIssue.ID)
    } else {
      props.createPlanning([{ task: taskPayload, isStarted: true }])
    }

    context.onClose()
  }

  return (
    <>
      <Header
        title={context.isPlanningExist ? 'Edit Planning' : 'Planning'}
        onClose={context.onClose}
        projectDetails={projectDetailsArr}
        modalType="update"
        setPriority={setIssuePriority}
        priority={issuePriority}
        projectItemId={projectItemId}
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {context.planning ? (
            <IssueBlock
              projectTitle={context.project.Name}
              title={context.planning ? context.planning.IssueTitle : context.planningIssue.Title}
              trackerType={context.project.TrackerType}
              planned={getFullSpentTime(context.planning)}
            />
          ) : (
            <IssueBlock
              projectTitle={context.project.Name}
              title={context.planningIssue.Title}
              trackerType={context.project.TrackerType}
              estimation={context.planningIssue.Estimate}
            />
          )}
          <div className={styles.timeInfo}>
            <div className={styles.timeTitle}>
              <IconWrapper name="schedule" />
              <span>Today Planned</span>
            </div>
            <div className={styles.timeInput}>
              <TimeSelector
                field="plan"
                value={estimatedTime}
                updateTime={updateEstimatedTime}
                maxTime={maxPlanningTime * 3600}
                minTime={getFullSpentTime(context.planning)}
              />
            </div>
            {estimationError && <span className={styles.errorMessage}>{estimationError}</span>}
          </div>
          <Comment placeholder="What do you plan to do?" value={comment} changeValue={changeComment} />
          {isIssueStatusInit && (
            <div className={styles.issueStatusContainer}>
              {!_.isEmpty(projectDetailsArr.IssueStatuses) && (
                <BaseIssueStatePicker
                  title="Status"
                  item={issueStatus}
                  projectItemsArr={projectDetailsArr.IssueStatuses}
                  setItem={setTaskStatus}
                  projectItemId={projectItemId}
                />
              )}
              {!_.isEmpty(projectDetailsArr.IssueTypes) && (
                <BaseIssueStatePicker
                  title="Issue type"
                  item={issueType}
                  projectItemsArr={projectDetailsArr.IssueTypes}
                  setItem={setIssueType}
                  projectItemId={projectItemId}
                />
              )}
              {/* {projectDetailsArr.ActivityTypes && (
                <BaseIssueStatePicker
                  title="Activity"
                  item={issueActivity}
                  projectItemsArr={projectDetailsArr.ActivityTypes}
                  setItem={setTaskActivity}
                  projectItemId={projectItemId}
                />
              )} */}
            </div>
          )}
          <div className={styles.confirmContainer}>
            <div className={styles.divider} />
            {context.isPlanningExist ? (
              <button className={styles.reportBtn} onClick={updatePlanning}>
                Save changes
              </button>
            ) : (
              <div className={styles.footerBlock}>
                <button
                  className={styles.reportBtn}
                  onClick={() => {
                    createPlanning('start')
                    setTutorialWithSearchBarCompleted()
                  }}
                >
                  Start
                </button>
                <div
                  className={styles.planBtn}
                  onClick={() => {
                    createPlanning('plan')
                    setTutorialWithSearchBarCompleted()
                  }}
                >
                  <IconWrapper name="playlist_add" />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Update))
