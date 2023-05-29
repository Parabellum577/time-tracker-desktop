import * as React from 'react'

const styles = require('./styles.module.scss')
const spinner = require('@images/spinner.gif')

const SpinnerPage = () => (
  <section className={styles.spinnerPage}>
    <img src={spinner} alt="spinner" />
  </section>
)

export default React.memo(SpinnerPage)
