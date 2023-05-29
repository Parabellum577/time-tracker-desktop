import * as React from 'react'
import classNames from 'classnames'

const styles = require('./styles.module.scss')

interface ICommentProps {
  value: string
  className?: string | []
  changeValue: (value: string) => void
  placeholder: string
}

const Comment: React.FC<ICommentProps> = props => {
  const { value, changeValue, placeholder } = props
  return (
    <div className={classNames(styles.commentBlock, props.className)}>
      <textarea
        className={styles.commentInput}
        placeholder={placeholder}
        onChange={e => changeValue(e.target.value)}
        maxLength={250}
        value={value}
      />
      {value && value.length > 0 && <span>{`${value.length} / 250`}</span>}
    </div>
  )
}

export default React.memo(Comment)
