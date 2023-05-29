import * as React from 'react'
import { connect } from 'react-redux'

import { IRootState } from '@store/rootReducer'

import { IPlanning } from '@services/types'
import { getFullSpentTime } from '@services/helpers'
import { formatTime } from '@services/formater'

const mapStateToProps = (state: IRootState) => ({
  openPlannings: state.plannings.openPlannings,
  coldPlannings: state.plannings.coldPlannings,
  closedPlannings: state.plannings.closedPlannings,
})

type ITrackedTimeProps = ReturnType<typeof mapStateToProps>

class TrackedTime extends React.PureComponent<ITrackedTimeProps> {
  public render() {
    const trackedPlaning = this.props.openPlannings
      .concat(this.props.closedPlannings)
      .concat(this.props.coldPlannings)
      .filter(p => !p.Outdated)

    const timeSpent = trackedPlaning.reduce((time: number, plan: IPlanning) => {
      return time + getFullSpentTime(plan)
    }, 0)

    return <strong>{formatTime(timeSpent, 'H:MM')}</strong>
  }
}

export default connect(mapStateToProps)(TrackedTime)
