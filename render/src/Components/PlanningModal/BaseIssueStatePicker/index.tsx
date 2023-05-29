import * as React from 'react'
import IconWrapper from '@components/IconWrapper'
import { INamedID } from '@services/types'
import classNames from 'classnames'

const styles = require('./styles.module.scss')

interface IBaseIssueStatePickerProps {
  setItem: React.Dispatch<React.SetStateAction<INamedID | INamedID['ID']>>
  projectItemsArr: INamedID[]
  title: 'Status' | 'Issue type' | 'Activity'
  item: INamedID
  projectItemId: string
}

const BaseIssueStatePicker: React.FC<IBaseIssueStatePickerProps> = props => {
  const statusMenu = React.useRef(null)
  const [isMenuOpened, setMenuOpened] = React.useState(false)
  const choseItem = props.item || props.projectItemsArr[0]

  React.useEffect(() => {
    props.setItem(choseItem)

    document.addEventListener<any>('click', detectOutClick)
    return () => {
      document.removeEventListener<any>('click', detectOutClick)
    }
  }, [])

  React.useEffect(() => {
    props.setItem(props.projectItemsArr[0])

    return () => {
      props.setItem(null)
    }
  }, [props.projectItemId])

  const statusMenuToggle = React.useCallback(() => {
    setMenuOpened(!isMenuOpened)
  }, [isMenuOpened])

  const detectOutClick = (e: React.MouseEvent) => {
    if (!statusMenu.current.contains(e.target as Node)) {
      setMenuOpened(false)
    }
  }

  return (
    <div className={styles.stateItem} ref={statusMenu} onClick={statusMenuToggle}>
      <span>
        {props.title}: <mark>{choseItem ? choseItem.Name : null}</mark>
      </span>
      <IconWrapper
        name="arrowDownIcon"
        color="#2f2e3e"
        classes={classNames(styles.arrowIcon, isMenuOpened ? styles.arrowIconActive : null)}
      />
      {isMenuOpened ? (
        <ul
          className={classNames(styles.menu, {
            [styles.menuStatus]: props.title === 'Status',
            [styles.menuType]: props.title === 'Issue type',
            [styles.menuActivity]: props.title === 'Activity',
          })}
        >
          {props.projectItemsArr.map(item => {
            return (
              <li
                key={item.Name}
                onClick={e => {
                  props.setItem(item)
                }}
              >
                <span>{item.Name}</span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default React.memo(BaseIssueStatePicker)
