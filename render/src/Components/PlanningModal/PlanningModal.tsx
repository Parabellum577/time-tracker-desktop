import * as React from 'react'
import { connect } from 'react-redux'
import * as ReactDOM from 'react-dom'
import { bindActionCreators, Dispatch } from 'redux'
import classNames from 'classnames'

import * as planningsActions from '@store/plannings/actions'
import * as alertActions from '@store/alerts/actions'
import { RootAction, IRootState } from '@store/rootReducer'
import Report from './Report'
import Update from './Update'
import Remove from './Remove'
import Manual from './Manual'
import Create from './Create'
import { IPlanning } from '@services/types'
import { ISetExtraPayload } from '@services/api-types'
import api from '@api'
import { getFullSpentTime } from '@services/helpers'
import ColdModal from './ColdModal'
import { ModalContext } from './index'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./styles.module.scss')

interface IOwnProps {
  component: React.MutableRefObject<HTMLDivElement>
}

const mapStateToProps = (state: IRootState) => ({
  projects: state.projects.projects,
  isMaster: state.synchronization.isMaster,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      closePlanning: planningsActions.closePlanning.request,
      setExtra: planningsActions.setExtra,
      showAlert: alertActions.showAlertMessage.request,
    },
    dispatch,
  )

type IPlanningModalProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & IOwnProps

const PlanningModal: React.FC<IPlanningModalProps> = props => {
  const context = React.useContext(ModalContext)

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  React.useEffect(() => {
    setAnalyticsView(`Modal-${context.type}`)
  }, [context.type])

  React.useEffect(() => {
    if (props.component && props.component.current) {
      props.component.current.style.transition = 'transform .5s linear'
      setTimeout(() => {
        props.component.current.style.transform = 'translateY(0)'
      }, 100)
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      context.onClose()
    }
  }

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return
    }

    const popUpMenuInModal = document.getElementById('popUpMenuInModal')
    if (popUpMenuInModal && popUpMenuInModal.contains(event.target)) {
      return
    }

    if (!props.component.current.contains(event.target)) {
      context.onClose()
    }
  }

  const handleEditPlanning = async (planning: ISetExtraPayload) => {
    try {
      await api.planning.SetExtra(planning)
      props.setExtra(planning)
    } catch (error) {
      console.error(error)
      props.showAlert({ alertType: 'error', alertMessage: error.message })
    }
  }

  const handleClosePlanning = async (planning: IPlanning, isRemove?: boolean) => {
    let payload: IPlanning

    if (isRemove) {
      payload = {
        ...planning,
        SpentManual: 0,
        SpentOffline: 0,
        SpentOnline: 0,
      }
    } else {
      payload = planning
    }

    props.closePlanning(payload)
    context.onClose()
  }

  const renderComponent = () => {
    let content: React.ReactElement

    switch (context.type) {
      case 'update':
        content = <Update handleEditPlanning={handleEditPlanning} />
        break
      case 'manual':
        content = <Manual />
        break
      case 'report':
        content = <Report handleClosePlanning={handleClosePlanning} />
        break
      case 'create':
        content = <Create />
        break
      case 'coldModal':
        // content = <ColdModal />
        break
      case 'remove':
        getFullSpentTime(context.planning) > 0
          ? (content = <Remove handleClosePlanning={handleClosePlanning} />)
          : handleClosePlanning(context.planning)
        break
      default:
        console.error('PlanningModal unsupported type:', context.type)
    }
    return content
  }

  return ReactDOM.createPortal(
    <div
      className={classNames(styles.container, {
        [styles.manualContainer]: context.type === 'manual',
      })}
      onClick={handleContainerClick}
    >
      <div
        ref={props.component}
        className={classNames({
          [styles.transparent]: context.type === 'remove' || !props.isMaster,
          [styles.content]: context.type !== 'remove' && props.isMaster,
          [styles.manualModal]: context.type === 'manual' && props.isMaster,
        })}
      >
        {props.isMaster && renderComponent()}
      </div>
    </div>,
    document.getElementById('portal-container'),
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(PlanningModal))
