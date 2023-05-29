import * as React from 'react'
import cx from 'classnames'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

interface IModalTemplateProps {
  visible: boolean
  isCloseBtn?: boolean
  onCloseFunc?: VoidFunction
}

class ModalTemplate extends React.PureComponent<IModalTemplateProps> {
  public componentDidMount() {
    document.addEventListener('keydown', this.escFunction)
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction)
  }

  public escFunction = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      if (this.props.visible && this.props.onCloseFunc) {
        this.props.onCloseFunc()
      }
    }
  }

  public render() {
    const classNames = cx(styles.modal, {
      [styles.active]: this.props.visible,
    })

    return (
      <div className={classNames}>
        <div className={styles.modalBody}>
          {this.props.isCloseBtn && (
            <button className={styles.closeModal} onClick={this.props.onCloseFunc}>
              <IconWrapper name="clear" classes={styles.clearIcon} />
            </button>
          )}
          <div className={styles.modalBodyContent}>{this.props.children}</div>
        </div>
        <div className={styles.modalBg} onClick={this.props.onCloseFunc} />
      </div>
    )
  }
}

export default ModalTemplate
