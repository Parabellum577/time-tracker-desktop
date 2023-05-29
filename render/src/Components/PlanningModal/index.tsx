import * as React from 'react'

import PlanningModal from './PlanningModal'
import { IPlanning, IFullIssue, IProject } from '@services/types'

interface IModalContextProps {
  onClose: () => void
  planning?: IPlanning
  trackerType?: string
  type: 'update' | 'report' | 'remove' | 'manual' | 'coldModal' | 'create'
  planningIssue?: IFullIssue
  startTime?: number
  endTime?: number
  updateTime?: (startTime: number, endTime: number) => void
  project?: IProject
  isPlanningExist?: boolean
}

const defaultContextProps: IModalContextProps = {
  onClose: null,
  type: 'update',
}

export const ModalContext = React.createContext<IModalContextProps>(defaultContextProps)

export const CreateModal: React.FC<IModalContextProps> = props => {
  const ref = React.useRef<HTMLDivElement>(null)

  const onClose = React.useCallback(() => {
    if (ref && ref.current) {
      ref.current.style.transform = 'translateY(100vh)'
    }
    props.onClose()
  }, [ref, props.onClose])

  return (
    <ModalContext.Provider value={{ ...props, onClose }}>
      <PlanningModal component={ref} />
    </ModalContext.Provider>
  )
}

export default React.memo(CreateModal)
