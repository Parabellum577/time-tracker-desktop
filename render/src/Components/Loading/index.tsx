import * as React from 'react'

const styles = require('./index.module.scss')

interface IOwnProps {
  proportions: number
}

const Loading: React.FC<IOwnProps> = props => {
  const loaderOptions = {
    width: props.proportions,
    height: props.proportions,
  }

  return <div className={styles.loader} style={loaderOptions} />
}

export default React.memo(Loading)
