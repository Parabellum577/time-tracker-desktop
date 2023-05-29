import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import classNames from 'classnames'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import * as _ from 'lodash'

import { openExternal } from '@services/openWindow'
import IconWrapper from '@components/IconWrapper'
import * as planningsActions from '@store/plannings/actions'
import * as bookmarksActions from '@store/bookmarks/actions'
import * as alertActions from '@store/alerts/actions'
import { RootAction, IRootState } from '@store/rootReducer'
import { formatTime } from '@services/formater'
import { IPlanning, IFullIssue, ITrackerWithStatus } from '@types'
import CreateModal from '@components/PlanningModal'
import { getFullSpentTime, openUrlByTask, isSameTask, isOutdated } from '@services/helpers'
import api from '@services/api'
import Hint from '@components/Hint'

const styles = require('./planning.module.scss')

interface IOwnProps {
  isSimplePlanning?: boolean
  issue?: IFullIssue
  key: number | string
  planning?: IPlanning
  isHighLighted?: boolean
}

interface IPlanningState {
  anchorEl: null | HTMLElement
  hasBookmark: boolean
  isUpdateModalOpened: boolean
  isMenuDropDownOpened: boolean
  isPlanModalOpened: boolean
  isRemoveModalOpened: boolean
  isReportModalOpened: boolean
  planningIssue: IFullIssue
  hasHighlight: boolean
  Comment: string
  integration: ITrackerWithStatus
}

const mapStateToProps = (state: IRootState) => ({
  bookmarks: state.bookmarks.extendedBookmarks,
  userTrackers: state.trackers.userTrackers,
  highlightedPlanning: state.plannings.highlightedPlanning,
  projects: state.projects.projects,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      handleBookmark: bookmarksActions.handleBookmark.request,
      createPlannings: planningsActions.createPlannings.request,
      setExtra: planningsActions.setExtra,
      startPlanning: planningsActions.startPlanning.request,
      stopPlanning: planningsActions.stopPlanning.request,
      removeHighlightedPlanning: planningsActions.removeHighlightedPlanning,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

type IPlanningProps = IOwnProps & ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

class Planning extends React.PureComponent<IPlanningProps, IPlanningState> {
  get isUnreportedPlanning() {
    if (
      this.props.planning &&
      !this.props.planning.Active &&
      getFullSpentTime(this.props.planning) > 0 &&
      this.props.planning.Outdated
    ) {
      return true
    } else {
      return false
    }
  }

  get nameOfProject() {
    let projectID: string
    let trackerID: number
    if (this.props.planning) {
      projectID = this.props.planning.ProjectID
      trackerID = this.props.planning.TrackerID
    } else {
      projectID = this.props.issue.ProjectID
      trackerID = this.props.issue.TrackerID
    }
    const project = this.props.projects.find(p => p.ProjectID === projectID && p.TrackerID === trackerID)
    const vaToReturn = project ? project.Name : 'Project not found'
    return vaToReturn
  }

  public state: IPlanningState = {
    anchorEl: null,
    hasBookmark: false,
    isUpdateModalOpened: false,
    isMenuDropDownOpened: false,
    isPlanModalOpened: false,
    isRemoveModalOpened: false,
    isReportModalOpened: false,
    planningIssue: null,
    integration: null,
    Comment: '',
    hasHighlight: false,
  }

  public updatePlanningComment = _.debounce(async () => {
    try {
      const payload = {
        Estimation: this.props.planning.Estimation,
        PlanningID: this.props.planning.ID,
        Reason: this.state.Comment,
      }
      await api.planning.SetExtra(payload)
      this.props.setExtra(payload)
    } catch (error) {
      console.error(error)
      this.props.showAlert({ alertType: 'error', alertMessage: error.message })
    }
  }, 300)

  public clickStartStopHandler = _.throttle((event: React.MouseEvent<HTMLDivElement>) => {
    if (this.props.issue) {
      this.clickAddHandler()
    } else {
      if (isOutdated(this.props.planning) && getFullSpentTime(this.props.planning) > 0) {
        this.openReportModalAndAnchor()
        return
      } else if (isOutdated(this.props.planning) || this.props.planning.Status === 'CLOSED') {
        return
      }

      if (this.props.planning.Active) {
        this.props.stopPlanning()
      } else {
        this.props.startPlanning({ PlanningID: this.props.planning.ID })
      }
    }
  }, 1300)

  public updatePlanningEstimation = async (Estimation: number) => {
    if (Estimation === this.props.planning.Estimation) {
      return
    }
    try {
      const payload = { Estimation, PlanningID: this.props.planning.ID, Reason: this.state.Comment }
      await api.planning.SetExtra(payload)
      this.props.setExtra(payload)
    } catch (error) {
      console.error(error)
      this.props.showAlert({ alertType: 'error', alertMessage: error.message })
    }
  }

  public changeComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ Comment: e.target.value })
    this.updatePlanningComment()
  }

  public componentDidMount = () => {
    const { highlightedPlanning, planning, issue, removeHighlightedPlanning, userTrackers } = this.props
    if (highlightedPlanning && planning && planning.IssueID === highlightedPlanning) {
      setTimeout(removeHighlightedPlanning, 1000)
    }
    this.handleBookmarkState()
    const TrackerID = issue ? issue.TrackerID : planning.TrackerID
    const integration = userTrackers.find(tracker => tracker.ID === TrackerID)
    this.setState({ integration, Comment: planning ? planning.LastReason : '' })
  }

  public componentDidUpdate = (prevProps: IPlanningProps, prevState: IPlanningState) => {
    const { bookmarks, issue, planning, userTrackers } = this.props
    if (prevProps.bookmarks !== bookmarks) {
      this.handleBookmarkState()
    }
    if (prevProps.userTrackers !== userTrackers) {
      const TrackerID = issue ? issue.TrackerID : planning.TrackerID
      const integration = userTrackers.find(tracker => tracker.ID === TrackerID)
      this.setState({ integration })
    }
    if (prevProps.planning && planning && prevProps.planning.LastReason !== planning.LastReason) {
      this.setState({ Comment: planning.LastReason })
    }
  }

  public handleBookmarkState = () => {
    let isBookmark = false
    const { issue, planning, bookmarks } = this.props
    isBookmark = bookmarks.some(b =>
      isSameTask({ ...b, IssueID: b.ID }, issue ? { ...issue, IssueID: issue.ID } : planning),
    )
    this.setState({ hasBookmark: isBookmark })
  }

  public openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  public closeMenu = () => {
    this.setState({
      isUpdateModalOpened: false,
      isPlanModalOpened: false,
      isReportModalOpened: false,
      isRemoveModalOpened: false,
    })
  }

  public clickAddHandler = () => {
    const { issue } = this.props

    const taskPayload = {
      ProjectID: issue.ProjectID,
      TrackerID: issue.TrackerID,
      IssueID: issue.ID,
      IssueTitle: issue.Title,
      IssueURL: issue.URL,
      IssueEstimation: issue.Estimate || 24 * 3600,
      IssueDueDate: issue.DueDate,
      IssueSpent: issue.Spent,
      IssueDone: issue.Done,
      IssuePriorities: issue.Priority,
      IssueStatuses: issue.Status,
      IssueTypes: issue.Type,
      ActivityID: 0,
      // Estimation: 3600,
      Estimation: 24 * 3600,
      Comment: '',
    }

    this.props.createPlannings([{ task: taskPayload, isStarted: true }])
  }

  public getProgressBarStyles = () => {
    const { planning, issue } = this.props
    if (planning) {
      const spent = getFullSpentTime(planning)
      const estimation = planning.Estimation
      const progress = Math.min(estimation, spent) / Math.max(estimation, spent)
      return { width: `${100 * progress}%` }
    } else if (issue) {
      const { Estimate, Spent } = issue

      if (Estimate === 0 && Spent === 0) {
        return { width: 0 }
      }

      if (Spent > 0 && Estimate === 0) {
        return { width: `100%` }
      }

      const progress = Math.min(Estimate, Spent) / Math.max(Estimate, Spent)
      return { width: `${100 * progress}%` }
    }
  }

  public openReportModal = () => {
    this.setState({ isReportModalOpened: true })
  }

  public openReportModalAndAnchor = () => {
    console.log('Planning -> publicopenReportModalAndAnchor -> openReportModalAndAnchor')
    this.setState({ isReportModalOpened: true, anchorEl: null })
  }

  public handleEditAndPlanModals = () => {
    if (this.props.planning && !this.props.planning.Outdated) {
      this.setState({ isUpdateModalOpened: true, anchorEl: null })
    } else if (this.props.issue) {
      this.clickAddHandler()
    }
  }

  public isExpired(tolerance: number = 0): boolean {
    const { planning, issue } = this.props

    const spent = planning ? getFullSpentTime(planning) : issue.Spent
    const estimation = planning ? planning.Estimation : issue.Estimate

    if (issue && spent > 0 && estimation === 0) {
      return false
    }

    return spent > estimation
  }

  public handlePlanningURL = async () => {
    openUrlByTask(this.props.planning, this.props.issue, this.props.userTrackers)
  }

  public handleBookmark = () => {
    const { issue, planning } = this.props
    let issuePayload: IFullIssue
    if (planning) {
      issuePayload = {
        TrackerID: planning.TrackerID,
        ProjectID: planning.ProjectID,
        Done: planning.IssueDone,
        DueDate: planning.IssueDueDate,
        Estimate: planning.IssueEstimation,
        ID: planning.IssueID,
        IsAssigned: true,
        Priority: planning.IssuePriorities,
        Spent: getFullSpentTime(planning),
        Status: planning.IssueStatuses,
        Title: planning.IssueTitle,
        Type: planning.IssueTypes,
        Activity: planning.IssueActivities,
        URL: planning.IssueURL,
      }
    } else {
      issuePayload = issue
    }
    this.props.handleBookmark(issuePayload)
  }
  public getProject = () => {
    if (this.props.planning) {
      return this.props.projects.find(
        p => p.ProjectID === this.props.planning.ProjectID && p.TrackerID === this.props.planning.TrackerID,
      )
    } else if (this.state.planningIssue) {
      return this.props.projects.find(
        p => p.ProjectID === this.state.planningIssue.ProjectID && p.TrackerID === this.state.planningIssue.TrackerID,
      )
    } else {
      return null
    }
  }

  public render() {
    let { integration } = this.state
    const { planning, issue, highlightedPlanning, isSimplePlanning } = this.props
    const hasHighlight = highlightedPlanning && planning && planning.IssueID === highlightedPlanning
    // if (issue) {
    //   integration = userTrackers.find(tracker => tracker.ID === issue.TrackerID)
    // } else {
    //   // overSpendTime = getFullSpentTime(this.props.planning) - planning.Estimation
    //   integration = userTrackers.find(tracker => tracker.ID === planning.TrackerID)
    // }
    if (!integration) {
      integration = {
        CredentialType: null,
        Data: null,
        Error: null,
        ID: null,
        ParentID: null,
        Status: null,
        TrackerUserMail: null,
        Type: 'noIcon',
        URL: null,
      }
    }

    return (
      <div
        className={classNames(styles.container, {
          [styles.active]: planning && planning.Active,
          [styles.highlighted]: hasHighlight,
        })}
      >
        <div className={styles.block}>
          {!isSimplePlanning && (
            <Hint hintText={planning && planning.Active ? 'Pause tracking' : 'Start tracking'} position="left">
              <div
                className={classNames(styles.activateButton, {
                  [styles.active]: planning && planning.Active,
                })}
                onClick={this.clickStartStopHandler}
              >
                <IconWrapper
                  name={planning && planning.Active ? 'pauseIcon' : 'playIcon'}
                  key={planning ? `planning-${planning.Active}` : `issue-${issue.ID}`}
                  classes={styles.playPauseIcon}
                />
              </div>
            </Hint>
          )}
          <div
            className={classNames(styles.content, {
              [styles.fullWidth]: isSimplePlanning,
            })}
          >
            <div
              className={styles.title}
              onClick={this.handlePlanningURL}
              title={issue ? issue.Title : planning.IssueTitle}
            >
              <IconWrapper name={integration.Type} classes={styles.integrationIcon} />
              <span style={{ maxWidth: issue || getFullSpentTime(planning) === 0 ? '340px' : '310px' }}>
                {issue ? issue.Title : planning.IssueTitle}
              </span>
            </div>
            <div className={styles.subtitle}>
              <div>
                <IconWrapper
                  name="star"
                  title={this.state.hasBookmark ? 'Remove from Favorites' : 'Add to Favorites'}
                  classes={classNames(styles.star, {
                    [styles.bookmark]: this.state.hasBookmark,
                  })}
                  onClick={this.handleBookmark}
                />
                <p title="Project name">{this.nameOfProject}</p>
                <IconWrapper name="fiber_manual_record" classes={styles.dot} />
                <p title="Task ID">{issue ? issue.ID : planning.IssueID}</p>
              </div>
              <div className={styles.estimBlock}>
                {planning ? (
                  planning.Active ? (
                    <>
                      <Hint hintText="Total time spent on the task / Estimation" position="right">
                        <p>
                          <span
                            className={
                              planning.IssueSpent + getFullSpentTime(planning) > planning.IssueEstimation &&
                              styles.overSpendTime
                            }
                          >
                            {formatTime(planning.IssueSpent + getFullSpentTime(planning), 'h')}
                          </span>
                          {' / '}
                          {formatTime(planning.IssueEstimation, 'H')}
                        </p>
                      </Hint>
                      <Hint hintText="Tracked today" position="right">
                        <p className={classNames(styles.spentTime)}>
                          {formatTime(getFullSpentTime(planning), 'H:MM:SS')}
                        </p>
                      </Hint>
                    </>
                  ) : (
                    <>
                      <Hint hintText="Estimation" position="right">
                        <p>Estimate: {formatTime(planning.IssueEstimation, 'H')}</p>
                      </Hint>
                      <Hint hintText="Total time spent on the task" position="right">
                        <p className={styles.spentTime}>
                          {formatTime(planning.IssueSpent + getFullSpentTime(planning), 'Hh Mm')}
                        </p>
                      </Hint>
                    </>
                  )
                ) : (
                  <>
                    <Hint hintText="Estimation" position="right">
                      <p>Estimate: {formatTime(issue.Estimate, 'H')}</p>
                    </Hint>
                    <Hint hintText="Total time spent on the task" position="right">
                      <p>{formatTime(issue.Spent, 'Hh Mm')}</p>
                    </Hint>
                  </>
                )}
              </div>
            </div>
          </div>
          {planning && getFullSpentTime(planning) > 0 && (
            <Hint hintText="Report tracked time" position="right">
              <div className={styles.reportBlock}>
                {planning && <IconWrapper name="check" classes={styles.reportIcon} onClick={this.openReportModal} />}
                {this.isUnreportedPlanning && <IconWrapper name="fiber_manual_record" classes={styles.warningDot} />}
              </div>
            </Hint>
          )}
          {this.state.isReportModalOpened && (
            <CreateModal
              onClose={this.closeMenu}
              planning={planning}
              planningIssue={this.state.planningIssue}
              trackerType={integration.Type}
              type="report"
              project={this.getProject()}
            />
          )}
          {this.state.isUpdateModalOpened && (
            <CreateModal
              onClose={this.closeMenu}
              planning={planning}
              planningIssue={this.state.planningIssue}
              trackerType={integration.Type}
              type="update"
              project={this.getProject()}
              isPlanningExist={!!this.props.planning}
            />
          )}
          {/* {this.state.isRemoveModalOpened && (
            <CreateModal onClose={this.closeMenu} planning={planning} trackerType={integration.Type} type="remove" />
          )} */}
        </div>
        {!this.props.isSimplePlanning && (
          <div
            className={classNames(styles.progressBar, {
              [styles.expiredProgressBar]: this.isExpired(),
            })}
          >
            <div className={styles.value} style={this.getProgressBarStyles()} />
          </div>
        )}
        {planning && planning.Active && (
          <div className={styles.quickEditContainer}>
            <div className={styles.buttonContainer}>
              {[1, 2, 4, 6, 8].map(value =>
                getFullSpentTime(planning) <= value * 3600 ? (
                  <Hint key={value} hintText={`Set today planned time to ${value}h`} position="left">
                    <button
                      className={classNames(planning.Estimation === value * 3600 && styles.active)}
                      onClick={() => this.updatePlanningEstimation(value * 3600)}
                    >
                      {value}h
                    </button>
                  </Hint>
                ) : null,
              )}
              <Hint hintText="Edit today planned time" position="left">
                <button onClick={() => this.handleEditAndPlanModals()}>
                  <IconWrapper name={'edit'} classes={styles.editIcon} />
                </button>
              </Hint>
            </div>
            <Hint hintText="What do you plan to do?" position="left">
              <input
                type="text"
                placeholder="Comment"
                maxLength={250}
                value={this.state.Comment}
                onChange={this.changeComment}
              />
            </Hint>
          </div>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Planning)
