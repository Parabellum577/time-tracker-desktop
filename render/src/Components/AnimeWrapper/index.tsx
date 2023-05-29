import * as React from 'react'
import { useDispatch } from 'react-redux'
import { goBack, push } from 'connected-react-router'
import classNames from 'classnames'
import HeaderModal from './HeaderModal'
import { MainContext } from '@Routers'

const styles = require('./styles.module.scss')

interface IAnimeWrapperProps {
  title?: string
  withoutHeader?: boolean
  component: React.ComponentType<any>
  isReturnButton?: boolean
  isRedirectToMain?: boolean
  isModal?: boolean
}

export default function AnimeWrapper(props: IAnimeWrapperProps) {
  return () => <Wrapper {...props} />
}

const Wrapper: React.FC<IAnimeWrapperProps> = props => {
  const context = React.useContext(MainContext)
  const componentWrapRef = React.useRef(null)
  const ChosenComponent = props.component

  React.useEffect(() => {
    document.addEventListener('keyup', keyUpHandler)
    return () => {
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])

  const dispatch = useDispatch()

  const toPrevComponent = React.useCallback(() => {
    const action = goBack()
    dispatch(action)
  }, [dispatch])

  const redirectToMain = React.useCallback(() => {
    const action = push('/main')
    dispatch(action)
  }, [dispatch])

  const keyUpHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModalWindow()
    }
  }

  const closeModalWindow = () => {
    context.clearContext()
    if (props.isRedirectToMain || props.isReturnButton) {
      redirectToMain()
    } else {
      toPrevComponent()
    }
  }

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.modalWindow]: props.isModal,
      })}
      ref={componentWrapRef}
    >
      {!props.withoutHeader && (
        <HeaderModal
          title={props.title || ''}
          isModal={props.isModal}
          closeModalWindow={closeModalWindow}
          isReturnButton={props.isReturnButton || null}
        />
      )}
      <ChosenComponent />
    </div>
  )
}
