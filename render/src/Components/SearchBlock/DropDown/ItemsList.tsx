import * as React from 'react'
import * as _ from 'lodash'
import { IProject, IProjectIssue } from '@services/types'
import Issue from '@components/Issue'
import Project from '@components/Project'
import * as InfiniteScroll from 'react-infinite-scroller'

const styles = require('./items-list.module.scss')

interface IProjectExtendedIssue extends IProjectIssue {
  isAlreadyPlanned?: boolean
  isBookmarked?: boolean
}

interface IOwnProps {
  page: 'MAIN_PAGE' | 'PROJECTS_PAGE' | 'ISSUES_PAGE'
  projects: IProject[]
  issues: IProjectExtendedIssue[]
  chooseProject: (project: IProject) => void
  getHighlightedText: (text: string) => JSX.Element
  selectedProject: IProject
  chooseTask: (task: IProjectIssue) => void
  searchValue: string
  sortingType: string
  isReverseSorting: boolean
}

const renderLimitCount: number = 20

type IItemsListProps = IOwnProps

const ItemsList: React.FC<IItemsListProps> = props => {
  const [renderLimit, setRenderLimit] = React.useState(renderLimitCount)

  React.useEffect(() => {
    setRenderLimit(20) // init  value
  }, [props.page])

  const loadMore = () => {
    setRenderLimit(renderLimit + 20)
  }

  const hasMoreUpdates =
    props.page === 'PROJECTS_PAGE' ? props.projects.length > renderLimit : props.issues.length > renderLimit

  return (
    <>
      <InfiniteScroll pageStart={0} loadMore={loadMore} hasMore={hasMoreUpdates} loader={null} useWindow={false}>
        {props.page === 'PROJECTS_PAGE' ? (
          <div className={styles.mainContent}>
            {_.take(props.projects, renderLimit).map((project, index) => (
              <Project
                key={`${project.ProjectID}-${project.TrackerID}-${index}`}
                project={project}
                chooseProject={props.chooseProject}
                getHighlightedText={props.getHighlightedText}
                selectedProject={props.selectedProject}
                renderFromPage="ASSIGN_COLD_START"
              />
            ))}
          </div>
        ) : (
          <>
            {_.take(props.issues, renderLimit).map((issue, index) => (
              <Issue
                ProjectID={props.selectedProject && props.selectedProject.ProjectID}
                TrackerID={props.selectedProject && props.selectedProject.TrackerID}
                chooseTask={props.chooseTask}
                task={issue}
                key={`issue-${issue.ID}-${index}`}
                searchValue={props.searchValue}
                renderFromPage="ASSIGN_COLD_START"
              />
            ))}
          </>
        )}
      </InfiniteScroll>
    </>
  )
}

export default React.memo(ItemsList)
