import * as React from 'react'
import * as _ from 'lodash'

import { IProject } from '@services/types'

import Tasklist from './Tasklist/index'
import Favorites from './Favorites/index'
import Recent from './Recent'
import classNames from 'classnames'

import Nav from '@components/Nav'
import ProductivityChart from '@components/ProductivityChart'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import IconWrapper from '@components/IconWrapper'
import CreateModal from '@components/PlanningModal'
import SearchBlock from '@components/SearchBlock'

const styles = require('./styles.module.scss')

import './selector.scss'

interface IPlanningsPageContext {
  scrollContainerRef: React.MutableRefObject<HTMLDivElement>
  selectedProject: IProject
}

export const PlanningsPageContext = React.createContext<IPlanningsPageContext>(null)

const projectToDropdownItem = (proj: IProject) => ({
  value: proj,
  label: proj.Name,
})

const isAvailableProjects = (proj: IProject): boolean =>
  !proj.IsHide && !proj.ColdProject && proj.ProjectStatus === 'ACTIVE'

const PlanningsPage: React.FC = () => {
  const projectsRaw = useShallowEqualSelector(state => state.projects.projects)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [projects, setProjects] = React.useState(projectsRaw.filter(isAvailableProjects).map(projectToDropdownItem))
  const [page, setPage] = React.useState<'Tasklist' | 'Favorites' | 'Recent' | 'CreateTask'>('Tasklist')
  const [selectedProject, setSelectedProject] = React.useState<IProject>(null)

  React.useEffect(() => {
    const emailFromSignInPage = localStorage.getItem('userSignInEmail')
    if (emailFromSignInPage) {
      localStorage.removeItem('userSignInEmail')
    }
  }, [])

  React.useEffect(() => {
    if (_.isEmpty(projectsRaw)) {
      return
    }

    setProjects(projectsRaw.filter(isAvailableProjects).map(projectToDropdownItem))

    if (!selectedProject) {
      const storedProject: IProject | null = JSON.parse(localStorage.getItem('PlanningsPage_Selected_Project'))
      const projectToSelect =
        storedProject &&
        projectsRaw.find(
          ({ TrackerID, ProjectID }) => TrackerID === storedProject.TrackerID && ProjectID === storedProject.ProjectID,
        )
      if (projectToSelect) {
        setSelectedProject(projectToSelect)
      } else {
        const availableProjects = projectsRaw.filter(isAvailableProjects)
        if (availableProjects) {
          setSelectedProject(availableProjects[0])
        } else {
          setSelectedProject(projectsRaw[0])
        }
      }
    }
  }, [projectsRaw])

  React.useEffect(() => {
    if (selectedProject) {
      localStorage.setItem(
        'PlanningsPage_Selected_Project',
        JSON.stringify({ ProjectID: selectedProject.ProjectID, TrackerID: selectedProject.TrackerID }),
      )
    }
  }, [selectedProject])

  return (
    <div className={styles.page}>
      <div className={styles.menu}>
        <div className={styles.choosenProject} title={selectedProject ? selectedProject.Name : null}>
          {selectedProject && (
            <div>
              <SearchBlock
                selectedProject={selectedProject}
                setSelectedProject={project => {
                  if (project) {
                    setSelectedProject(project)
                  }
                }}
                selectedIssue={null}
                setSelectedIssue={() => {}}
                renderFromPage="PROJECT_PICKER"
                isLoading={false}
                setIsLoading={() => {}}
                classNames={{
                  main: styles.main,
                  mainOpened: styles.mainOpened,
                  projectsListDropdown: styles.projectsListDropdown,
                  searchBar: styles.searchBar,
                  projectContent: styles.projectContent,
                  arrowDownBlock: styles.arrowDownBlock,
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.actionsBar}>
          <IconWrapper
            name="list"
            classes={classNames(styles.tab, page === 'Tasklist' && styles.activeTab)}
            title="All tasks"
            fontSize="20px"
            onClick={() => setPage('Tasklist')}
          />
          <IconWrapper
            name="iconSortRecents"
            height="24px"
            width="24px"
            classes={classNames(styles.tab, styles.recentTabIcon, page === 'Recent' && styles.activeTab)}
            title="Recent tasks"
            onClick={() => setPage('Recent')}
          />
          <IconWrapper
            name="star"
            title="Favorites"
            fontSize="20px"
            classes={classNames(styles.tab, page === 'Favorites' && styles.activeTab)}
            color="#f79e35"
            onClick={() => setPage('Favorites')}
          />
          <Nav />
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.container} ref={scrollContainerRef}>
        <PlanningsPageContext.Provider value={{ scrollContainerRef, selectedProject }}>
          {page === 'Tasklist' && <Tasklist project={selectedProject} />}
          {page === 'Favorites' && <Favorites />}
          {page === 'Recent' && <Recent />}
        </PlanningsPageContext.Provider>

        {page === 'CreateTask' && (
          <CreateModal onClose={() => setPage('Tasklist')} type="create" project={selectedProject} />
        )}
      </div>
      <ProductivityChart />
    </div>
  )
}

export default React.memo(PlanningsPage)
