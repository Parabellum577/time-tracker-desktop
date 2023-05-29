import * as React from 'react'
import { connect } from 'react-redux'
import classNames = require('classnames')
import * as _ from 'lodash'

import { IRootState } from '@store/rootReducer'
import { IExtendedSpentTimeHistory } from '@services/types'
import { formatTime } from '@services/formater'
import IconWrapper from '@components/IconWrapper'
import time from '@services/time'
import CreateModal from '@components/PlanningModal'

const styles = require('./styles.module.scss')

const mapStateToProps = (state: IRootState) => ({
  timeline: state.timeline.timeline,
})

type IProps = ReturnType<typeof mapStateToProps>
interface IState {
  isHoveredPart: boolean
  isOpenManualForm: boolean
  hoveredPart: IExtendedSpentTimeHistory
  scrollLeft: number
  manualSelector:
    | {
        Start: number
        End: number
        IsShowed: true
      }
    | {
        IsShowed: false
      }
  manualSelectorPreview: {
    Start?: number
    IsShowed: boolean
  }
}

const HOUR_LABELS = _.range(1, 24).map(i => formatTime(i * 3600, 'HH:MM'))
HOUR_LABELS.unshift('')

class Timeline extends React.PureComponent<IProps, IState> {
  get getTooltip() {
    if (!this.state.isHoveredPart || this.state.manualSelector.IsShowed) {
      return null
    }
    const part = this.state.hoveredPart
    const planning = part.Planning
    return (
      <div className={styles.tooltip}>
        <div className={styles.issueNameContainer}>
          <IconWrapper name={this.state.hoveredPart.TrackerType} height="32px" width="32px" />
          <div>
            <p className={styles.issueTitle}>{planning.IssueTitle}</p>
            <p className={styles.issueID}>#{planning.IssueID}</p>
          </div>
        </div>
        <div
          className={styles.progress}
          style={{
            backgroundColor: planning.IsColdPlanning ? '#17bcf4' : '#33af13',
          }}
        />
        <div className={styles.interval}>
          <p> Started {formatTime(part.StartedAt - time.startOfDay(), 'HH:MM')}</p>
          <p className={styles.durationTime}>{this.getDuration(part)}</p>
          <p> Stopped {formatTime(part.EndedAt - time.startOfDay(), 'HH:MM')}</p>
        </div>
      </div>
    )
  }

  public refTimeline = React.createRef<HTMLDivElement>()
  public refLabels = React.createRef<HTMLDivElement>()

  public state: IState = {
    isHoveredPart: false,
    isOpenManualForm: false,
    hoveredPart: null,
    scrollLeft: 0,
    manualSelector: {
      IsShowed: false,
    },
    manualSelectorPreview: {
      Start: null,
      IsShowed: false,
    },
  }

  public scrollTimeline = _.throttle((value: number) => {
    const oneScrollPixel = value > 0 ? 1 : -1
    let countOfIterations = 0
    const step = () => {
      countOfIterations++
      if (countOfIterations > Math.abs(value)) {
        return
      }
      requestAnimationFrame(step)
      this.refTimeline.current.scrollLeft += oneScrollPixel
      this.refLabels.current.scrollLeft += oneScrollPixel
    }
    step()
    this.setState({
      scrollLeft: this.refLabels.current.scrollLeft,
    })
  }, 400)

  public selectDirection: 'right' | 'left' = 'right'

  public componentDidMount = () => {
    const scrollLeftPercent = (time.now() - time.startOfDay()) / (time.endOfDay() - time.startOfDay())
    const scrollPixels = this.refTimeline.current.clientWidth * scrollLeftPercent
    setTimeout(() => {
      this.setState({ scrollLeft: scrollPixels })
      this.refTimeline.current.scrollLeft = scrollPixels
      this.refLabels.current.scrollLeft = scrollPixels
    }, 200)

    document.addEventListener('keyup', this.keyUpHandler)
  }

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.keyUpHandler)
  }

  public keyUpHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.setState({
        manualSelector: {
          IsShowed: false,
        },
        isOpenManualForm: false,
      })
    }
  }

  public handleScroll = (e: React.WheelEvent) => {
    const additionalValue = e.deltaY < 0 ? 30 : -30
    const minScrolled = Math.min(this.refTimeline.current.scrollLeft, this.refLabels.current.scrollLeft)
    const scrollPixels = minScrolled + additionalValue
    this.refTimeline.current.scrollLeft = scrollPixels
    this.refLabels.current.scrollLeft = scrollPixels
    this.setState({ scrollLeft: this.refLabels.current.scrollLeft })
  }

  public getDuration(part: IExtendedSpentTimeHistory) {
    return formatTime(part.EndedAt - part.StartedAt, 'HH:MM:SS')
  }

  public handleManualSelectorStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.state.manualSelector.IsShowed) {
      this.setState({
        manualSelector: {
          IsShowed: false,
        },
        isOpenManualForm: false,
      })
      return
    }

    const Start = event.clientX + this.refTimeline.current.scrollLeft
    const End = Start
    this.setState({
      manualSelector: {
        IsShowed: true,
        Start,
        End,
      },
    })
  }

  public handleManualSelectorEnd = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.state.manualSelector.IsShowed) {
      return
    }

    const { Start, End } = this.state.manualSelector
    let left: number = Start
    let right: number = End

    if (Start === End) {
      const position = this.pixelToPercent(Start)
      const { spentPart, leftPartOfSlice, rightPartOfSlice } = this.getSliceByTime(position)

      if (!spentPart || !spentPart.IsEmpty) {
        this.setState({
          manualSelector: {
            IsShowed: false,
          },
          isOpenManualForm: false,
        })
        return
      }

      const TWO_HOURS_IN_PIXELS = 74.666666666666666

      if (this.percentToPixel(spentPart.minWidth) > TWO_HOURS_IN_PIXELS) {
        if (this.percentToPixel(leftPartOfSlice) < TWO_HOURS_IN_PIXELS / 2) {
          left = Start - this.percentToPixel(leftPartOfSlice)
          right = left + TWO_HOURS_IN_PIXELS
        } else if (this.percentToPixel(rightPartOfSlice) < TWO_HOURS_IN_PIXELS / 2) {
          right = Start + this.percentToPixel(rightPartOfSlice)
          left = right - TWO_HOURS_IN_PIXELS
        } else {
          left = Start - TWO_HOURS_IN_PIXELS / 2
          right = Start + TWO_HOURS_IN_PIXELS / 2
        }
      } else {
        left = Start - this.percentToPixel(leftPartOfSlice)
        right = Start + this.percentToPixel(rightPartOfSlice)
      }
    } else {
      const startPosition = this.pixelToPercent(Start)
      let { spentPart, leftPartOfSlice, rightPartOfSlice, accumulatedWidth } = this.getSliceByTime(startPosition)
      if (spentPart.IsEmpty) {
        if (leftPartOfSlice < 4) {
          left = Start - this.percentToPixel(leftPartOfSlice)
        }
      } else {
        left = Start + this.percentToPixel(rightPartOfSlice)
      }

      const endPosition = this.pixelToPercent(End)
      ;({ spentPart, leftPartOfSlice, rightPartOfSlice, accumulatedWidth } = this.getSliceByTime(endPosition))
      if (spentPart.IsEmpty) {
        if (rightPartOfSlice < 4) {
          right = End + this.percentToPixel(rightPartOfSlice)
        }
      } else {
        ;({ spentPart, accumulatedWidth } = this.getSliceByTime(accumulatedWidth - 0.01))
        right =
          End - this.percentToPixel(leftPartOfSlice) - (spentPart.IsEmpty ? 0 : this.percentToPixel(spentPart.minWidth))
      }
    }

    this.setState({
      manualSelector: {
        IsShowed: right - left > 3,
        Start: left,
        End: right,
      },
      isOpenManualForm: true,
    })
  }

  public handleManualSelectorMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // If Mouse pressed, we should select slice
    if (event.buttons === 0 || !this.state.manualSelector.IsShowed) {
      return
    }

    const position = event.clientX + this.refTimeline.current.scrollLeft
    let Start = this.state.manualSelector.Start
    let End = this.state.manualSelector.End

    if (position === Start || position === End) {
      return
    }

    if (position > End && event.movementX > 0 && this.selectDirection === 'right') {
      // position to the right, the mouse moves to the right, before that the right slider moved
      End = position
      this.selectDirection = 'right'
    } else if (position > End && event.movementX > 0 && this.selectDirection === 'left') {
      // position to the right, the mouse moves to the right, before that the left slider moved
      Start = End
      End = position
      this.selectDirection = 'right'
    } else if (position > Start && position < End && event.movementX < 0 && this.selectDirection === 'left') {
      // position on the selector, the mouse moves to the left
      End = position
      this.selectDirection = 'right'
    } else if (position > Start && position < End && event.movementX > 0 && this.selectDirection === 'left') {
      // position on the selector, the mouse moves to the right
      Start = position
      this.selectDirection = 'left'
    } else if (position < Start && event.movementX < 0 && this.selectDirection === 'left') {
      // the position to the left, the mouse moves to the left, before that the left slider moved
      Start = position
      this.selectDirection = 'left'
    } else if (position < Start && event.movementX < 0 && this.selectDirection === 'right') {
      // the position to the left, the mouse moves to the left, before that the right slider moved
      End = Start
      Start = position
      this.selectDirection = 'left'
    } else {
      console.error('TIMELINE BUG', Start, End, position)
    }

    if (event.clientX < 20) {
      this.scrollTimeline(-30)
    } else if (this.refTimeline.current.clientWidth - event.clientX < 20) {
      this.scrollTimeline(30)
    }

    this.setState({
      manualSelector: {
        IsShowed: true,
        Start,
        End,
      },
    })
  }

  public handleManualSelectorPreviewMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // If Mouse pressed, we should select slice
    if (this.state.manualSelector.IsShowed || this.state.isHoveredPart || event.buttons !== 0) {
      return
    }

    this.setState({
      manualSelectorPreview: {
        IsShowed: true,
        Start: event.clientX,
      },
    })
  }

  public getManualSelector = () => {
    if (!this.state.manualSelector.IsShowed) {
      return null
    }
    const width = this.state.manualSelector.End - this.state.manualSelector.Start
    const left = this.state.manualSelector.Start - this.refTimeline.current.scrollLeft
    const start = this.pixelToPercent(left + this.refTimeline.current.scrollLeft)
    const end = this.pixelToPercent(left + width + this.refTimeline.current.scrollLeft)

    const startPart = this.getSliceByTime(start)
    const endPart = this.getSliceByTime(end)
    let emptySlicesWidth = 0

    if (startPart.foundIndex === endPart.foundIndex) {
      emptySlicesWidth = this.pixelToPercent(width)
    } else {
      if (startPart.spentPart && startPart.spentPart.IsEmpty) {
        emptySlicesWidth += startPart.rightPartOfSlice
      }

      if (endPart.spentPart && endPart.spentPart.IsEmpty) {
        emptySlicesWidth += endPart.leftPartOfSlice
      }

      if (startPart.foundIndex && endPart.foundIndex) {
        for (let index = startPart.foundIndex + 1; index < endPart.foundIndex; index++) {
          const part = this.props.timeline[index]
          emptySlicesWidth += part.IsEmpty ? part.minWidth : 0
        }
      }
    }

    const emptySlicesTime = Math.round(emptySlicesWidth * 432)
    const startTime = this.pixelToPercent(left + this.refTimeline.current.scrollLeft) * 432
    const endTime = this.pixelToPercent(left + width + this.refTimeline.current.scrollLeft) * 432

    return (
      <>
        <div
          className={styles.manualSelector}
          style={{
            width,
            left,
          }}
        />
        {width > 74 && (
          <>
            <div
              className={styles.manualSelectorTop}
              style={{
                width,
                left,
              }}
            >
              <p>+ {formatTime(emptySlicesTime, 'H:MMm')}</p>
              <div />
            </div>
            <div
              className={styles.manualSelectorBottom}
              style={{
                width,
                left,
              }}
            >
              <div className={styles.left}>{formatTime(startTime, 'HH:MM')}</div>
              <div className={styles.right}>{formatTime(endTime, 'HH:MM')}</div>
            </div>
          </>
        )}
      </>
    )
  }

  public percentToPixel = (value: number) => {
    const timelineNode = this.refTimeline.current
    return (value / 100) * timelineNode.clientWidth
  }

  public pixelToPercent = (value: number) => {
    const timelineNode = this.refTimeline.current
    return (value * 100) / timelineNode.clientWidth
  }

  public getSliceByTime = (position: number) => {
    let spentPart: IExtendedSpentTimeHistory
    let foundIndex: number
    const { timeline } = this.props
    let accumulatedWidth = 0

    for (let index = 0; index < timeline.length; index++) {
      if (index === 0) {
        if (timeline[0].minWidth >= position) {
          spentPart = _.cloneDeep(timeline[0])
          foundIndex = index
          break
        }

        continue
      }

      accumulatedWidth += timeline[index - 1].minWidth

      if (accumulatedWidth < position && position < accumulatedWidth + timeline[index].minWidth) {
        spentPart = _.cloneDeep(timeline[index])
        foundIndex = index
        break
      }
    }

    if (!spentPart) {
      return {}
    }

    const leftPartOfSlice = position - accumulatedWidth
    const rightPartOfSlice = spentPart.minWidth - leftPartOfSlice

    return {
      spentPart,
      leftPartOfSlice,
      rightPartOfSlice,
      accumulatedWidth,
      foundIndex,
    }
  }

  public getManualSelectorPreview = () => {
    if (!this.state.manualSelectorPreview.IsShowed || this.state.manualSelector.IsShowed || this.state.isHoveredPart) {
      return
    }

    const { Start } = this.state.manualSelectorPreview
    const timelineNode = this.refTimeline.current
    const position = this.pixelToPercent(Start + timelineNode.scrollLeft)
    const { spentPart, leftPartOfSlice, rightPartOfSlice } = this.getSliceByTime(position)

    if (!spentPart || !spentPart.IsEmpty) {
      return null
    }

    let left: number
    let right: number
    if (this.percentToPixel(spentPart.minWidth) > 80) {
      if (this.percentToPixel(leftPartOfSlice) < 40) {
        left = Start - this.percentToPixel(leftPartOfSlice) + 1
        right = left + 80 + 1
      } else if (this.percentToPixel(rightPartOfSlice) < 40) {
        right = Start + this.percentToPixel(rightPartOfSlice) - 1
        left = right - 80 - 1
      } else {
        left = Start - 40
        right = Start + 40
      }
    } else {
      left = Start - this.percentToPixel(leftPartOfSlice) + 1
      right = Start + this.percentToPixel(rightPartOfSlice) - 1
    }

    return (
      <div
        className={styles.manualSelectorPreview}
        style={{
          left: `${left}px`,
          width: `${right - left}px`,
        }}
      >
        <p>+</p>
      </div>
    )
  }

  public handleMouseEnter = (part: IExtendedSpentTimeHistory) => {
    if (part.IsFuture || part.IsEmpty) {
      return
    }

    this.setState({
      isHoveredPart: true,
      hoveredPart: part,
    })
  }

  public toggleManualForm = () => {
    this.setState({
      isOpenManualForm: !this.state.isOpenManualForm,
      hoveredPart: null,
      isHoveredPart: false,
      manualSelector: {
        IsShowed: false,
      },
      manualSelectorPreview: {
        IsShowed: false,
      },
    })
  }

  public handleMouseLeave = () => {
    if (this.state.isHoveredPart || this.state.manualSelectorPreview.IsShowed) {
      this.setState({
        isHoveredPart: false,
        manualSelectorPreview: {
          IsShowed: false,
          Start: 0,
        },
      })
    }
  }

  public selectSlice = (event: React.MouseEvent<HTMLDivElement>) => {
    const position = this.pixelToPercent(event.clientX + this.refTimeline.current.scrollLeft)
    const { spentPart, accumulatedWidth } = this.getSliceByTime(position)

    if (!spentPart.IsEmpty) {
      return
    }

    const Start = this.percentToPixel(accumulatedWidth)
    const End = this.percentToPixel(accumulatedWidth + spentPart.minWidth)
    this.setState({
      manualSelector: {
        IsShowed: true,
        Start,
        End,
      },
    })
  }

  public scrollLeftToTime = (pixels: number) => {
    return Math.round((pixels / (this.refTimeline.current.clientWidth * 2)) * 86400)
  }

  public roundSecondsToMinutes = (seconds: number, direction: '>' | '<') => {
    const diff = seconds % 60
    if (diff === 0) {
      return seconds
    }

    return direction === '<' ? seconds - diff : seconds + (60 - diff)
  }

  public timeToScrollLeft = (seconds: number) => {
    return Math.round((seconds / 86400) * (this.refTimeline.current.clientWidth * 2))
  }

  public changeManualSelector = (startTime: number, endTime: number) => {
    const now = time.now() - time.startOfDay()
    let start = Math.min(startTime, endTime)
    let end = Math.max(startTime, endTime)
    start = this.roundSecondsToMinutes(start, '>')
    end = this.roundSecondsToMinutes(end, '<')
    if (start < 0) {
      start = 0
    }

    if (end > now) {
      end = now
    }

    this.setState({
      manualSelector: {
        IsShowed: true,
        Start: this.timeToScrollLeft(start),
        End: this.timeToScrollLeft(end),
      },
    })
  }

  public render() {
    const timeline = this.props.timeline
    if (this.state.manualSelector.IsShowed) {
      console.log(
        'render -> Start End',
        this.scrollLeftToTime(this.state.manualSelector.End) - this.scrollLeftToTime(this.state.manualSelector.Start),
      )
    }
    return (
      <>
        <div
          className={styles.timeline}
          onWheel={this.handleScroll}
          onMouseDown={this.handleManualSelectorStart}
          onMouseUp={this.handleManualSelectorEnd}
          onMouseMove={this.handleManualSelectorMove}
          onDoubleClick={this.selectSlice}
          onMouseLeave={e => {
            if (this.state.manualSelector.IsShowed && e.buttons > 0) {
              this.handleManualSelectorEnd(e)
            }
          }}
        >
          <div className={styles.container} ref={this.refTimeline}>
            {timeline.map((part, index) => (
              <div
                key={index}
                style={{
                  minWidth:
                    index === timeline.length - 2 && !part.IsEmpty
                      ? `${Math.max(part.minWidth, 0.18)}%`
                      : `${part.minWidth}%`,
                }}
                className={classNames({
                  [styles.empty]: part.IsEmpty,
                  [styles.online]: part.Status === 'ONLINE',
                  [styles.active]: !part.IsEmpty && index === timeline.length - 2,
                  [styles.offline]: part.Status === 'OFFLINE',
                  [styles.manual]: part.Status === 'MANUAL',
                  [styles.coldStart]: part.Planning && part.Planning.IsColdPlanning,
                })}
                onMouseEnter={() => this.handleMouseEnter(part)}
                onMouseLeave={() => this.handleMouseLeave()}
                onMouseMove={this.handleManualSelectorPreviewMove}
              />
            ))}
          </div>
          {this.getTooltip}
          {this.getManualSelector()}
          {this.getManualSelectorPreview()}
          <div className={styles.labelsContainer} ref={this.refLabels}>
            {HOUR_LABELS.map(i => {
              return (
                <div className={styles.labelItem} key={i}>
                  <p>{i}</p>
                </div>
              )
            })}
          </div>
        </div>
        {this.state.manualSelector.IsShowed && this.state.isOpenManualForm && (
          <CreateModal
            onClose={this.toggleManualForm}
            type="manual"
            updateTime={this.changeManualSelector}
            startTime={this.scrollLeftToTime(this.state.manualSelector.Start)}
            endTime={this.scrollLeftToTime(this.state.manualSelector.End)}
          />
        )}
      </>
    )
  }
}

export default connect(mapStateToProps)(Timeline)
