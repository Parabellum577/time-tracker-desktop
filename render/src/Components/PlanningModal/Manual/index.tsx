import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import Header from '../Header'
import Comment from '../Comment'
import TimeSelector from '@components/TimeSelector'
import time from '@services/time'
import IconWrapper from '@components/IconWrapper'
import SearchBlock from '@components/SearchBlock'
import { Range } from 'rc-slider'
import { IProjectIssue, IProject } from '@services/types'
import { IRootState, RootAction } from '@store/rootReducer'
import * as planningsActions from '@store/plannings/actions'
import { ModalContext } from '../index'

import 'rc-slider/assets/index.css' // required
import * as _ from 'lodash'

const styles = require('./styles.module.scss')

const mapStateToProps = (state: IRootState) => ({
  projects: state.projects.projects,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      reportManually: planningsActions.reportManually.request,
      setStatus: planningsActions.setStatus,
      setPriority: planningsActions.setPriority,
    },
    dispatch,
  )

type IManualModalProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Manual: React.FC<IManualModalProps> = props => {
  const context = React.useContext(ModalContext)
  const [startTime, setStartTime] = React.useState(context.startTime)
  const [endTime, setEndTime] = React.useState(context.endTime)
  const [comment, setComment] = React.useState('')
  const [selectedProject, setSelectedProject] = React.useState<IProject>(null)
  const [selectedIssue, setSelectedIssue] = React.useState<IProjectIssue>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  // This two hooks for Type and Activity of projects
  // const [selectedActivity, setSelectedActivity] = React.useState<INamedID>(null)
  // const [selectedType, setSelectedType] = React.useState<INamedID>(null)

  const changeComment = (newText: string) => {
    setComment(newText)
  }

  const updateTime = (start: number, end: number) => {
    const startValue = Math.min(start, end)
    const endValue = end
    context.updateTime(startValue, endValue)
    setStartTime(startValue)
    setEndTime(endValue)
  }

  const handleChangeBySlider = (value: number[]) => {
    updateTime(value[0], value[1])
  }

  const handleReport = () => {
    if (!selectedProject || !selectedIssue) {
      setError('Please select project and task')
      return
    }

    props.reportManually({
      StartTime: startTime,
      EndTime: endTime,
      ProjectID: selectedProject.ProjectID,
      TrackerID: selectedProject.TrackerID,
      SelectedIssue: selectedIssue,
      IssueStatus: selectedIssue.Status,
      IssuePriority: selectedIssue.Priority,
      Comment: comment || 'timetracker Report',
    })

    context.onClose()
  }

  return (
    <div>
      <Header
        title="Manual Report"
        modalType="manual"
        onClose={context.onClose}
        projectDetails={null}
        setPriority={null}
        priority={null}
        projectItemId={null}
      />
      <SearchBlock
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedIssue={selectedIssue}
        setSelectedIssue={setSelectedIssue}
        renderFromPage="MANUAL_REPORT"
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
      <div className={styles.timeContainer}>
        <div className={styles.timeSelectorContainer}>
          <div className={styles.timeTitle}>
            <IconWrapper name="schedule" />
            <span>Interval</span>
          </div>
          <div className={styles.interval}>
            <TimeSelector
              field="start"
              value={startTime}
              maxTime={time.now() - time.startOfDay()}
              minTime={0}
              shouldForceUpdate={true}
              updateTime={newStartTime => {
                updateTime(newStartTime, endTime)
              }}
              renderFromPage="MANUAL_REPORT"
            />
            <TimeSelector
              field="end"
              value={endTime}
              shouldForceUpdate={true}
              maxTime={time.now() - time.startOfDay()}
              minTime={0}
              updateTime={newEndTime => {
                updateTime(startTime, newEndTime)
              }}
              renderFromPage="MANUAL_REPORT"
            />
          </div>
          <div className={styles.sliderWrapper}>
            <Range
              min={0}
              max={time.todayDurationTime()}
              allowCross={true}
              value={[startTime, endTime]}
              onChange={([value1, value2]) => handleChangeBySlider([value1, value2])}
              railStyle={{ background: '#c3c9d4' }}
            />
          </div>
        </div>
        <div className={styles.totalTimeContainer}>
          <div className={styles.timeTitle}>
            <IconWrapper name="schedule" />
            <span>Total</span>
          </div>
          <div className={styles.timeInput}>
            <TimeSelector
              field="plan"
              value={endTime - startTime}
              shouldForceUpdate={true}
              maxTime={time.now() - time.startOfDay()}
              minTime={0}
              updateTime={newTotalTime => {
                const maxTime = time.now() - time.startOfDay()
                const currentTime = endTime - startTime
                const newEndTime = Math.min(endTime + Math.round((newTotalTime - currentTime) / 2), maxTime)
                const newStartTime = newEndTime - newTotalTime
                updateTime(newStartTime, newEndTime)
              }}
              renderFromPage="MANUAL_REPORT"
            />
          </div>
        </div>
      </div>
      <Comment placeholder="What did you do?" value={comment} changeValue={changeComment} />
      <div className={styles.assignContainer}>
        <div className={styles.divider} />
        <button className={styles.assignBtn} onClick={handleReport}>
          Report
        </button>
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Manual))
