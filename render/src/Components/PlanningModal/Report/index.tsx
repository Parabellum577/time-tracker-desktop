import * as React from 'react'
import * as _ from 'lodash'
import classNames from 'classnames'

import Header from '../Header'
import Comment from '../Comment'
import IssueBlock from '../IssueBlock'
import { IPlanning, IProjectDetails, INamedID } from '@services/types'
import TimeSelector from '@components/TimeSelector'
import Switch from '@material-ui/core/Switch'
import { getFullSpentTime, isTrackerWithDisableDetails } from '@services/helpers'
import time from '@services/time'
import IconWrapper from '@components/IconWrapper'
import { ModalContext } from '../index'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { formatTime } from '@services/formater'
import api from '@services/api'
import BaseIssueStatePicker from '../BaseIssueStatePicker'
import Spinner from '@components/Spinner'

const styles = require('./report.module.scss')

interface ITimeInputBlock {
  title: string
  titleIcon: string
  value: number
  maxTime: number
  readOnly: boolean
  field: 'plan' | 'estimate'
}

interface IReportModalProps {
  handleClosePlanning: (planning: IPlanning) => void
}

const getEditTimeByPlanning = (planning: IPlanning) => {
  const spentTime = getFullSpentTime(planning)
  const estimationTime = planning ? planning.Estimation || planning.IssueEstimation : 0
  return Math.max(spentTime, estimationTime)
}

const Report: React.FC<IReportModalProps> = props => {
  const context = React.useContext(ModalContext)
  const overSpendTime =
    getFullSpentTime(context.planning) - context.planning.Estimation >= 0
      ? getFullSpentTime(context.planning) - context.planning.Estimation
      : 0

  const [comment, setComment] = React.useState(context.planning.OpenComment)
  const [isOverSpendIncluded, setIsOverSpendIncluded] = React.useState(true)
  const [totalSpent, setTotalSpent] = React.useState(getFullSpentTime(context.planning) - overSpendTime)
  const [totalInTask, setTotalInTask] = React.useState(null)
  const [estimatedTime, setEstimatedTime] = React.useState(getEditTimeByPlanning(context.planning))
  const [issuePriority, setIssuePriority] = React.useState<INamedID>(null)
  const [issueStatus, setIssueStatus] = React.useState<INamedID>(null)
  const [issueType, setIssueType] = React.useState<INamedID>(null)
  const [projectDetailsArr, setProjectDetails] = React.useState<IProjectDetails>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const currentUser = useShallowEqualSelector(state => state.user.currentUser)
  const [selectedProject, setSelectedProject] = React.useState(context.project || null)
  const { TrackerID, ProjectID } = context.planning ? context.planning : context.planningIssue
  const IssueID = context.planning ? context.planning.IssueID : context.planningIssue.ID

  const isTaskDetailsAccess =
    selectedProject &&
    context.project &&
    projectDetailsArr &&
    isTrackerWithDisableDetails(projectDetailsArr.TrackerType)

  const projectItemId = projectDetailsArr ? `${projectDetailsArr.TrackerID} - ${projectDetailsArr.ID}` : null

  React.useEffect(() => {
    if (estimatedTime === 0 && context.isPlanningExist) {
      context.planning
        ? setEstimatedTime(context.planning.Estimation)
        : setEstimatedTime(context.planningIssue.Estimate)
    }
  }, [estimatedTime])

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
        if (setIssueStatus) {
          setIssueStatus(res.Status)
        }
        // if (setIssueType) {
        //   setIssueType(res.Type)
        // }
      })
  }, [
    context.planning ? context.planning.ID : null,
    context.planningIssue ? context.planningIssue.ID : null,
    isLoading,
  ])

  const defaultComment = `${currentUser.FirstName} reported ${formatTime(
    totalSpent,
    'Hh Mm',
  )}. ${time.todayDate()} from timetracker.`

  const changeComment = (newText: string) => {
    setComment(newText)
  }

  const updateTotalSpent = (value: number) => {
    setTotalSpent(value)
  }

  const reportPlanning = async () => {
    props.handleClosePlanning({
      ...context.planning,
      SpentManual: 0,
      SpentOffline: 0,
      SpentOnline: totalSpent,
      CloseComment: comment || defaultComment,
      IssuePriorities: issuePriority,
      IssueStatuses: issueStatus,
      // IssueTypes: issueType,
    })

    setTimeout(async () => {
      if (issueStatus) {
        await api.tracker.SetStatus({
          ProjectID: selectedProject.ProjectID,
          TrackerID: selectedProject.TrackerID,
          IssueID: context.planning.IssueID,
          IssueStatus: issueStatus,
        })
      }

      if (issuePriority) {
        await api.tracker.SetPriority({
          ProjectID: selectedProject.ProjectID,
          TrackerID: selectedProject.TrackerID,
          IssueID: context.planning.IssueID,
          IssuePriority: issuePriority,
        })
      }
    }, 2000)
  }

  const handleThumb = () => {
    setIsOverSpendIncluded(!isOverSpendIncluded)
  }

  const totalSpentBlock: ITimeInputBlock = {
    title: 'Total Spent Time',
    titleIcon: 'schedule',
    value: isOverSpendIncluded ? totalSpent + overSpendTime : totalSpent,
    maxTime: isOverSpendIncluded
      ? getFullSpentTime(context.planning)
      : getFullSpentTime(context.planning) - overSpendTime,
    readOnly: false,
    field: 'plan',
  }

  const exceededTimeBlock: ITimeInputBlock = {
    title: 'Exceeded Time',
    titleIcon: 'menuInfo',
    value: overSpendTime,
    maxTime: overSpendTime,
    readOnly: true,
    field: 'estimate',
  }

  const timeInputBlocks: ITimeInputBlock[] =
    overSpendTime > 0 ? [totalSpentBlock, exceededTimeBlock] : [totalSpentBlock]

  return (
    <>
      <Header
        title="Report"
        onClose={context.onClose}
        projectDetails={projectDetailsArr}
        modalType="report"
        setPriority={setIssuePriority}
        priority={issuePriority}
        projectItemId={projectItemId}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <IssueBlock
            projectTitle={context.project.Name}
            title={context.planning.IssueTitle}
            trackerType={context.trackerType}
            estimation={context.planning.Estimation || context.planning.IssueEstimation}
          />
          <div className={styles.descriptionBlock}>
            {timeInputBlocks.map(block => (
              <div className={styles.timeInfo} key={`timeInput-${block.title}`}>
                <div className={styles.timeTitle}>
                  <IconWrapper name={block.titleIcon} classes={block.titleIcon === 'menuInfo' && styles.infoIcon} />
                  <span>{block.title}</span>
                </div>
                <div
                  className={classNames(styles.timeInput, {
                    [styles.readOnlyBlock]: block.readOnly,
                  })}
                >
                  <TimeSelector
                    field={block.field}
                    value={block.value}
                    updateTime={block.field === 'plan' ? updateTotalSpent : null}
                    maxTime={block.maxTime}
                    minTime={0}
                    readOnly={block.readOnly}
                    renderFromPage="PLANNING_REPORT"
                    isOverSpendIncluded={isOverSpendIncluded}
                  />
                </div>
              </div>
            ))}
          </div>
          {overSpendTime > 0 && (
            <div className={styles.switchBlock} onClick={handleThumb}>
              <Switch
                classes={{
                  switchBase: styles.customSwitchBase,
                  bar: classNames(styles.customBar, {
                    [styles.customBarChecked]: isOverSpendIncluded,
                  }),
                  root: styles.customRoot,
                  icon: styles.customIcon,
                  iconChecked: styles.customIconChecked,
                  checked: styles.checkedBar,
                }}
                checked={isOverSpendIncluded}
              />
              <span className={styles.switchText}>Include in Report</span>
            </div>
          )}
          <Comment placeholder="What have you done?" value={comment} changeValue={changeComment} />
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
              {/* {projectDetailsArr.IssueTypes && (
            <BaseIssueStatePicker
              title="Issue type"
              item={issueType}
              setItem={setIssueType}
              projectItemsArr={projectDetailsArr.IssueTypes}
              projectItemId={projectItemId}
            />
          )} */}
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
            <button className={styles.reportBtn} onClick={reportPlanning}>
              Report
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default React.memo(Report)
