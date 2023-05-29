import * as React from 'react'
import IconWrapper from '@components/IconWrapper'

const styles = require('./password-hint.module.scss')

interface IOptionalPosition {
  top?: string
  bottom?: string
  left: string
}
interface IPasswordHintProps {
  hasLowerCase: boolean
  hasReqLength: boolean
  hasUpperCaseOrNumber: boolean
  optionalPosition?: IOptionalPosition
}

class PasswordHint extends React.PureComponent<IPasswordHintProps> {
  public render() {
    const { hasLowerCase, hasReqLength, hasUpperCaseOrNumber, optionalPosition } = this.props
    const passwordElements = [
      { title: 'Lower case letter', flag: hasLowerCase },
      { title: 'Upper case letter or number', flag: hasUpperCaseOrNumber },
      { title: 'At least 8 to 64 characters', flag: hasReqLength },
    ]

    return (
      <div className={styles.passwordHint} style={optionalPosition || null}>
        <div className={styles.arrow} />
        <p>Your password must have:</p>
        <ul>
          {passwordElements.map(item => (
            <li key={item.title}>
              <IconWrapper
                classes={item.flag ? styles.checkIcon : styles.crossIcon}
                key={`${item.flag}-${item.title}`}
                name={item.flag ? 'check_circle_outline' : 'highlight_off'}
              />
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default PasswordHint
