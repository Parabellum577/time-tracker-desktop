import * as React from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import * as planningsActions from '@store/plannings/actions'
import { RootAction } from '@store/rootReducer'
import IconWrapper from '@components/IconWrapper'
import Nav from '@components/Nav/index'
import HighlightIndicator from '@components/Tutorial/highlightIndicator'

const styles = require('./styles.module.scss')

interface IOwnProps {
  isActiveColdStart: boolean
}

interface IMainHeadState {
  isReportPage: boolean
  isReportModal: boolean
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      stopColdPlanning: planningsActions.stopColdPlanning.request,
    },
    dispatch,
  )

type IMainHeadProps = IOwnProps & ReturnType<typeof mapDispatchToProps>

class MainHead extends React.PureComponent<IMainHeadProps, IMainHeadState> {
  public state = {
    isReportPage: false,
    isReportModal: false,
  }

  public switchPages = () => {
    this.setState({ isReportPage: !this.state.isReportPage })
  }

  public openReportModal = () => {
    this.setState({ isReportPage: false, isReportModal: true })
  }

  public closeReportModal = () => {
    this.setState({ isReportPage: false, isReportModal: false })
  }

  public render() {
    return (
      <>
        {this.state.isReportPage ? (
          <div className={classNames(styles.actionBar, styles.highlightedBar)}>
            {/* <ReportMenu switchPage={this.switchPages} openReportModal={this.openReportModal} flag="inHead" /> */}
          </div>
        ) : (
          <div
            className={classNames(styles.actionBar, {
              [styles.highlightedBar]: this.props.isActiveColdStart,
            })}
          >
            <div className={styles.headerContainer}>
              <div className={styles.menu}>
                <div
                  className={classNames(styles.divider, {
                    [styles.passiveDivider]: !this.props.isActiveColdStart,
                    [styles.activeDivider]: this.props.isActiveColdStart,
                  })}
                />
                <div className={styles.indicatorWrap}>
                  <HighlightIndicator
                    className={styles.tutorialIndicator}
                    userSettingsKey="isShowedSearchBarTutorial"
                  />
                  <NavLink to={'/main/searchTask'}>
                    <IconWrapper
                      name="iconSearch"
                      classes={classNames(styles.searchIcon, {
                        [styles.highlightedIcon]: this.props.isActiveColdStart,
                      })}
                    />
                  </NavLink>
                </div>
                <Nav />
              </div>
            </div>
            <div
              className={classNames(styles.progressBar, {
                [styles.passiveBar]: !this.props.isActiveColdStart,
                [styles.activeBar]: this.props.isActiveColdStart,
              })}
            />
          </div>
        )}
      </>
    )
  }
}

export default connect(mapDispatchToProps)(MainHead)
