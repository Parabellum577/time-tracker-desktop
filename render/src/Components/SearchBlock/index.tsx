import * as React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as _ from 'lodash'
import { IRootState, RootAction } from '@store/rootReducer'
import { bindActionCreators, Dispatch } from 'redux'
import * as planningsActions from '@store/plannings/actions'
import * as alertActions from '@store/alerts/actions'
import { IProjectIssue, IProject } from '@services/types'
import IconWrapper from '@components/IconWrapper'
import { isUrlValid } from '@services/typesValidation'
import DropDown from './DropDown'
import Spinner from '@components/Spinner'
import api from '@api'
import { normalizeString } from '@services/formater'

const styles = require('./styles.module.scss')

const mapStateToProps = (state: IRootState) => ({
  storedIssues: state.projects.projectsIssues,
  storedProjects: state.projects.projects,
  currentUser: state.user.currentUser,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

interface IOwnProps {
  selectedProject: IProject | null
  setSelectedProject: (project: IProject) => void
  selectedIssue: IProjectIssue | null
  setSelectedIssue: (project: IProjectIssue) => void
  renderFromPage: 'ASSIGN_COLD_START' | 'MANUAL_REPORT' | 'CREATE_TASK' | 'PROJECT_PICKER'
  isLoading: boolean
  setIsLoading: (value: boolean) => void
  classNames?: {
    main?: string
    mainOpened?: string
    searchBar?: string
    projectsListDropdown?: string
    projectContent?: string
    arrowDownBlock?: string
  }
}

type ISearchBlockProps = IOwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const SearchBlock: React.FC<ISearchBlockProps> = props => {
  const componentRef = React.useRef(null)
  // const coldProjectIssues = props.storedIssues.find(i => i.project === 'coldProject')
  // const coldTask = coldProjectIssues? coldProjectIssues.issues.find(i => i.Title === 'Cold Task') : null

  const coldProject = props.storedProjects.find(p => p.ColdProject)

  const [page, setPage] = React.useState<'MAIN_PAGE' | 'PROJECTS_PAGE' | 'ISSUES_PAGE'>('MAIN_PAGE')
  const [projectIssues, setProjectIssues] = React.useState([])
  const [searchValue, setSearchValue] = React.useState('')
  const [isClose, setClose] = React.useState(false)

  React.useEffect(() => {
    if (props.renderFromPage === 'ASSIGN_COLD_START') {
      // if (page === 'MAIN_PAGE' && coldTask && props.selectedIssue.ID === coldTask.ID) {
      //   props.setSelectedProject(coldProject)
      // }
    } else {
      if (props.renderFromPage === 'CREATE_TASK' || props.renderFromPage === 'PROJECT_PICKER') {
        return
      }

      if (page === 'MAIN_PAGE' && (_.isEmpty(props.selectedProject) || _.isEmpty(props.selectedIssue))) {
        props.setSelectedProject(null)
      }
    }
  }, [page, searchValue, props.isLoading, props.selectedProject, props.selectedIssue])

  React.useEffect(() => {
    if (page === 'MAIN_PAGE') {
      return
    }

    api.project.UpdateProjectsCache().catch(error => console.error('SearchBar UpdateProjectsCache: error', error))

    if (props.renderFromPage !== 'PROJECT_PICKER') {
      return
    }

    const keyUpHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearchForm(event)
      }
    }

    const clickHandler = (e: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(e.target)) {
        closeSearchForm(e)
      }
    }

    document.addEventListener('click', clickHandler)
    document.addEventListener('keyup', keyUpHandler)
    return () => {
      document.removeEventListener('click', clickHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [page])

  const chooseProject = async (project: IProject) => {
    try {
      if (project.ProjectStatus !== 'ACTIVE') {
        return
      }

      props.setIsLoading(true)
      props.setSelectedProject(project)
      if (props.renderFromPage === 'CREATE_TASK' || props.renderFromPage === 'PROJECT_PICKER') {
        setPage('MAIN_PAGE')
      } else {
        const issues: IProjectIssue[] = await api.tracker.GetProjectIssues({
          TrackerID: project.TrackerID,
          ProjectID: project.ProjectID,
        })
        setProjectIssues(issues)
        setPage('ISSUES_PAGE')
      }
      setSearchValue('')
    } catch (error) {
      console.error(error)
    } finally {
      props.setIsLoading(false)
    }
  }

  const getHighlightedText = (text: string) => {
    if (!searchValue) {
      return <span>{text}</span>
    }

    const highlight = normalizeString(searchValue)
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

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    if (isUrlValid(value)) {
      try {
        props.setIsLoading(true)
        const task = await api.tracker.GetIssueByURL({ IssueURL: value })
        const project = props.storedProjects.find(
          proj => proj.TrackerID === task.TrackerID && proj.ProjectID === task.ProjectID,
        )
        props.setSelectedProject(project)
        setSearchValue('')
        chooseTask(task.Issue)
        const issues: IProjectIssue[] = await api.tracker.GetProjectIssues({
          TrackerID: project.TrackerID,
          ProjectID: project.ProjectID,
        })
        setProjectIssues(issues)
        props.setIsLoading(false)
      } catch (error) {
        props.showAlert({ alertType: 'error', alertMessage: error.message })
        console.error(error)
        props.setIsLoading(false)
      }
    }
  }

  const chooseTask = (task: IProjectIssue) => {
    props.setSelectedIssue(task)
    setPage('MAIN_PAGE')
  }

  const handleSwitchPage = (
    event: React.MouseEvent<HTMLElement>,
    nextPage?: 'MAIN_PAGE' | 'PROJECTS_PAGE' | 'ISSUES_PAGE',
  ) => {
    if (event) {
      event.stopPropagation()
    }
    setSearchValue('')
    setClose(true)

    if (nextPage) {
      setPage(nextPage)
      return
    }

    if (page === 'MAIN_PAGE') {
      if (
        props.selectedProject &&
        !props.selectedProject.ColdProject &&
        props.renderFromPage !== 'CREATE_TASK' &&
        props.renderFromPage !== 'PROJECT_PICKER'
      ) {
        setPage('ISSUES_PAGE')
      } else {
        setPage('PROJECTS_PAGE')
      }
    }
  }

  const closeSearchForm = (e: Event) => {
    e.stopPropagation()
    resetSelectedProject(null)
    handleSwitchPage(null, 'MAIN_PAGE')
  }

  const resetSelectedProject = (e: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setPage('PROJECTS_PAGE')
    if (props.renderFromPage === 'ASSIGN_COLD_START') {
      // props.setSelectedIssue(coldTask)
      props.setSelectedProject(coldProject)
    } else {
      props.setSelectedIssue(null)
      props.setSelectedProject(null)
    }
  }

  const resetSelectedIssue = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPage('ISSUES_PAGE')
    if (props.renderFromPage === 'ASSIGN_COLD_START') {
      // props.setSelectedIssue(coldTask)
    } else {
      props.setSelectedIssue(null)
    }
  }

  const isColdProjectChosen = () =>
    props.selectedIssue && props.selectedIssue.Title === 'Cold Task' && props.renderFromPage === 'ASSIGN_COLD_START'
  const isNewTaskProjectChosen = () =>
    (props.renderFromPage === 'CREATE_TASK' || props.renderFromPage === 'PROJECT_PICKER') &&
    !_.isEmpty(props.selectedProject)
  const isDarkSearchBar = () => page === 'MAIN_PAGE' && (isColdProjectChosen() || isNewTaskProjectChosen())

  return (
    <div
      ref={componentRef}
      className={classNames(
        styles.main,
        props.classNames && props.classNames.main,
        page !== 'MAIN_PAGE' && props.classNames && props.classNames.mainOpened,
        {
          [styles.dropDown]: page !== 'MAIN_PAGE',
          [styles.searchContainer]: props.renderFromPage === 'MANUAL_REPORT',
        },
      )}
    >
      <div
        className={classNames(styles.searchBar, props.classNames && props.classNames.searchBar, {
          [styles.projectBlock]: isDarkSearchBar(),
        })}
        onClick={handleSwitchPage}
        title={props.selectedProject && props.selectedProject.Name}
      >
        {page === 'MAIN_PAGE' ? (
          <>
            {isDarkSearchBar() ? (
              <div className={classNames(styles.projectContent, props.classNames && props.classNames.projectContent)}>
                <div className={styles.projectTitleWrap}>
                  <IconWrapper
                    name={isColdProjectChosen() ? 'ac_unit' : props.selectedProject.TrackerType}
                    classes={classNames({
                      [styles.snowFlake]: isColdProjectChosen(),
                      [styles.trackerIcon]: isNewTaskProjectChosen(),
                    })}
                  />
                  <span>{props.selectedProject.Name}</span>
                </div>
                <div className={classNames(styles.arrowDownBlock, props.classNames && props.classNames.arrowDownBlock)}>
                  <IconWrapper name="arrowDownIcon" classes={styles.arrowIconWhite} />
                </div>
              </div>
            ) : (
              <>
                <IconWrapper classes={styles.searchIcon} name="iconSearch" />
                {!props.selectedProject && !props.selectedIssue && (
                  <span className={styles.placeholder}>Search or Paste Task URL</span>
                )}
                {props.selectedProject && (
                  <div className={styles.chosenProjectBadge}>
                    <IconWrapper width={'12px'} name={props.selectedProject.TrackerType.toUpperCase()} />
                    <p>{props.selectedProject.Name}</p>
                    <IconWrapper classes={styles.closeBadgeIcon} onClick={resetSelectedProject} name="close" />
                  </div>
                )}
                {props.selectedIssue && (
                  <div className={classNames(styles.chosenProjectBadge, styles.issueBadge)}>
                    <p>{props.selectedIssue.Title}</p>
                    <div className={styles.closeBlock}>
                      <IconWrapper classes={styles.closeBadgeIcon} onClick={resetSelectedIssue} name="close" />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <IconWrapper classes={styles.searchIcon} name="iconSearch" />
            {page === 'ISSUES_PAGE' && props.selectedProject && (
              <div className={styles.chosenProjectBadge}>
                <IconWrapper width={'12px'} name={props.selectedProject.TrackerType.toUpperCase()} />
                <p>{props.selectedProject.Name}</p>
                <IconWrapper
                  classes={styles.closeBadgeIcon}
                  onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleSwitchPage(e, 'PROJECTS_PAGE')}
                  name="close"
                  title="Go back to projects"
                />
              </div>
            )}
            <input
              type="text"
              autoFocus={true}
              placeholder="Search..."
              value={searchValue}
              className={styles.inputField}
              onChange={handleSearch}
            />
            <IconWrapper
              classes={styles.closeButton}
              onClick={closeSearchForm}
              name="close"
              title="Close search form"
            />
          </>
        )}
      </div>
      {page !== 'MAIN_PAGE' && (
        <>
          {props.isLoading ? (
            <Spinner />
          ) : (
            <DropDown
              page={page}
              setPage={setPage}
              projectIssues={projectIssues}
              chooseProject={chooseProject}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              getHighlightedText={getHighlightedText}
              selectedProject={props.selectedProject}
              chooseTask={chooseTask}
              renderFromPage={props.renderFromPage}
              classNames={props.classNames}
            />
          )}
        </>
      )}
      {props.isLoading && (
        <div
          className={classNames(styles.spinnerPage, {
            [styles.manualModal]: props.renderFromPage === 'MANUAL_REPORT',
          })}
        >
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SearchBlock))
