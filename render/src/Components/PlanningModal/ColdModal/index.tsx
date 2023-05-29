import * as React from 'react'
import SearchBlock from '@components/SearchBlock'
import MainPage from './mainPage'
import Header from '../Header'
import { ModalContext } from '../index'
import { INamedID, IProjectDetails } from '@services/types'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import api from '@services/api'

const styles = require('./styles.module.scss')

const ColdModal: React.FC = props => {
  const context = React.useContext(ModalContext)
  const storedIssues = useShallowEqualSelector(state => state.projects.projectsIssues)
  const storedProjects = useShallowEqualSelector(state => state.projects.projects)
  const coldTask = storedIssues.find(i => i.project === 'coldProject').issues.find(i => i.Title === 'Cold Task')
  const coldProject = storedProjects.find(p => p.TrackerType === 'TGTRACKER')
  const [selectedProject, setSelectedProject] = React.useState(coldProject)
  const [selectedIssue, setSelectedIssue] = React.useState(coldTask)
  const [isLoading, setIsLoading] = React.useState(false)
  const [issuePriority, setIssuePriority] = React.useState<INamedID>(null)
  const [projectDetailsArr, setProjectDetails] = React.useState<IProjectDetails>(null)
  const projectItemId = projectDetailsArr ? `${projectDetailsArr.TrackerID} - ${projectDetailsArr.ID}` : null

  React.useEffect(() => {
    if (!selectedProject) {
      return
    }

    api.tracker
      .GetProjectDetails({
        TrackerID: selectedProject.TrackerID,
        ProjectID: selectedProject.ProjectID,
      })
      .then(projectDetails => {
        setProjectDetails(projectDetails)
      })
      .catch(err => {
        console.error(err)
      })
  }, [selectedProject])

  React.useEffect(() => {
    if (!selectedProject || !selectedIssue) {
      return
    }

    setIssuePriority(selectedIssue.Priority)
  }, [selectedProject, selectedIssue])

  return (
    <div className={styles.modalContainer}>
      <Header
        title="Assign Coldtime"
        modalType="coldModal"
        onClose={context.onClose}
        setPriority={setIssuePriority}
        priority={issuePriority}
        projectDetails={projectDetailsArr}
        projectItemId={projectItemId}
      />
      <SearchBlock
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedIssue={selectedIssue}
        setSelectedIssue={setSelectedIssue}
        renderFromPage="ASSIGN_COLD_START"
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <MainPage
        isLoading={isLoading}
        selectedProject={selectedProject}
        selectedIssue={selectedIssue}
        issuePriority={issuePriority}
        projectDetails={projectDetailsArr}
      />
    </div>
  )
}

export default React.memo(ColdModal)
