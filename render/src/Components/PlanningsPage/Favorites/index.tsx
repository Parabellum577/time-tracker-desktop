import * as React from 'react'
import { connect } from 'react-redux'

import { IRootState } from '@store/rootReducer'
import { IPlanning, IFullIssue } from '@types'
import PlanningsList from '@components/PlanningsList'

interface IFavoritesProps {
  openPlannings: IPlanning[]
  favorites: IFullIssue[]
}

const mapStateToProps = (state: IRootState) => ({
  openPlannings: state.plannings.openPlannings,
  favorites: state.bookmarks.extendedBookmarks,
})

class Favorites extends React.PureComponent<IFavoritesProps> {
  public render() {
    const fields = {
      plannings: this.props.openPlannings.filter(planning => {
        return this.props.favorites.some(favorite => favorite.ID === planning.IssueID)
      }),
      issues: this.props.favorites.filter(favorite => {
        return !this.props.openPlannings.some(planning => favorite.ID === planning.IssueID)
      }),
    }

    return <PlanningsList {...fields} />
  }
}

export default connect(mapStateToProps)(Favorites)
