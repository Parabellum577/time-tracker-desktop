import * as React from 'react'

import { IProject } from '@services/types'
import classNames from 'classnames'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

interface IProjectProps {
  project: IProject
  chooseProject: (project: IProject) => void
  getHighlightedText: (text: string) => JSX.Element
  selectedProject?: IProject
  renderFromPage: 'ASSIGN_COLD_START' | 'SEARCH_BAR'
  openSettings?: (project: IProject) => Promise<void>
  hideProject?: (project: IProject) => Promise<void>
}

const Project: React.FC<IProjectProps> = props => {
  return (
    <div
      onClick={() => props.chooseProject(props.project)}
      className={classNames({
        [styles.searchBarProjectItem]: props.renderFromPage === 'SEARCH_BAR',
        [styles.coldStartProjectItem]: props.renderFromPage === 'ASSIGN_COLD_START',
        [styles.coldProjectsItemError]: props.project.ProjectStatus !== 'ACTIVE',
      })}
      title={
        props.project.ProjectStatus !== 'ACTIVE'
          ? 'You got problems with current integration. Please, reintegrate this tracking system'
          : ''
      }
    >
      <div className={styles.projectContent}>
        <IconWrapper name={props.project.TrackerType} classes={styles.projectIcon} />
        <div className={styles.projectTitleBlock}>
          <p className={styles.projectName} title={props.project.Name.length > 40 ? props.project.Name : ''}>
            {props.getHighlightedText(props.project.Name)}
          </p>
          {props.project.Description && <p className={styles.projectDescription}>{props.project.Description}</p>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Project)
