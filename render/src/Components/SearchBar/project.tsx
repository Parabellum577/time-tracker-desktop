import * as React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import * as _ from 'lodash'
import * as userActions from '@store/currentUser/actions'
import { IProject } from '@services/types'
import classNames from 'classnames'
import api from '@services/api'
import { openExternal } from '@services/openWindow'
import { IRootState, RootAction } from '@store/rootReducer'
import HighlightIndicator from '@components/Tutorial/highlightIndicator'
import IconWrapper from '@components/IconWrapper'
import InfiniteScroll = require('react-infinite-scroller')
import { normalizeString } from '@services/formater'

const styles = require('./project.module.scss')

interface IProjectDropdownItemProps {
  isManualForm: boolean
  searchValue: string
  projects: IProject[]
  chooseProject: (project: IProject) => void
  updateProjectList: (projects: IProject[]) => void
}

interface IState {
  isOpenedMenuID: string
  renderLimitCount: number
}

const mapStateToProps = (state: IRootState) => ({
  userSettings: state.user.defaultUserSettings,
  userIntegrations: state.trackers.userTrackers,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      userActions: userActions.handleUserSettings.request,
    },
    dispatch,
  )

type IProjectProps = IProjectDropdownItemProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>

class ProjectDropdownItem extends React.PureComponent<IProjectProps, IState> {
  public state = {
    isOpenedMenuID: '',
    renderLimitCount: 20,
  }

  private menu: { [type: string]: HTMLDivElement } = {}

  public hideProject = async ({ TrackerID, ProjectID }: IProject) => {
    try {
      await api.project.UpdateProjectVisibility({
        TrackerID,
        ProjectID,
        Value: true,
      })
      const newProjectList = this.props.projects.filter(
        project => project.TrackerID !== TrackerID || project.ProjectID !== ProjectID,
      )
      this.props.updateProjectList(newProjectList)
      await api.project.UpdateProjectsCache()
    } catch (error) {
      console.error(error)
    }
  }

  public openSettings = async ({ TrackerID, ProjectID }: IProject) => {
    const ots = await api.user.GetOTS()
    const href = `${process.env.REDIRECT_URL}/desktop/login?otscode=${ots}&action=ProjectSettings&TrackerID=${TrackerID}&ProjectID=${ProjectID}`
    openExternal(href)
  }

  public getHighlightedText = (text: string) => {
    if (!this.props.searchValue) {
      return <span>{text}</span>
    }

    const highlight = normalizeString(this.props.searchValue)
    const parts = highlight.length ? text.split(new RegExp(`(${highlight})`, 'gi')) : [text]
    return (
      <span>
        {parts.map((part, i) => (
          <span
            key={i}
            className={classNames({
              [styles.higlighted]: normalizeString(part.toLowerCase()) === highlight.toLowerCase(),
            })}
          >
            {part}
          </span>
        ))}
      </span>
    )
  }

  public toggleMenu = (event: React.MouseEvent, id: string) => {
    if (event) {
      event.stopPropagation()
    }
    this.setState({ isOpenedMenuID: id })
  }

  public getMenuDropdown = (project: IProject) => {
    const { TrackerID, ProjectID } = project
    const ref = this.menu[`${TrackerID}-${ProjectID}`]
    return (
      <Menu
        anchorEl={ref}
        open={!!ref}
        onClose={() => this.toggleMenu(null, '')}
        onClick={e => this.toggleMenu(e, '')}
        transitionDuration={0}
        PaperProps={{
          style: {
            width: 160,
          },
        }}
      >
        <MenuItem selected={false} tabIndex={-1} className={styles.menuItem} onClick={() => this.openSettings(project)}>
          <p>Settings</p>
        </MenuItem>
        <MenuItem selected={false} className={styles.menuItem} onClick={() => this.hideProject(project)}>
          <p>Hide</p>
        </MenuItem>
      </Menu>
    )
  }

  public setTutorialWithPersonalProjectCompleted = () => {
    if (this.props.userSettings.isShowedPersonalProjectTutorial === 'off') {
      this.props.userActions([{ Key: 'isShowedPersonalProjectTutorial', Value: 'on' }])
    }
  }

  public loadMore = () => {
    this.setState({ renderLimitCount: this.state.renderLimitCount + 20 })
  }

  public render() {
    const chooseProject = this.props.chooseProject
    const hasMoreUpdates = this.props.projects ? this.props.projects.length > this.state.renderLimitCount : false
    const isUserHasNoIntegrations = _.isEmpty(this.props.userIntegrations.filter(item => item.Type !== 'TGTRACKER'))

    return (
      <InfiniteScroll pageStart={0} loadMore={this.loadMore} hasMore={hasMoreUpdates} loader={null} useWindow={false}>
        {_.take(this.props.projects, this.state.renderLimitCount).map((project, index) => (
          <div
            onClick={() => {
              chooseProject(project)
              this.setTutorialWithPersonalProjectCompleted()
            }}
            className={classNames(styles.projectsListDropdownItem, {
              [styles.contentWithError]: project.ProjectStatus !== 'ACTIVE',
            })}
            key={`${project.ProjectID}-${project.TrackerID}-${index}`}
            title={
              project.ProjectStatus !== 'ACTIVE'
                ? 'You got problems with current integration. Please, reintegrate this tracking system'
                : ''
            }
          >
            {isUserHasNoIntegrations && (
              <HighlightIndicator
                className={styles.tutorialIndicator}
                userSettingsKey="isShowedPersonalProjectTutorial"
              />
            )}
            <div className={styles.trackerLogo}>
              <IconWrapper name={project.TrackerType} height="32px" width="32px" />
            </div>
            <div className={styles.projectContent}>
              <p className={styles.projectName} title={project.Name.length > 40 ? project.Name : ''}>
                {this.getHighlightedText(project.Name)}
              </p>
              {project.Description && <p className={styles.projectDescription}>{project.Description}</p>}
            </div>
            <div
              ref={ref => {
                this.menu[`${project.TrackerID}-${project.ProjectID}`] = ref
              }}
              onClick={e => this.toggleMenu(e, project.ProjectID)}
              className={styles.settingsIconContainer}
            >
              <IconWrapper classes={styles.settingsIcon} name="more_horiz" />
            </div>
            {this.state.isOpenedMenuID === project.ProjectID && this.getMenuDropdown(project)}
          </div>
        ))}
      </InfiniteScroll>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropdownItem)
