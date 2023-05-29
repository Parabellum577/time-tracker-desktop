import * as React from 'react'
import { connect } from 'react-redux'

import { IRootState } from '@store/rootReducer'
import { IPlanning, IFullIssue } from '@types'
import PlanningsList from '@components/PlanningsList'

interface IPlanningsProps {
  openPlannings: IPlanning[]
  recent: IFullIssue[]
}

const mapStateToProps = (state: IRootState) => ({
  openPlannings: state.plannings.openPlannings,
  recent: state.recent.extendedRecent,
})

class Recent extends React.PureComponent<IPlanningsProps> {
  public render() {
    const { recent, openPlannings } = this.props
    const fields = {
      plannings: openPlannings.filter(planning => {
        return recent.some(item => item.ID === planning.IssueID)
      }),
      issues: recent.filter(item => {
        return !openPlannings.some(planning => item.ID === planning.IssueID)
      }),
    }

    return <PlanningsList {...fields} />
  }
}

export default connect(mapStateToProps)(Recent)
