import * as React from 'react'
import * as _ from 'lodash'
import IconWrapper from '@components/IconWrapper'
import { INamedID, IProjectDetails } from '@services/types'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import PriorityPicker from '../PriorityPicker'
import { isTrackerWithDisableDetails } from '@services/helpers'

const styles = require('./styles.module.scss')

interface IOwnProps {
  setPriority: React.Dispatch<React.SetStateAction<INamedID>>
  onClose: VoidFunction
  priority: INamedID
  title: string
  projectDetails?: IProjectDetails
  modalType: 'update' | 'report' | 'remove' | 'manual' | 'coldModal' | 'create'
  projectItemId: string
}

type IHeaderProps = IOwnProps

const Header: React.FC<IHeaderProps> = props => {
  const avatar = useShallowEqualSelector(state => state.user.currentUser.Avatar)
  const isProjectDetailsArrayEmpty = !props.projectDetails || _.isEmpty(props.projectDetails.IssuePriorities)

  const isGetProjectsPriority =
    props.projectDetails && !isProjectDetailsArrayEmpty && isTrackerWithDisableDetails(props.projectDetails.TrackerType)

  const isInitPriorityPicker = props.modalType !== 'manual' && props.modalType !== 'coldModal' && isGetProjectsPriority

  return (
    <section className={styles.content}>
      <h3>{props.title}</h3>
      <div className={styles.actionsContainer}>
        {isInitPriorityPicker && (
          <>
            <img className={styles.actionItem} src={avatar} />
            <PriorityPicker
              setPriority={props.setPriority}
              priority={props.priority}
              projectPriorities={props.projectDetails.IssuePriorities}
              projectItemId={props.projectItemId}
            />
          </>
        )}
        <div className={styles.closeButton} onClick={props.onClose}>
          <IconWrapper name="close" color="#fff" />
        </div>
      </div>
    </section>
  )
}

export default React.memo(Header)
