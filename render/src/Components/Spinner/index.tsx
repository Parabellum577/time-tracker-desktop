import * as React from 'react'

const styles = require('./styles.module.scss')

const Spinner: React.FC = () => (
  <div className={styles.ellipsis}>
    <div />
    <div />
    <div />
    <div />
  </div>
)

export default React.memo(Spinner)
