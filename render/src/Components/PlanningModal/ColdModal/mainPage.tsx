import * as React from 'react'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as alertActions from '@store/alerts/actions'
import * as planningActions from '@store/plannings/actions'
import { IProjectIssue, IProject, INamedID, IProjectDetails } from '@services/types'
import IconWrapper from '@components/IconWrapper'
import TimeSelector from '@components/TimeSelector'
import { RootAction, IRootState } from '@store/rootReducer'
import { totalColdTime, isTrackerWithDisableDetails } from '@services/helpers'
import { formatTime } from '@services/formater'
import { ModalContext } from '../index'
import Comment from '../Comment'
import BaseIssueStatePicker from '../BaseIssueStatePicker'
import api from '@services/api'
const styles = require('./main-page.module.scss')

interface IOwnProps {
  selectedProject: IProject
  selectedIssue: IProjectIssue
  isLoading: boolean
  issuePriority: INamedID
  projectDetails: IProjectDetails
}

const mapStateToProps = (state: IRootState) => ({
  coldPlannings: state.plannings.coldPlannings,
  userInfo: state.user.currentUser,
  projects: state.projects.projects,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      showAlert: alertActions.showAlertMessage.request,
      reportColdPlannings: planningActions.reportColdPlannings.request,
      stopColdPlanning: planningActions.stopColdPlanning.request,
    },
    dispatch,
  )

type IMainPageProps = IOwnProps & ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

const MainPage: React.FC<IMainPageProps> = props => {
  const timeSelectorMenuEl = React.useRef(null)
  const context = React.useContext(ModalContext)
  const totalTime = totalColdTime(props.coldPlannings)
  const [maxTime, setMaxTime] = React.useState(totalTime)
  const [valueToReport, setValueToReport] = React.useState(totalTime)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [reportComment, setReportComment] = React.useState('')
  const [isMenuOpened, setMenuOpened] = React.useState(false)
  const [issueStatus, setIssueStatus] = React.useState<INamedID>(null)

  const isIssueStatusInit =
    props.selectedProject &&
    !props.selectedProject.ColdProject &&
    props.projectDetails &&
    isTrackerWithDisableDetails(props.projectDetails.TrackerType)

  const projectItemId = props.projectDetails ? `${props.projectDetails.TrackerID} - ${props.projectDetails.ID}` : null

  React.useEffect(() => {
    if (!props.selectedProject || !props.selectedIssue) {
      return
    }

    setIssueStatus(props.selectedIssue.Status)
    // setIssueActivity(issueActivity)
  }, [props.selectedProject, props.selectedIssue])

  React.useEffect(() => {
    if (valueToReport === maxTime && totalTime !== maxTime) {
      setValueToReport(totalTime)
      setMaxTime(totalTime)
    }
  }, props.coldPlannings)

  const detectOutClick = (e: React.MouseEvent) => {
    if (!timeSelectorMenuEl.current.contains(e.target as Node)) {
      setMenuOpened(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener<any>('click', detectOutClick)
    return () => {
      document.removeEventListener<any>('click', detectOutClick)
    }
  }, [])

  const timeSelectorMenuToggle = React.useCallback(() => {
    setMenuOpened(!isMenuOpened)
  }, [isMenuOpened])

  const handleReport = () => {
    props.reportColdPlannings({
      reportComment,
      valueToReport,
      selectedIssue: {
        ...props.selectedIssue,
        ProjectID: props.selectedProject.ProjectID,
        TrackerID: props.selectedProject.TrackerID,
        Status: issueStatus,
      },
    })

    context.onClose()
  }

  const chooseValueToReport = (nextValue: number, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    setValueToReport(nextValue)
    setAnchorEl(null)
  }

  const optionsMenu = [totalTime, (totalTime / 4) * 3, totalTime / 2, totalTime / 4]

  return props.isLoading ? null : (
    <div className={styles.mainPage}>
      <div className={styles.timeBlock}>
        <div className={styles.timeTitle}>
          <IconWrapper name="schedule" />
          <span>Cold Time</span>
        </div>
        <div className={styles.timeInput}>
          <TimeSelector
            maxTime={totalTime}
            minTime={0.1}
            value={valueToReport}
            field="plan"
            updateTime={setValueToReport}
            renderFromPage="ASSIGN_COLD_START"
            shouldForceUpdate={true}
          />
          <div
            className={styles.arrowBlock}
            ref={timeSelectorMenuEl}
            onClick={e => {
              setAnchorEl(e.currentTarget)
              timeSelectorMenuToggle()
            }}
          >
            <IconWrapper name="arrowDownIcon" classes={styles.arrowIconDark} />
          </div>
          {optionsMenu && isMenuOpened && (
            <ul className={styles.timeSelectorMenu}>
              {optionsMenu.map((option, index) => (
                <li key={index} onClick={e => chooseValueToReport(option, e)}>
                  <span>{formatTime(option, 'Hh Mm')}</span>
                  <span>{`${100 - index * 25}%`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Comment
        placeholder="What have you done?"
        value={reportComment}
        className={styles.commentBlock}
        changeValue={setReportComment}
      />
      {isIssueStatusInit && (
        <div className={styles.projectStatusContainer}>
          {!_.isEmpty(props.projectDetails.IssueStatuses) && (
            <BaseIssueStatePicker
              title="Status"
              item={issueStatus}
              setItem={setIssueStatus}
              projectItemsArr={props.projectDetails.IssueStatuses}
              projectItemId={projectItemId}
            />
          )}
          {/* {!_.isEmpty(props.projectDetails.IssueTypes) && (
            <BaseIssueStatePicker
              title="Issue type"
              item={issueType}
              setItem={setIssueType}
              projectItemsArr={props.projectDetails.IssueTypes}
              projectItemId={projectItemId}
            />
          )} */}
          {/* {props.projectDetails.ActivityTypes && (
            <BaseIssueStatePicker
              title="Activity"
              item={issueActivity}
              setItem={setIssueActivity}
              projectItemsArr={props.projectDetails.ActivityTypes}
              projectItemId={projectItemId}
            />
          )} */}
        </div>
      )}
      <div className={styles.confirmContainer}>
        <div className={styles.divider} />
        <button className={styles.assignBtn} onClick={handleReport}>
          Assign Time
        </button>
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MainPage))
