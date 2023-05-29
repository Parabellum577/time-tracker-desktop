import * as React from 'react'
import * as _ from 'lodash'

import { openExternal } from '@services/openWindow'
import { formatTime } from '@services/formater'
import IconWrapper from '@components/IconWrapper'
import Timeline from '@components/Timeline'
import api from '@services/api'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import Nav from '@components/Nav'

const styles = require('./styles.module.scss')

const Header: React.FC = props => {
  const coldPlannings = useShallowEqualSelector(state => state.plannings.coldPlannings)
  const timeSummary = useShallowEqualSelector(state => state.plannings.timeSummary)
  const [popoverState, handlePopover] = React.useState(false)

  const openDashboard = async () => {
    const OTS = await api.user.GetOTS()
    const href = `${process.env.REDIRECT_URL}/desktop/login?otscode=${OTS}&action=Focus`
    openExternal(href)
  }

  const handleWebRedirect = async (type: string) => {
    const OTS = await api.user.GetOTS()
    const href = `${process.env.REDIRECT_URL}/desktop/login?otscode=${OTS}&action=reportsMonthly`
    openExternal(href)
  }

  const handlePopoverOn = () => {
    handlePopover(true)
  }

  const handlePopoverOff = () => {
    handlePopover(false)
  }

  const { sumTotalDay, sumManualToday, sumTotalMonth, sumManualMonth } = timeSummary

  const dataBlockProps = [
    {
      title: 'Tracked Today',
      type: 'trackedToday',
      value: sumTotalDay,
    },
    {
      title: 'Manual today',
      type: 'manualToday',
      value: sumManualToday,
    },
    {
      title: 'Tracked This Month',
      type: 'trackedMonth',
      value: sumTotalMonth,
    },
    {
      title: 'Manual this month',
      type: 'manualMonth',
      value: sumManualMonth,
    },
  ]

  const isActiveColdStart = coldPlannings.some(p => p.Active)

  return (
    <section className={styles.header}>
      <div className={styles.trackedTime}>
        <div className={styles.trackedTimeTitle} onMouseEnter={handlePopoverOn} onMouseLeave={handlePopoverOff}>
          <IconWrapper name="iconToday" classes={styles.todayIcon} />
          <span>Today</span>
          <span className={styles.timer}>{formatTime(sumTotalDay, 'Hh MMm')}</span>

          {popoverState ? (
            <div className={styles.popover}>
              <span className={styles.arrowIcon} />
              <h1 className={styles.popoverTitle}>Time Summary</h1>
              <div className={styles.popoverDataWrap}>
                {dataBlockProps.map(item => {
                  return (
                    <div
                      key={item.type}
                      className={styles.popoverDataBlock}
                      onClick={() => handleWebRedirect(item.type)}
                    >
                      <h3 className={styles.label}>{item.title}</h3>
                      <div className={styles.dataValue}>{formatTime(item.value, 'HH:MM')}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.dashboard} onClick={openDashboard} title="Open Web Dashboard">
            <span>Dashboard</span>
            <IconWrapper name="iconDashboard" classes={styles.todayIcon} />
          </div>
        </div>
      </div>
      <Timeline />
      <div className={styles.divider} />
    </section>
  )
}

export default React.memo(Header)
