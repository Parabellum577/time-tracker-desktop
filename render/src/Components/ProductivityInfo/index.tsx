import * as React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'
import withStyles from '@material-ui/core/styles/withStyles'
import IconWrapper from '@components/IconWrapper'
import TrackedTime from '@components/TrackedTime'
import { openExternal } from '@services/openWindow'
import api from '@services/api'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./styles.module.scss')

const BarsColors: { [index: string]: string } = {
  WORK: '#73c546',
  COMMUNICATION: '#3781ed',
  LEARNING: '#ffc400',
  ENTERTAINMENT: '#8777d9',
  OTHER: '#48555e',
}

const ProductivityInfo: React.FC = () => {
  const currentUser = useShallowEqualSelector(state => state.user.currentUser)
  const averageData = useShallowEqualSelector(state => state.productivity.averageData)
  const sumTimeOfTypes = {
    WORK: averageData.AverageWork,
    COMMUNICATION: averageData.AverageCommunication,
    LEARNING: averageData.AverageLearning,
    ENTERTAINMENT: averageData.AverageEntertainment,
    OTHER: averageData.AverageOther,
  }
  React.useEffect(() => {
    setAnalyticsView(`ProductivityInfo`)
    return () => {
      setAnalyticsView(`Main`)
    }
  }, [])

  const openFocusPage = async () => {
    const OTS = await api.user.GetOTS()
    openExternal(`${process.env.REDIRECT_URL}/desktop/login?otscode=${OTS}&action=Focus`)
  }

  return (
    <div className={styles.chartInfoInner}>
      <div className={styles.userInfoBlock}>
        <img src={currentUser.Avatar} alt={`${currentUser.FirstName} ${currentUser.LastName}`} width="68" height="68" />
        <div className={styles.userInfoMetrics}>
          <div className={styles.userName} onClick={openFocusPage}>
            <p>{`${currentUser.FirstName} ${currentUser.LastName}`}</p>
            <IconWrapper name="openRemote" />
          </div>
          <div className={styles.metrics}>
            <div className={styles.productivityMetric}>
              <IconWrapper name="blueClockIcon" />
              <div>
                <p>
                  <TrackedTime />
                </p>
                <p>Tracked Today</p>
              </div>
            </div>
            <div className={styles.productivityMetric}>
              <IconWrapper name="tickIcon" />
              <div>
                <p>
                  <strong>{averageData.UsefullActivityPercent} %</strong>
                </p>
                <p>Useful</p>
              </div>
            </div>
            <div className={styles.productivityMetric}>
              <IconWrapper name="coffeeIcon" />
              <div>
                <p>
                  <strong>{100 - averageData.UsefullActivityPercent} %</strong>
                </p>
                <p>Respite</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.progressBars}>
        {Object.keys(sumTimeOfTypes).map((item: keyof typeof sumTimeOfTypes) => {
          const BorderLinearProgress = withStyles({
            root: {
              height: 2,
              backgroundColor: '#2f373d',
              marginBottom: 15,
            },
            bar: {
              borderRadius: 1,
              backgroundColor: BarsColors[item],
            },
          })(LinearProgress)

          const percentage = sumTimeOfTypes[item]

          return (
            <div key={item}>
              <p>
                {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                <span>{percentage > 0 ? `${percentage} %` : '0'}</span>
              </p>
              <BorderLinearProgress variant="determinate" value={percentage} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default React.memo(ProductivityInfo)
