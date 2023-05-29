import * as React from 'react'
import { IProject, IFullIssue } from '@types'
import PlanningsList from '@components/PlanningsList'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import api from '@services/api'
import Spinner from '@components/Spinner'

interface IProps {
  project: IProject
}

const Today: React.FC<IProps> = ({ project }) => {
  const plannings = useShallowEqualSelector(state => state.plannings.openPlannings).filter(p => !p.Outdated)
  const [issues, setIssues] = React.useState<IFullIssue[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  React.useEffect(() => {
    if (!project) {
      return
    }

    if (!issues.length) {
      setIsLoading(true)
    }

    // setIssues([])

    let isCanceled = false
    api.tracker
      .GetProjectIssues({ TrackerID: project.TrackerID, ProjectID: project.ProjectID })
      .then(newIssues => {
        if (isCanceled) {
          return
        }
        setIssues(newIssues)
      })
      .finally(() => {
        setIsLoading(false)
      })
    return () => {
      isCanceled = true
    }
  }, [project, plannings.length])

  const planningsToRender = plannings.filter(
    p => p.Active || (project && p.TrackerID === project.TrackerID && p.ProjectID === project.ProjectID),
  )

  const fields = {
    plannings: planningsToRender,
    issues: issues.filter(item => {
      return !planningsToRender.some(
        planning =>
          item.ProjectID === planning.ProjectID &&
          item.TrackerID === planning.TrackerID &&
          item.ID === planning.IssueID,
      )
    }),
  }

  return !isLoading ? <PlanningsList {...fields} /> : <Spinner />
}
export default React.memo(Today)
