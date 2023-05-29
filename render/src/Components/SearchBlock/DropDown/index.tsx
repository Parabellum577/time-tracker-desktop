import * as React from 'react'
import { connect } from 'react-redux'
import * as _ from 'lodash'
import classNames from 'classnames'

import { IProject, IProjectIssue } from '@services/types'
import IconWrapper from '@components/IconWrapper'
import ItemsList from './ItemsList'
import { IRootState } from '@store/rootReducer'
import Spinner from '@components/Spinner'
import { azSortByFieldList, onPlaceSortByRecent } from '@services/sort'

const styles = require('./styles.module.scss')

interface IOwnProps {
  page: 'MAIN_PAGE' | 'PROJECTS_PAGE' | 'ISSUES_PAGE'
  setPage: (page: 'MAIN_PAGE' | 'PROJECTS_PAGE' | 'ISSUES_PAGE') => void
  projectIssues: IProjectIssue[]
  chooseProject: (project: IProject) => void
  searchValue: string
  setSearchValue: (value: string) => void
  getHighlightedText: (text: string) => JSX.Element
  selectedProject: IProject
  chooseTask: (task: IProjectIssue) => void
  renderFromPage: 'ASSIGN_COLD_START' | 'MANUAL_REPORT' | 'CREATE_TASK' | 'PROJECT_PICKER'
  classNames?: {
    projectsListDropdown?: string
  }
}

const mapStateToProps = (state: IRootState) => ({
  projects: state.projects.projects,
  recent: state.recent.extendedRecent,
  currentUser: state.user.currentUser,
})

type IDropDownProps = IOwnProps & ReturnType<typeof mapStateToProps>

const DropDown: React.FC<IDropDownProps> = props => {
  const [isReverseSorting, setReverseSorting] = React.useState(false)
  const [sortingType, setSortingType] = React.useState('RECENT')
  const [isAssignedOnly, setisAssignedOnly] = React.useState(true)

  React.useEffect(() => {
    if (
      (props.page === 'PROJECTS_PAGE' && !props.projects) ||
      (props.page === 'ISSUES_PAGE' && _.isEmpty(props.projectIssues))
    ) {
      return () => {
        return
      }
    }
  }, [props.searchValue, sortingType, isReverseSorting, props.projectIssues, isAssignedOnly, props.page])

  const changeSortType = (newSortType: string) => {
    if (newSortType === sortingType) {
      setReverseSorting(!isReverseSorting)
    } else {
      setSortingType(newSortType)
      setReverseSorting(false)
    }
  }

  let userProjects: any[] = props.projects

  if (props.page === 'PROJECTS_PAGE') {
    let searchedProjects = props.projects
    if (props.searchValue) {
      searchedProjects = props.projects.filter(proj => {
        return proj.Name.toLowerCase().includes(props.searchValue.toLowerCase())
      })
    }

    const filteredProjects = searchedProjects.filter(p => {
      if (props.renderFromPage === 'ASSIGN_COLD_START') {
        return p.ProjectStatus !== 'ARCHIVED'
      } else {
        return p.ProjectStatus !== 'ARCHIVED' && !p.ColdProject
      }
    })

    if (sortingType === 'TRACKER') {
      filteredProjects.sort((a, b) => {
        const result = azSortByFieldList(a, b, ['TrackerID', 'Name'])
        return isReverseSorting ? result * -1 : result
      })
    } else if (sortingType === 'RECENT') {
      onPlaceSortByRecent(props.recent, filteredProjects)
      if (isReverseSorting) {
        filteredProjects.reverse()
      }
    }

    userProjects = filteredProjects
  }

  let pureIssues: any = props.projectIssues

  if (props.page === 'ISSUES_PAGE') {
    let searchedIssues = props.projectIssues

    if (isAssignedOnly) {
      searchedIssues = props.projectIssues.filter(issue => issue.IsAssigned)
    }

    if (props.searchValue) {
      searchedIssues = props.projectIssues.filter(proj => {
        return proj.Title.toLowerCase().includes(props.searchValue.toLowerCase())
      })
    }

    if (sortingType === 'TRACKER') {
      searchedIssues.sort((a, b) => {
        const result = azSortByFieldList(a, b, ['Title', 'ID'])
        return isReverseSorting ? result * -1 : result
      })
    } else if (sortingType === 'RECENT') {
      onPlaceSortByRecent(props.recent, searchedIssues)
      if (isReverseSorting) {
        searchedIssues.reverse()
      }
    }
    pureIssues = searchedIssues
  }

  const avatar = (props.currentUser && props.currentUser.Avatar) || ''

  return (
    <>
      <div className={styles.searchHead}>
        {props.page === 'PROJECTS_PAGE' ? (
          <span>{`Projects: ${userProjects.length}`}</span>
        ) : (
          <span>{`Tasks: ${pureIssues.length}`}</span>
        )}
        <div className={styles.headIcons}>
          {props.page === 'ISSUES_PAGE' && (
            <div className={styles.avatarBlock} onClick={() => setisAssignedOnly(!isAssignedOnly)}>
              <img src={avatar} className={styles.actionsBarAvatar} alt="avatar" />
              {isAssignedOnly ? (
                <IconWrapper name="check" classes={styles.checkIcon} key={`avatar-${isAssignedOnly}`} />
              ) : (
                <IconWrapper name="panorama_fish_eye" classes={styles.emptyIcon} key={`avatar-${isAssignedOnly}`} />
              )}
            </div>
          )}
          <IconWrapper
            onClick={() => {
              changeSortType('TRACKER')
            }}
            classes={classNames(styles.sortItem, {
              [styles.choosenItem]: sortingType === 'TRACKER',
            })}
            title="Sort by tracker"
            name={isReverseSorting && sortingType === 'TRACKER' ? 'iconSortZA' : 'iconSortAZ'}
            key={sortingType === 'TRACKER' && `${isReverseSorting}-iconSortAZ`}
          />
          <IconWrapper
            classes={classNames(styles.sortItem, {
              [styles.choosenItem]: sortingType === 'RECENT',
            })}
            onClick={() => {
              changeSortType('RECENT')
            }}
            title="Sort by recents"
            name="iconSortRecents"
          />
          {sortingType !== 'None' && (
            <div
              className={classNames(styles.underline, {
                [styles.underlineTracker]: sortingType === 'TRACKER',
              })}
            />
          )}
        </div>
      </div>
      <div className={styles.divider} />
      <div
        className={classNames(styles.projectsListDropdown, props.classNames && props.classNames.projectsListDropdown)}
      >
        <ItemsList
          page={props.page}
          projects={userProjects}
          issues={pureIssues}
          chooseProject={props.chooseProject}
          getHighlightedText={props.getHighlightedText}
          selectedProject={props.selectedProject}
          chooseTask={props.chooseTask}
          searchValue={props.searchValue}
          sortingType={sortingType}
          isReverseSorting={isReverseSorting}
        />
      </div>
    </>
  )
}

export default connect(mapStateToProps)(React.memo(DropDown))
