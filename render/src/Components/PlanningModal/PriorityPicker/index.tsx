import * as React from 'react'

import classNames from 'classnames'
import { INamedID } from '@services/types'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

interface IOwnProps {
  setPriority: React.Dispatch<React.SetStateAction<INamedID>>
  priority: INamedID
  projectPriorities: INamedID[]
  projectItemId: string
}

const PriorityPicker: React.FC<IOwnProps> = props => {
  const priorityMenu = React.useRef<HTMLDivElement>(null)
  const [isMenuOpened, setMenuOpened] = React.useState(false)
  const choosePriority = props.priority || props.projectPriorities[0]

  React.useEffect(() => {
    props.setPriority(choosePriority)

    document.addEventListener<any>('click', detectOutClick)
    return () => {
      document.removeEventListener<any>('click', detectOutClick)
    }
  }, [])

  React.useEffect(() => {
    props.setPriority(props.projectPriorities[0])

    return () => {
      props.setPriority(null)
    }
  }, [props.projectItemId])

  const priorityMenuToggle = React.useCallback(() => {
    setMenuOpened(!isMenuOpened)
  }, [isMenuOpened])

  const detectOutClick = (e: React.MouseEvent) => {
    if (priorityMenu.current && !priorityMenu.current.contains(e.target as Node)) {
      setMenuOpened(false)
    }
  }

  return (
    <div className={styles.actionItem} ref={priorityMenu} onClick={priorityMenuToggle}>
      <IconWrapper
        name="priorityIcon"
        classes={classNames(styles.priority, styles[`priority${choosePriority ? choosePriority.Name : ''}`])}
        height="20px"
        width="20px"
      />
      {isMenuOpened ? (
        <ul className={styles.priorityMenu}>
          {props.projectPriorities.map(item => {
            return (
              <li
                key={item.Name}
                onClick={e => {
                  props.setPriority(item)
                }}
              >
                <button>
                  <IconWrapper
                    name="priorityIcon"
                    classes={classNames(styles.priority, styles[`priority${item.Name}`])}
                  />
                  <span>{item.Name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default React.memo(PriorityPicker)
