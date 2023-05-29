import * as React from 'react'
import * as _ from 'lodash'
import classNames from 'classnames'
import { useDebouncedCallback } from 'use-debounce'

import time from '@services/time'

const styles = require('./selector.module.scss')

interface ITimeSelectorProps {
  maxTime: number
  minTime: number
  value: number
  isColdPlanning?: boolean
  shouldForceUpdate?: boolean
  field: 'plan' | 'estimate' | 'start' | 'end'
  updateTime: (value: number) => void
  readOnly?: boolean
  renderFromPage?: 'ASSIGN_COLD_START' | 'MANUAL_REPORT' | 'CREATE_TASK' | 'PLANNING_REPORT'
  isOverSpendIncluded?: boolean
}

const timeToSeconds = (hours: number | string, minutes: number | string, seconds: number | string) =>
  +hours * 3600 + +minutes * 60 + +seconds

const TimeSelector: React.FC<ITimeSelectorProps> = props => {
  const parsedTime = time.parseSeconds(props.value)
  const [hoursInput, setHoursInput] = React.useState(parsedTime.hours.toString().padStart(2, '0'))
  const [minutesInput, setMinutesInput] = React.useState(parsedTime.minutes.toString().padStart(2, '0'))
  const [currentValue, setCurrentValue] = React.useState(props.value)
  const [currentMaxTime, setMaxTime] = React.useState(props.maxTime)
  const [currentMinTime, setMinTime] = React.useState(props.minTime)

  const [delayedValidate] = useDebouncedCallback(
    (currentValueClosured: number, currentMinTimeClosured: number, currentMaxTimeClosured: number) => {
      let total = currentValueClosured

      if (total > currentMaxTimeClosured) {
        total = currentMaxTimeClosured
      }

      if (total < currentMinTimeClosured) {
        total = currentMinTimeClosured
      }

      if (total !== currentValueClosured) {
        setCurrentValue(total)
        const { hours, minutes } = time.parseSeconds(total)
        setHoursInput(hours.toString().padStart(2, '0'))
        setMinutesInput(minutes.toString().padStart(2, '0'))
        setMaxTime(props.maxTime)
        setMinTime(props.minTime)
        if (!props.shouldForceUpdate) {
          props.updateTime(total)
        }
      }
    },
    1500,
  )

  React.useEffect(() => {
    let newValue

    if (props.shouldForceUpdate) {
      newValue = props.value
    } else if (currentValue === currentMaxTime) {
      newValue = props.maxTime
    } else if (currentValue === currentMinTime && currentMinTime > 0) {
      newValue = props.minTime
    } else {
      return
    }

    setCurrentValue(newValue)
    const { hours, minutes } = time.parseSeconds(newValue)
    setHoursInput(hours.toString().padStart(2, '0'))
    setMinutesInput(minutes.toString().padStart(2, '0'))
    setMaxTime(props.maxTime)
    setMinTime(props.minTime)
    if (props && props.updateTime && props.renderFromPage === 'PLANNING_REPORT' && !props.shouldForceUpdate) {
      props.updateTime(newValue)
    }
  })

  const formatFields = () => {
    setHoursInput(hoursInput)
    setMinutesInput(minutesInput.padStart(2, '0'))
  }

  const keyPressed = (event: React.ChangeEvent<HTMLInputElement>, field: 'hours' | 'minutes') => {
    let { value } = event.currentTarget

    if (isNaN(+value) || props.readOnly) {
      return
    }

    if (event.currentTarget.value.startsWith('0')) {
      value = value.slice(1)
    }

    let total

    if (field === 'hours') {
      const maxLength = currentMaxTime < 99 * 3600 ? 2 : 3

      if (value.length > maxLength) {
        return
      }

      total = timeToSeconds(value, minutesInput, currentValue % 60)
    } else {
      if (value.length > 2) {
        return
      }
      let minutes = +value

      if (minutes > 59) {
        minutes = 59
      }

      total = timeToSeconds(hoursInput, minutes, currentValue % 60)
    }

    if (total < 0) {
      total = 0
    }

    delayedValidate(total, currentMinTime, currentMaxTime)

    const newParsedValue = time.parseSeconds(total)

    setHoursInput(newParsedValue.hours.toString().padStart(2, '0'))
    setMinutesInput(newParsedValue.minutes.toString().padStart(2, '0'))
    if (field === 'hours') {
      setMinutesInput(newParsedValue.minutes.toString().padStart(2, '0'))
    } else {
      setHoursInput(newParsedValue.hours.toString().padStart(2, '0'))
    }

    setCurrentValue(total)
    props.updateTime(total)
    console.log('keyPressed -> total', total)
  }

  const handleScroll = (e: React.WheelEvent<HTMLInputElement>, field: 'hours' | 'minutes') => {
    if (props.readOnly) {
      return
    }

    let total: number = Math.floor(currentValue / 60) * 60

    if (field === 'hours') {
      total += e.deltaY < 0 ? 3600 : -3600
    } else {
      total += e.deltaY < 0 ? 60 : -60
    }

    if (total < 0) {
      total = 0
    }

    if (total >= currentMaxTime) {
      total = Math.min(total, currentMaxTime)
    }

    delayedValidate(total, currentMinTime, currentMaxTime)

    const { hours, minutes } = time.parseSeconds(total)

    props.updateTime(total)
    setCurrentValue(total)
    setHoursInput(hours.toString().padStart(2, '0'))
    setMinutesInput(minutes.toString().padStart(2, '0'))
    console.log('handleScroll -> total', total)
  }

  const isOverSpendBlock = () =>
    props.renderFromPage === 'PLANNING_REPORT' && props.isOverSpendIncluded && props.field === 'estimate'

  return (
    <div
      className={classNames(styles.timePicker, {
        [styles.disabled]: props.readOnly,
        [styles.manualModal]: props.renderFromPage === 'MANUAL_REPORT',
        [styles.overSpend]: isOverSpendBlock(),
      })}
    >
      <div className={styles.timeWrap}>
        <div className={styles.inputBlock} id={`${props.field}-hours`}>
          <input
            onChange={e => keyPressed(e, 'hours')}
            onWheel={e => handleScroll(e, 'hours')}
            onBlur={formatFields}
            onClick={e => {
              if (e.target instanceof HTMLInputElement) {
                e.target.select()
              }
            }}
            className={classNames(styles.hours, props.maxTime >= 60 * 60 * 100 ? styles.hoursLarge : null)}
            type="text"
            value={hoursInput}
          />
        </div>
        <span className={styles.divider}>:</span>
        <div className={styles.inputBlock} id={`${props.field}-minutes`}>
          <input
            onBlur={formatFields}
            onChange={e => keyPressed(e, 'minutes')}
            onWheel={e => handleScroll(e, 'minutes')}
            onClick={e => {
              if (e.target instanceof HTMLInputElement) {
                e.target.select()
              }
            }}
            className={styles.minutes}
            type="text"
            value={minutesInput}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(TimeSelector)
