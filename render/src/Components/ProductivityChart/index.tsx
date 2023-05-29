import * as React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { PieChart, LineChart, LineData } from 'react-easy-chart'
import * as _ from 'lodash'
import { IRootState } from '@store/rootReducer'
import ProductivityInfo from '@components/ProductivityInfo'
import { IChartData } from '@services/types'

const mapStateToProps = (state: IRootState) => ({
  currentUser: state.user.currentUser,
  chartData: state.productivity.chartData,
  averageData: state.productivity.averageData,
  focuses: state.productivity.focuses,
})

const styles = require('./styles.module.scss')

type IChartProps = ReturnType<typeof mapStateToProps>

interface IChartState {
  isShowProductivity: boolean
  isOpenDetails: boolean
}

const activityColors = {
  OTHER: '#48555e',
  LEARNING: '#ffc400',
  ENTERTAINMENT: '#8777d9',
  COMMUNICATION: '#3781ed',
  WORK: '#73c546',
}

class ProductivityChart extends React.PureComponent<IChartProps, IChartState> {
  public state: IChartState = {
    isShowProductivity: false,
    isOpenDetails: false,
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.escFunction)
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction)
  }

  public escFunction = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      if (this.state.isOpenDetails) {
        this.setState({ isOpenDetails: false })
      }
    }
  }

  public getProductivityLine = (data: IChartData[], key: keyof IChartData) => {
    return data.map((productivity, index) => ({ x: index, y: productivity[key] }))
  }

  public toggleChartDetails = () => {
    this.setState(state => ({ isOpenDetails: !state.isOpenDetails }))
  }

  public toggleChartInfo = (isShowProductivity: boolean) => {
    this.setState({ isShowProductivity })
  }

  public render() {
    let { focuses, chartData } = this.props
    const { averageData } = this.props

    if (!chartData.length) {
      chartData = [
        {
          OTHER: 0,
          LEARNING: 0,
          ENTERTAINMENT: 0,
          COMMUNICATION: 0,
          WORK: 0,
        },
        {
          OTHER: 0,
          LEARNING: 0,
          ENTERTAINMENT: 0,
          COMMUNICATION: 0,
          WORK: 0,
        },
      ]
    }

    if (!focuses.length) {
      focuses = [
        {
          x: 0,
          y: 0,
        },
        {
          x: 10800,
          y: 0,
        },
      ]
    }

    const reducedLines = chartData.reduce(
      (red, item) => {
        return {
          OTHER: red.OTHER + item.OTHER,
          LEARNING: red.LEARNING + item.LEARNING,
          ENTERTAINMENT: red.ENTERTAINMENT + item.ENTERTAINMENT,
          COMMUNICATION: red.COMMUNICATION + item.COMMUNICATION,
          WORK: red.WORK + item.WORK,
        }
      },
      { ENTERTAINMENT: 0, COMMUNICATION: 0, LEARNING: 0, OTHER: 0, WORK: 0 },
    )

    const productivityData: LineData[][] = []
    const lineColors: string[] = []
    Object.keys(reducedLines).forEach((key: keyof typeof reducedLines) => {
      if (reducedLines[key] !== 0) {
        productivityData.push(this.getProductivityLine(chartData, key))
        lineColors.push(activityColors[key])
      }
    })

    const className = classnames(styles.productivity, {
      [styles.active]: this.state.isOpenDetails,
    })

    const currentFocus = Math.round(averageData.Focus)

    return (
      <div className={styles.productivityWrapper}>
        <div className={className} onClick={this.toggleChartDetails}>
          <div
            className={styles.productivityStatus}
            onMouseEnter={() => this.toggleChartInfo(true)}
            onMouseLeave={() => this.toggleChartInfo(false)}
          >
            <div className={styles.usefulStatus}>
              <div className={styles.pulseProgress}>
                <p className={styles.pulseProgressText}>Focus</p>
                <PieChart
                  size={46}
                  innerHoleSize={35}
                  data={[
                    { key: 'A', value: currentFocus, color: '#73c546' },
                    { key: 'B', value: 100 - currentFocus, color: '#3c4246' },
                  ]}
                  styles={{
                    '.pie-chart-slice': {
                      stroke: 'initial',
                    },
                  }}
                />
              </div>
              <div className={styles.activityPulse}>
                <p>
                  <strong>{currentFocus}%</strong>
                </p>
                <p>
                  {averageData.Points} <span className={styles.activityPulsePoints}>points</span>
                </p>
              </div>
            </div>

            <div className={styles.productivityChart}>
              {this.state.isShowProductivity ? (
                productivityData.length ? (
                  <LineChart
                    width={275}
                    interpolate={'basis'}
                    height={40}
                    lineColors={lineColors}
                    data={productivityData}
                  />
                ) : (
                  <LineChart
                    width={275}
                    interpolate={'basis'}
                    height={40}
                    lineColors={[activityColors.WORK]}
                    data={[
                      [
                        {
                          x: 0,
                          y: 0,
                        },
                        {
                          x: 1,
                          y: 0,
                        },
                      ],
                    ]}
                    yDomainRange={[0, 100]}
                    xDomainRange={[0, 1]}
                  />
                )
              ) : (
                <LineChart
                  width={275}
                  interpolate={'basis'}
                  height={40}
                  lineColors={['#73c546']}
                  data={[focuses]}
                  yDomainRange={[0, 100]}
                  xDomainRange={[0, 10800]}
                />
              )}
            </div>
          </div>
          {
            <div className={styles.chartInfo}>
              <ProductivityInfo />
            </div>
          }
        </div>
        {this.state.isOpenDetails && <div className={styles.charInfoBg} onClick={this.toggleChartDetails} />}
      </div>
    )
  }
}

export default connect(mapStateToProps)(ProductivityChart)
