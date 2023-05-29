import * as React from 'react'

import { IPlanning } from '@services/types'
import { ModalContext } from '../index'

const styles = require('./remove.module.scss')

interface IRemoveProps {
  handleClosePlanning: (planning: IPlanning, isRemove?: boolean) => Promise<void>
}

const Remove: React.FC<IRemoveProps> = props => {
  const context = React.useContext(ModalContext)

  return (
    <div className={styles.mainBody}>
      <div className={styles.contentBlock}>
        <h3>Removing Planning</h3>
        <span>{`Planning ${context.planning.IssueTitle} will be closed without reporting any spent time`}</span>
      </div>
      <div className={styles.buttonsBlock}>
        <button onClick={context.onClose}>NO!</button>
        <button onClick={() => props.handleClosePlanning(context.planning, true)}>OK</button>
      </div>
    </div>
  )
}

export default React.memo(Remove)
