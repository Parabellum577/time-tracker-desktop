import * as React from 'react'

import { formatTime } from '@services/formater'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

interface IIssueBlockProps {
  title: string
  trackerType: string
  projectTitle: string
}

interface IIssueBlockWithPlannedTime {
  planned: number
}

interface IIssueBlockWithEstimation {
  estimation: number
}

const IssueBlock: React.FC<IIssueBlockProps & (IIssueBlockWithPlannedTime | IIssueBlockWithEstimation)> = props => {
  return (
    <div className={styles.issueBlock}>
      <div className={styles.projectInfo}>
        <IconWrapper name={props.trackerType} height="20px" />
        <span>{props.projectTitle}</span>
      </div>
      <div className={styles.issueInfo}>
        <span className={styles.issueTitle}>{props.title}</span>
        {'estimation' in props ? (
          <span className={styles.time}>{formatTime(props.estimation, 'H')}</span>
        ) : (
          <span className={styles.time}>Spent: {formatTime(props.planned, 'H:MM:SS')}</span>
        )}
      </div>
    </div>
  )
}

export default React.memo(IssueBlock)
