import * as React from 'react'
import * as classNames from 'classnames'

import useShallowEqualSelector from '@services/useShallowEqualSelector'

import Hint from '@components/Hint'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

interface IOwnProps {
  isShowUnassignedTasks: boolean
  setIsShowUnassignedTasks: React.Dispatch<React.SetStateAction<boolean>>
}

const FiltrationMenu: React.FC<IOwnProps> = ({ isShowUnassignedTasks, setIsShowUnassignedTasks }) => {
  const currentUser = useShallowEqualSelector(state => state.user.currentUser)
  const menuContainerRef = React.useRef<HTMLDivElement>()
  const avatar = (currentUser && currentUser.Avatar) || ''

  const [isOpenedMenu, setIsOpenedMenu] = React.useState(false)

  React.useEffect(() => {
    if (!isOpenedMenu) {
      return
    }

    const closeMenuHandler = (e: MouseEvent) => {
      if (e.target instanceof Element && !menuContainerRef.current.contains(e.target)) {
        setIsOpenedMenu(false)
      }
    }
    document.addEventListener('click', closeMenuHandler)
    return () => {
      document.removeEventListener('click', closeMenuHandler)
    }
  }, [isOpenedMenu])

  return (
    <div>
      <IconWrapper
        name="iconFiltration"
        title="Filtration and sorting"
        classes={styles.icon}
        color="#1991eb"
        onClick={() => setIsOpenedMenu(true)}
      />
      {isOpenedMenu && (
        <div className={styles.menuContainer} ref={menuContainerRef}>
          <Hint
            hintText={isShowUnassignedTasks ? 'My and unassigned tasks' : 'My tasks only'}
            // customClassName={styles.icon}
            position="right"
          >
            <div className={styles.menuItem} onClick={() => setIsShowUnassignedTasks(!isShowUnassignedTasks)}>
              <img src={avatar} className={styles.actionsBarAvatar} alt="avatar" />
              <p>My tasks only</p>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked={!isShowUnassignedTasks} disabled={true} />
                <span className={classNames(styles.slider, !isShowUnassignedTasks && styles.checked)} />
              </label>
            </div>
          </Hint>
        </div>
      )}
    </div>
  )
}

export default React.memo(FiltrationMenu)
