import * as React from 'react'
import classNames from 'classnames'

const styles = require('./hint.module.scss')

type positionValueType = 'left' | 'right' | 'center'

interface IOwnProps {
  hintText: string
  children: React.ReactNode
  customClassName?: string
  position: positionValueType
}

const Hint: React.FC<IOwnProps> = props => {
  const [isHintShow, setHintShow] = React.useState(false)
  const [hintShowTimeOut, setHintShowTimeout] = React.useState<NodeJS.Timeout>()

  const hintShow = () => {
    setHintShowTimeout(
      setTimeout(() => {
        setHintShow(true)
      }, 500),
    )
  }

  const hintHide = () => {
    if (isHintShow) {
      setHintShow(false)
    }
    clearTimeout(hintShowTimeOut)
  }

  return (
    props.hintText && (
      <div className={classNames(styles.hintBlock, props.customClassName)}>
        <div className={styles.hintArea} onMouseEnter={hintShow} onMouseLeave={hintHide}>
          {props.children}
        </div>
        {isHintShow && (
          <div
            className={classNames(styles.hintPopupWrap, {
              [styles.hintPopupWrapLeft]: props.position === 'left',
              [styles.hintPopupWrapRight]: props.position === 'right',
              [styles.hintPopupWrapCenter]: props.position === 'center',
            })}
          >
            <div className={styles.hintPopup}>
              <span>{props.hintText}</span>
            </div>
          </div>
        )}
      </div>
    )
  )
}

export default React.memo(Hint)
