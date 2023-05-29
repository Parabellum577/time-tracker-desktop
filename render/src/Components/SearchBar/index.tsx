import * as React from 'react'
import classNames from 'classnames'
import { bindActionCreators, Dispatch } from 'redux'
import { connect, useDispatch } from 'react-redux'
import * as planningsActions from '@store/plannings/actions'
import * as alertActions from '@store/alerts/actions'
import * as userActions from '@store/currentUser/actions'
import { RootAction, IRootState } from '@store/rootReducer'
import { NavLink } from 'react-router-dom'

import api from '@services/api'
import { IProject, IProjectIssue } from '@services/types'
import CreateModal from '@components/PlanningModal'
import ProjectDropdownItem from './project'
import Issue from '@components/Issue'
import IconWrapper from '@components/IconWrapper'
import Spinner from '@components/Spinner'
import { isUrlValid } from '@services/typesValidation'
import { getUnreportedPlannings } from '@services/helpers'
import { IFullIssue } from '@types'
import { goBack, push } from 'connected-react-router'
import { azSortByField, azSortByFieldList, onPlaceSortByRecent } from '@services/sort'
import { MainContext } from '@Routers'
import Hint from '@components/Hint'
import HighlightIndicator from '@components/Tutorial/highlightIndicator'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./search.module.scss')

type IConnectProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

interface IProjectExtendedIssue extends IProjectIssue {
  isAlreadyPlanned: boolean
  isBookmarked: boolean
}

interface ISearchBarProps {
  isManualForm?: boolean
}

type SortingType = 'AZ' | 'TRACKER' | 'RECENT' | 'None'

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      getOpenPlannings: planningsActions.getOpenPlannings.request,
      goBack,
      addHighlightedPlanning: planningsActions.addHighlightedPlanning,
      showAlert: alertActions.showAlertMessage.request,
      userActions: userActions.handleUserSettings.request,
    },
    dispatch,
  )

const mapStateToProps = (state: IRootState) => ({
  recent: state.recent.extendedRecent,
  currentUser: state.user.currentUser,
  openPlannings: state.plannings.openPlannings,
  projects: state.projects.projects,
  bookmarks: state.bookmarks.extendedBookmarks,
  userSettings: state.user.defaultUserSettings,
})

const getProjectByID = (TrackerID: number, ProjectID: string, projects: IProject[]): IProject => {
  if (!ProjectID || !TrackerID) {
    return null
  }
  return projects.find(proj => proj.TrackerID === TrackerID && proj.ProjectID === ProjectID) || null
}

const SearchBar: React.FC<ISearchBarProps & IConnectProps> = props => {
  const context = React.useContext(MainContext)
  const dispatch = useDispatch()

  const [chosenProject, setChosenProject] = React.useState(
    getProjectByID(context.TrackerID, context.ProjectID, props.projects),
  )
  const [chosenTask, setChosenTask] = React.useState<IProjectIssue | null>(null)
  const [filteredTasks, setFilteredTasks] = React.useState<IProjectIssue[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isReverseSorting, setIsReverseSorting] = React.useState(false)
  const [isShowUnassignedTasks, setIsShowUnassignedTasks] = React.useState(false)
  const [page, setPage] = React.useState<'SELECT_PROJECT' | 'SELECT_TASK' | 'PLAN_TASK' | 'CREATE_TASK'>('CREATE_TASK')
  const [projects, setProjects] = React.useState<IProject[]>(
    props.projects.filter(proj => proj.ProjectStatus !== 'ARCHIVED' && !proj.IsHide),
  )
  const [filteredProjects, setFilteredProjects] = React.useState<IProject[]>(projects)
  const [searchValue, setSearchValue] = React.useState('')
  const [sortingType, setSortingType] = React.useState<'AZ' | 'TRACKER' | 'RECENT' | 'None'>('RECENT')
  const [tasks, setTasks] = React.useState<IProjectIssue[]>([])
  const isHaveUnAssignedTask = tasks.some(item => !item.IsAssigned)
  const openPlannings = useShallowEqualSelector(state => state.plannings.openPlannings)

  const ref = React.useRef<HTMLInputElement>()

  React.useEffect(() => {
    document.addEventListener('keyup', handleKeyPressed)
    setTutorialWithSearchBarCompleted()
    setAnalyticsView('SearchBar')
    api.project.UpdateProjectsCache().catch(error => console.error('SearchBar UpdateProjectsCache: error', error))
    return () => {
      document.removeEventListener('keyup', handleKeyPressed)
      context.clearContext()
      setAnalyticsView('Main')
    }
  }, [])

  React.useEffect(() => {
    setAnalyticsView(`SearchBar-${page}`)
  }, [page])

  React.useEffect(() => {
    if (context.ProjectID && !chosenProject) {
      const foundProject = getProjectByID(context.TrackerID, context.ProjectID, props.projects)
      if (foundProject) {
        setChosenProject(foundProject)
      }
    }
  }, [context])

  React.useEffect(() => {
    filterLists()
  }, [tasks, projects, searchValue])

  React.useEffect(() => {
    if (tasks && context.IssueID) {
      const foundTask = tasks.find(task => task.ID === context.IssueID)
      if (foundTask) {
        setChosenTask(foundTask)
        setPage('PLAN_TASK')
      }
    }
  }, [tasks])

  React.useEffect(() => {
    if (chosenProject) {
      fetchTaskList()
    }
  }, [chosenProject])

  React.useEffect(() => {
    setProjects(props.projects.filter(proj => proj.ProjectStatus !== 'ARCHIVED' && !proj.IsHide))
  }, [props.projects])

  const setTutorialWithSearchBarCompleted = () => {
    if (props.userSettings.isShowedSearchBarTutorial === 'off') {
      props.userActions([{ Key: 'isShowedSearchBarTutorial', Value: 'on' }])
    }
  }

  const setTutorialWithTaskAssignCompleted = () => {
    if (isHaveUnAssignedTask && props.userSettings.isShowedTaskAssignTutorial === 'off') {
      props.userActions([{ Key: 'isShowedTaskAssignTutorial', Value: 'on' }])
    }
  }

  const redirectToMain = React.useCallback(() => {
    const action = push('/main')
    dispatch(action)
  }, [dispatch])

  const handleKeyPressed = (event: KeyboardEvent) => {
    switch (page) {
      case 'SELECT_PROJECT':
        if (event.key === 'Enter' && filteredProjects.length) {
          chooseProject(filteredProjects[0])
        }
        break
      case 'SELECT_TASK':
        if (isBackSpace(event)) {
          setPage('SELECT_PROJECT')
          setChosenProject(null)
        } else if (event.key === 'Enter' && filteredTasks.length) {
          chooseTask(filteredTasks[0])
        }
        break
      default:
        break
    }
  }

  const isBackSpace = (event: KeyboardEvent) => {
    return event.key === 'Backspace' && (!ref.current.contains(document.activeElement) || !searchValue.length)
  }

  const fetchTaskList = async () => {
    if (!chosenProject) {
      return
    }
    try {
      setIsLoading(true)
      const { TrackerID, ProjectID } = chosenProject
      const newTasks = await api.tracker.GetProjectIssues({ TrackerID, ProjectID })
      setIsLoading(false)
      setTasks(newTasks)
    } catch (error) {
      console.error(error)
    }
  }

  const filterLists = (newSearchValue = searchValue) => {
    const newFilteredProjects = projects.filter(proj => {
      return proj.Name.toLowerCase().includes(newSearchValue.toLowerCase())
    })

    const newFilteredTasks = tasks.filter(proj => {
      return proj.Title.toLowerCase().includes(newSearchValue.toLowerCase())
    })

    setFilteredProjects(newFilteredProjects)
    setFilteredTasks(newFilteredTasks)
  }

  const searchValueWillChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchValue(value)

    if (isUrlValid(value)) {
      try {
        setIsLoading(true)
        const task = await api.tracker.GetIssueByURL({ IssueURL: value })

        const isTaskAdded = openPlannings.find(p => p.ProjectID === task.ProjectID && p.IssueID === task.Issue.ID)

        if (isTaskAdded) {
          props.showAlert({ alertType: 'warning', alertMessage: 'This task is already added' })
          setSearchValue('')
          setIsLoading(false)
          return
        }

        const project = projects.find(proj => proj.TrackerID === task.TrackerID && proj.ProjectID === task.ProjectID)
        setChosenTask(task.Issue)
        setChosenProject(project)
        setPage('PLAN_TASK')
        setSearchValue('')
      } catch (error) {
        props.showAlert({ alertType: 'error', alertMessage: error.message })
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateProjectList = (newProjects: IProject[]) => {
    setProjects(newProjects)
  }

  const chooseProject = async (project: IProject) => {
    if (project.ProjectStatus !== 'ACTIVE') {
      return
    }

    if (page === 'SELECT_PROJECT') {
      const element: HTMLElement = document.querySelector('#searchBarInput')
      element.focus()
      setChosenProject(project)
      setPage('SELECT_TASK')
      setSearchValue('')
    } else {
      setChosenProject(project)
    }

    // TODO: get project settings
  }

  const changeSortType = (newSortType: SortingType) => {
    if (newSortType === sortingType) {
      setIsReverseSorting(!isReverseSorting)
    } else {
      setSortingType(newSortType)
      setIsReverseSorting(false)
    }
  }

  const chooseTask = (task: IProjectIssue) => {
    setChosenTask(task)
    if (page === 'SELECT_TASK') {
      setPage('PLAN_TASK')
      setSearchValue('')
    }
  }

  const backToProjectList = () => {
    setPage('SELECT_PROJECT')
    setChosenProject(null)
  }

  const inputPlaceholder = (() => {
    switch (page) {
      case 'SELECT_PROJECT':
        return 'Search or Paste Task URL'
      case 'SELECT_TASK':
        return 'Search or Paste Task URL'
      case 'PLAN_TASK':
      case 'CREATE_TASK':
        return 'How many hours and minutes?'
      default:
        return 'Search or Paste Task URL'
    }
  })()

  const getProjectList = () => {
    const newProjects = filteredProjects.filter(p => !p.ColdProject)
    const isReversed = isReverseSorting
    if (sortingType === 'TRACKER') {
      newProjects.sort((a, b) => {
        const result = azSortByFieldList(a, b, ['TrackerID', 'Name'])
        return isReversed ? result * -1 : result
      })
    } else if (sortingType === 'RECENT') {
      onPlaceSortByRecent(props.recent, newProjects)
      if (isReversed) {
        newProjects.reverse()
      }
    }

    return (
      <div className={styles.projectsListDropdown} id="projectsListDropdown">
        <ProjectDropdownItem
          searchValue={searchValue}
          chooseProject={chooseProject}
          isManualForm={props.isManualForm}
          projects={newProjects}
          updateProjectList={updateProjectList}
        />
      </div>
    )
  }

  const getTasksList = () => {
    const newTasks = filteredTasks.filter(task => isShowUnassignedTasks || task.IsAssigned)
    const isReversed = isReverseSorting
    if (sortingType === 'AZ') {
      newTasks.sort((a, b) => {
        const result = azSortByField(a, b, 'Title')
        return isReversed ? result * -1 : result
      })
    } else if (sortingType === 'RECENT') {
      onPlaceSortByRecent(props.recent, newTasks)
      if (isReversed) {
        newTasks.reverse()
      }
    }
    const { ProjectID, TrackerID } = chosenProject
    const parsedTasks: IProjectExtendedIssue[] = []
    for (const task of newTasks) {
      const isAlreadyPlanned = props.openPlannings.some(
        planning => planning.ProjectID === ProjectID && planning.IssueID === task.ID,
      )
      const isBookmarked = props.bookmarks.some(
        i => i.ID === task.ID && i.ProjectID === ProjectID && i.TrackerID === TrackerID,
      )
      parsedTasks.push({ ...task, isAlreadyPlanned, isBookmarked })
    }
    return (
      <div className={styles.tasksListDropdown}>
        {parsedTasks.map((task, index) => (
          <Issue
            ProjectID={ProjectID}
            TrackerID={TrackerID}
            chooseTask={chooseTask}
            isManualForm={props.isManualForm}
            task={task}
            key={`issue-${task.ID}-${index}`}
            searchValue={searchValue}
            renderFromPage="SEARCH_BAR"
          />
        ))}
      </div>
    )
  }

  const getPlanSection = () => {
    if (page === 'PLAN_TASK') {
      const planning: IFullIssue = {
        ...chosenTask,
        DueDate: 0,
        Done: 0,
        IsAssigned: true,
        Spent: 0,
        TrackerID: chosenProject.TrackerID,
        ProjectID: chosenProject.ProjectID,
      }

      return <CreateModal onClose={props.goBack} type="update" project={chosenProject} planningIssue={planning} />
    } else if (page === 'CREATE_TASK') {
      return <CreateModal onClose={props.goBack} type="create" project={chosenProject || null} />
    }
  }

  const getDropdownActionsBar = () => {
    if (page === 'PLAN_TASK' || page === 'CREATE_TASK') {
      return
    }

    const avatar = (props.currentUser && props.currentUser.Avatar) || ''

    return (
      <div className={styles.actionsBar}>
        <div
          className={styles.label}
          onClick={() => {
            setPage('CREATE_TASK')
          }}
        >
          <p>Create Task</p>
        </div>
        <div className={styles.rightContainer}>
          {page === 'SELECT_TASK' && (
            <Hint hintText={isShowUnassignedTasks ? 'Unassigned Tasks' : 'Assigned to Me Only Tasks'} position="right">
              <div
                onClick={() => {
                  setIsShowUnassignedTasks(!isShowUnassignedTasks)
                  setTutorialWithTaskAssignCompleted()
                }}
                className={styles.assignBlock}
              >
                {isHaveUnAssignedTask && props.userSettings.isShowedTaskAssignTutorial === 'off' && (
                  <HighlightIndicator
                    userSettingsKey="isShowedTaskAssignTutorial"
                    className={styles.tutorialIndicator}
                  />
                )}

                <img src={avatar} className={styles.actionsBarAvatar} alt="avatar" />
                <IconWrapper
                  name="check"
                  classes={classNames({
                    [styles.actionsBarAvatarIcon]: true,
                    [styles.actionsBarAvatarIconDisabled]: isShowUnassignedTasks,
                  })}
                />
              </div>
            </Hint>
          )}
          <div className={styles.sortBlock}>
            <p className={styles.sortLabel}>Sorting</p>
            {page === 'SELECT_PROJECT' ? (
              <>
                <IconWrapper
                  onClick={() => changeSortType('TRACKER')}
                  classes={classNames({
                    [styles.sortItem]: true,
                    [styles.sortItemActive]: sortingType === 'TRACKER',
                    [styles.sortItemReversed]: sortingType === 'TRACKER' && isReverseSorting,
                  })}
                  title="Sort by tracker"
                  name="iconSortTracker"
                />
                <IconWrapper
                  classes={classNames({
                    [styles.sortItem]: true,
                    [styles.sortItemActive]: sortingType === 'RECENT',
                  })}
                  onClick={() => changeSortType('RECENT')}
                  title="Sort by recents"
                  name="iconSortRecents"
                />
              </>
            ) : (
              <>
                <IconWrapper
                  classes={classNames({
                    [styles.sortItem]: true,
                    [styles.sortItemActive]: sortingType === 'AZ',
                  })}
                  onClick={() => changeSortType('AZ')}
                  title="Sort by alphabet"
                  name={sortingType === 'AZ' && isReverseSorting ? 'iconSortZA' : 'iconSortAZ'}
                />
                {/* TODO: iconSortZA */}
                <IconWrapper
                  classes={classNames({
                    [styles.sortItem]: true,
                    [styles.sortItemActive]: sortingType === 'RECENT',
                  })}
                  onClick={() => changeSortType('RECENT')}
                  title="Sort by recent"
                  name="iconSortRecents"
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="searchBar" className={styles.searchBar}>
      <div className={styles.inputField}>
        <IconWrapper classes={styles.searchIcon} name="iconSearch" />
        {chosenProject && (
          <div className={styles.chosenProjectBadge}>
            <IconWrapper
              classes={styles.chosenProjectLogo}
              width={'12px'}
              name={chosenProject.TrackerType.toUpperCase()}
            />
            <p>{chosenProject.Name}</p>
            <IconWrapper classes={styles.closeBadgeIcon} onClick={backToProjectList} name="close" />
          </div>
        )}
        <input
          type="text"
          autoFocus={true}
          ref={ref}
          placeholder={inputPlaceholder}
          value={searchValue}
          onChange={searchValueWillChanged}
          id="searchBarInput"
        />
        <IconWrapper classes={styles.closeButton} onClick={redirectToMain} name="close" title="Close search form" />
      </div>
      {getDropdownActionsBar()}
      {isLoading ? (
        <div className={styles.spinnerBlock}>
          <Spinner />
        </div>
      ) : (
        <>
          {getUnreportedPlannings(props.openPlannings) > 0 && (
            <NavLink to="/main/unreportedTasks" className={styles.link}>
              <div className={styles.unreportedWarning}>
                <span>{`You Have ${getUnreportedPlannings(props.openPlannings)} Unreported Tasks`}</span>
                <IconWrapper name="keyboard_arrow_right" classes={styles.arrowIcon} />
              </div>
            </NavLink>
          )}
          {page === 'SELECT_PROJECT' && getProjectList()}
          {page === 'SELECT_TASK' && getTasksList()}
          {getPlanSection()}
        </>
      )}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SearchBar))
