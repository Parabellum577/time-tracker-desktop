import * as React from 'react'
import { connect } from 'react-redux'
import * as _ from 'lodash'

import Header from '../Header'
import Comment from '../Comment'
import Spinner from '@components/Spinner'
import { IRootState, RootAction } from '@store/rootReducer'
import { bindActionCreators, Dispatch } from 'redux'
import SearchBlock from '@components/SearchBlock'
import * as planningsActions from '@store/plannings/actions'
import * as alertActions from '@store/alerts/actions'
import * as projectActions from '@store/projects/actions'
import { ICreatePlanningPayload } from '@services/api-types'
import TimeSelector from '@components/TimeSelector'
import IconWrapper from '@components/IconWrapper'
import api from '@api'
import { ModalContext } from '../index'
import time from '@services/time'
import { INamedID, IProjectIssue, IProjectDetails } from '@services/types'
import BaseIssueStatePicker from '../BaseIssueStatePicker'
import { isTrackerWithDisableDetails, getFullSpentTime } from '@services/helpers'

const styles = require('./create.module.scss')

interface ITimeInputBlock {
  title: string
  value: number
  maxTime: number
  field: 'estimate' | 'plan'
  updateTime: (value: number) => void
}

const mapStateToProps = (state: IRootState) => ({
  projects: state.projects.projects,
  projectsSettings: state.projects.projectsSettings,
  openPlannings: state.plannings.openPlannings,
  closedPlannings: state.plannings.closedPlannings,
  currentUser: state.user.currentUser,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      createPlanning: planningsActions.createPlannings.request,
      showAlert: alertActions.showAlertMessage.request,
      getProjectSettings: projectActions.getProjectSettings.request,
    },
    dispatch,
  )

type ICreateProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

const Create: React.FC<ICreateProps> = props => {
  const context = React.useContext(ModalContext)
  const [selectedProject, setSelectedProject] = React.useState(context.project || null)
  const [selectedIssue, setSelectedIssue] = React.useState<IProjectIssue>(null)
  const [estimatedTime, setEstimatedTime] = React.useState(8 * 3600)
  const [plannedTime, setPlannedTime] = React.useState(8 * 3600)
  const [description, setDescription] = React.useState('')
  const [taskName, setTaskName] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSearchLoading, setIsSearchLoading] = React.useState(false)
  const [issuePriority, setIssuePriority] = React.useState<INamedID>(null)
  const [issueStatus, setIssueStatus] = React.useState<INamedID>(null)
  const [issueType, setIssueType] = React.useState<INamedID>(null)
  const [projectDetailsArr, setProjectDetails] = React.useState<IProjectDetails>(null)

  const isTaskDetailsAccess =
    selectedProject && props.projects && projectDetailsArr && isTrackerWithDisableDetails(projectDetailsArr.TrackerType)

  const projectItemId = projectDetailsArr ? `${projectDetailsArr.TrackerID} - ${projectDetailsArr.ID}` : null

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
      .catch(err => {
        console.error(err)
      })
  }, [selectedProject])

  React.useEffect(() => {
    setTgTrackerTaskStatusToInProgress()
  }, [projectDetailsArr])

  const handleTaskName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value)
  }

  const setDescriptionValue = (value: string) => {
    setDescription(value)
  }

  const setTgTrackerTaskStatusToInProgress = () => {
    if (projectDetailsArr && projectDetailsArr.TrackerType === 'TGTRACKER' && projectDetailsArr.IssueStatuses) {
      setIssueStatus({
        ID: 2,
        Name: 'In Progress',
      })
    }
  }

  const handleCreate = async (option: 'start' | 'plan') => {
    try {
      if (!selectedProject) {
        setError('Please select project for new task')
        return
      }

      const { ProjectID, TrackerID } = selectedProject

      if (!taskName) {
        setError('Please enter the task name')
        return
      }

      if (!plannedTime) {
        setError('Please set planned time for new task')
        return
      }

      setIsLoading(true)
      const createdIssue = await api.tracker.CreateIssue({
        TrackerID: selectedProject.TrackerID,
        ProjectID: selectedProject.ProjectID,
        Issue: {
          Title: taskName,
          Description: description,
          Estimate: estimatedTime,
          DueDate: time.now() + 86400 * 7, // one week from creation
          Status: issueStatus,
          Priority: issuePriority,
          Type: issueType ? issueType.ID : null,
          Assignee: selectedProject.UserID.toString(),
        },
      })

      if (issueStatus) {
        await api.tracker.SetStatus({
          ProjectID: selectedProject.ProjectID,
          TrackerID: selectedProject.TrackerID,
          IssueID: createdIssue.ID,
          IssueStatus: issueStatus,
        })
      }

      if (issuePriority) {
        await api.tracker.SetPriority({
          ProjectID: selectedProject.ProjectID,
          TrackerID: selectedProject.TrackerID,
          IssueID: createdIssue.ID,
          IssuePriority: issuePriority,
        })
      }

      const taskPayload: ICreatePlanningPayload = {
        TrackerID: selectedProject.TrackerID,
        ProjectID: selectedProject.ProjectID,
        IssueID: createdIssue.ID,
        IssueTitle: createdIssue.Title,
        IssueURL: createdIssue.URL,
        IssueEstimation: estimatedTime || plannedTime,
        IssueDueDate: createdIssue.DueDate,
        IssueSpent: createdIssue.Spent,
        IssueDone: createdIssue.Done,
        IssuePriorities: issuePriority,
        IssueStatuses: issueStatus,
        IssueTypes: issueType,
        ActivityID: 0,
        Estimation: plannedTime,
        Comment: '',
      }

      if (option === 'plan') {
        props.createPlanning([{ task: taskPayload, isStarted: false }])
      } else {
        props.createPlanning([{ task: taskPayload, isStarted: true }])
      }

      context.onClose()
      props.showAlert({ alertType: 'success', alertMessage: 'Planning successfully created' })
    } catch (error) {
      console.error(error)
      props.showAlert({ alertType: 'error', alertMessage: error.message })
      setIsLoading(false)
    }
  }

  const timeInputBlocks: ITimeInputBlock[] = [
    {
      title: 'Estimate',
      value: estimatedTime,
      maxTime: 999.99, // estimation limit in hours
      field: 'estimate',
      updateTime: value => setEstimatedTime(value),
    },
    {
      title: 'Today Planned',
      value: plannedTime,
      maxTime: 24,
      field: 'plan',
      updateTime: value => setPlannedTime(Math.round(value)),
    },
  ]

  return (
    <>
      <Header
        title="Create Task"
        modalType="create"
        onClose={context.onClose}
        projectDetails={projectDetailsArr}
        setPriority={setIssuePriority}
        priority={issuePriority}
        projectItemId={projectItemId}
      />
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.spinnerBlock}>
            <Spinner />
          </div>
        ) : (
          <>
            <input
              className={styles.projectBlock}
              placeholder="New Task"
              value={taskName}
              onChange={handleTaskName}
              maxLength={150}
            />
            <SearchBlock
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedIssue={selectedIssue}
              setSelectedIssue={setSelectedIssue}
              renderFromPage="CREATE_TASK"
              isLoading={isSearchLoading}
              setIsLoading={setIsSearchLoading}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
            {!isSearchLoading && (
              <>
                <div className={styles.descriptionBlock}>
                  {timeInputBlocks.map(block => (
                    <div className={styles.timeInfo} key={`timeInput-${block.title}`}>
                      <div className={styles.timeTitle}>
                        <IconWrapper name="schedule" />
                        <span>{block.title}</span>
                      </div>
                      <TimeSelector
                        field={block.field}
                        value={block.value}
                        updateTime={block.updateTime}
                        maxTime={block.maxTime * 3600}
                        minTime={0}
                        renderFromPage="CREATE_TASK"
                      />
                    </div>
                  ))}
                </div>
                <Comment placeholder="Write a task description" value={description} changeValue={setDescriptionValue} />
                {isTaskDetailsAccess && (
                  <div className={styles.projectStatusContainer}>
                    {!_.isEmpty(projectDetailsArr.IssueStatuses) && (
                      <BaseIssueStatePicker
                        title="Status"
                        item={issueStatus}
                        setItem={setIssueStatus}
                        projectItemsArr={projectDetailsArr.IssueStatuses}
                        projectItemId={projectItemId}
                      />
                    )}
                    {!_.isEmpty(projectDetailsArr.IssueTypes) && (
                      <BaseIssueStatePicker
                        title="Issue type"
                        item={issueType}
                        setItem={setIssueType}
                        projectItemsArr={projectDetailsArr.IssueTypes}
                        projectItemId={projectItemId}
                      />
                    )}
                    {/* {projectDetailsArr.ActivityTypes && (
                      <BaseIssueStatePicker
                        title="Activity"
                        item={issueActivity}
                        setItem={setIssueActivity}
                        projectItemsArr={projectDetailsArr.ActivityTypes}
                        projectItemId={projectItemId}
                      />
                    )} */}
                  </div>
                )}
                <div className={styles.confirmContainer}>
                  <div className={styles.divider} />
                  <div className={styles.footerBlock}>
                    <button
                      className={styles.reportBtn}
                      onClick={() => {
                        handleCreate('start')
                      }}
                    >
                      Start
                    </button>
                    <div
                      className={styles.planBtn}
                      onClick={() => {
                        handleCreate('plan')
                      }}
                      title="Plan Task"
                    >
                      <IconWrapper name="playlist_add" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Create))
