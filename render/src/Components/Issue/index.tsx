import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import classNames from 'classnames'

import { IProjectIssue } from '@services/types'
import { RootAction, IRootState } from '@store/rootReducer'
import * as bookmarksActions from '@store/bookmarks/actions'
import * as alertActions from '@store/alerts/actions'
import { formatTime, normalizeString } from '@services/formater'

const styles = require('./styles.module.scss')
import { openUrlByTask } from '@services/helpers'
const iconOpenTaskWeb = require('@images/df-icon-open-task-web.svg')

interface IProjectExtendedIssue extends IProjectIssue {
  isAlreadyPlanned?: boolean
  isBookmarked?: boolean
}

interface IOwnProps {
  isManualForm?: boolean
  task: IProjectExtendedIssue
  TrackerID: number
  ProjectID: string
  chooseTask: (task: IProjectIssue) => void
  searchValue: string
  renderFromPage: 'ASSIGN_COLD_START' | 'SEARCH_BAR'
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      showAlert: alertActions.showAlertMessage.request,
      handleBookmark: bookmarksActions.handleBookmark.request,
    },
    dispatch,
  )

const mapStateToProps = (state: IRootState) => ({
  bookmarks: state.bookmarks.extendedBookmarks,
  userTrackers: state.trackers.userTrackers,
})

type IIssueProps = IOwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Issue: React.FC<IIssueProps> = props => {
  const getHighlightedText = (text: string) => {
    if (!props.searchValue) {
      return <span>{text}</span>
    }

    const highlight = normalizeString(props.searchValue)
    const parts = highlight.length ? text.split(new RegExp(`(${highlight})`, 'gi')) : [text]
    return (
      <span>
        {parts.map((part, i) => (
          <span
            key={i}
            className={classNames({
              [styles.highlighted]: normalizeString(part.toLowerCase()) === highlight.toLowerCase(),
            })}
          >
            {part}
          </span>
        ))}
      </span>
    )
  }

  const changeBookmarkStatus = (task: IProjectExtendedIssue, event: React.MouseEvent) => {
    event.stopPropagation()
    const ProjectID = props.ProjectID
    const TrackerID = props.TrackerID
    props.handleBookmark({ ...task, ProjectID, TrackerID })
  }

  const openTaskInBrowser = (task: IProjectExtendedIssue) => {
    openUrlByTask(
      null,
      {
        ID: task.ID,
        ProjectID: props.ProjectID,
        TrackerID: props.TrackerID,
        URL: task.URL,
      },
      props.userTrackers,
    )
  }

  const isIssueBookmarked = () =>
    props.bookmarks.some(
      b =>
        b.ProjectID === props.ProjectID &&
        b.TrackerID === props.TrackerID &&
        b.Title === props.task.Title &&
        b.URL === props.task.URL,
    )

  return (
    <>
      <div
        onClick={props.task.isAlreadyPlanned ? null : () => props.chooseTask(props.task)}
        key={props.task.ID}
        className={classNames(styles.taskItem, {
          [styles.contentWithError]: props.task.isAlreadyPlanned,
          [styles.searchBarTask]: props.renderFromPage === 'SEARCH_BAR',
          [styles.coldStartTask]: props.renderFromPage === 'ASSIGN_COLD_START',
        })}
        title={props.task.isAlreadyPlanned ? 'The task has been already added' : `${props.task.Title}`}
      >
        <div className={styles.content}>
          <p className={styles.title}>{getHighlightedText(props.task.Title)}</p>
          <div className={styles.actions}>
            <div className={styles.idWrap}>
              <i
                className={classNames(styles.bookmarkIcon, {
                  [styles.bookmarked]: isIssueBookmarked(),
                })}
                onClick={e => changeBookmarkStatus(props.task, e)}
              >
                star
              </i>
              <p>{props.task.ID.substr(0, 7)}</p>
            </div>
            <div
              className={classNames({
                [styles.progress]: true,
                [styles.critical]: props.task.Priority.Name === 'Immediate',
                [styles.urgent]: props.task.Priority.Name === 'Urgent',
                [styles.high]: props.task.Priority.Name === 'High',
                [styles.critical]: props.task.Priority.Name === 'Critical',
                [styles.normal]: props.task.Priority.Name === 'Normal',
                [styles.low]: props.task.Priority.Name === 'Low',
              })}
            />
            <p>{props.task.Priority.Name || 'None'}</p>
          </div>
        </div>
        <div className={styles.time}>
          <p className={styles.estimate}>{`Estimate ${formatTime(props.task.Estimate, 'H')}`}</p>
          <p className={styles.spentTime}>{formatTime(props.task.Spent, 'H:M')}</p>
        </div>
        {props.task.URL && props.renderFromPage === 'SEARCH_BAR' && (
          <img
            className={styles.redirectBtn}
            onClick={e => {
              e.stopPropagation()
              openTaskInBrowser(props.task)
            }}
            src={iconOpenTaskWeb}
            alt="iconOpenTaskWeb"
          />
        )}
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Issue))
