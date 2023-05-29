import * as React from 'react'
import * as _ from 'lodash'
import classNames from 'classnames'
import SVG from 'react-inlinesvg'

const styles = require('./icon-wrapper.module.scss')

const images: { [type: string]: string } = {
  defaultAvatar: require('@images/df-icon-profile.svg'),
  tutorialAvatar: require('@images/df-avatar.png'),
  editIcon: require('@images/df-edit-icon.svg'),
  emptyListImage: require('@images/df-sloth.svg'),
  emptyListImageActive: require('@images/df-sloth-active.svg'),
  eye: require('@images/df-eye.svg'),
  eyeSlash: require('@images/df-eye-crossed.svg'),
  logoDF: require('@images/df-logo-new.svg'),
  reply: require('@images/reply.svg'),
  DROPBOX: require('@images/df-dropbox.svg'),
  GOOGLE_DRIVE: require('@images/df-google-drive.svg'),
  iconIntercom: require('@images/df-intercom-chat-icon.svg'),
  iconFiltration: require('@images/df-icon-filtration.svg'),
  iconSearch: require('@images/df-icon-search.svg'),
  iconSearchLarge: require('@images/df-icon-search-large.svg'),
  iconSortRecents: require('@images/df-icon-sort-by-recents.svg'),
  iconSortTracker: require('@images/df-icon-sort-by-tracker.svg'),
  iconSortAZ: require('@images/df-icon-sort-by-az.svg'),
  iconSortZA: require('@images/df-icon-sort-by-za.svg'),
  iconOpenTaskWeb: require('@images/df-icon-open-task-web.svg'),
  iconInfo: require('@images/df-icon-info.svg'),
  iconToday: require('@images/df-icon-today.svg'),
  iconDashboard: require('@images/df-icon-dashboard.svg'),
  iconPriority: require('@images/df-icon-priority.svg'),
  iconOffline: require('@images/df-icon-offline.svg'),
  menuCamera: require('@images/menu-camera.svg'),
  menuDashboard: require('@images/menu-dashboard.svg'),
  menuInfo: require('@images/menu-info.svg'),
  menuLogout: require('@images/menu-logout.svg'),
  menuSettings: require('@images/menu-settings.svg'),
  menuSupercharge: require('@images/menu-supercharge.svg'),
  noIcon: require('@images/df-na.svg'),
  arrowDownIcon: require('@images/df-icon-arrow-down.svg'),
  questionIcon: require('@images/df-icon-question.svg'),
  checkIcon: require('@images/df-icon-checked.svg'),
  dotsIcon: require('@images/df-icon-dots.svg'),
  iconClose: require('@images/df-icon-close.svg'),
  playIcon: require('@images/df-play.svg'),
  pauseIcon: require('@images/df-pause.svg'),
  errorIcon: require('@images/df-error.svg'),
  blueClockIcon: require('@images/df-icon-clock-blue.svg'),
  tickIcon: require('@images/df-icon-tick.svg'),
  coffeeIcon: require('@images/df-icon-coffee.svg'),
  syncIcon: require('@images/icon-sync-gray.svg'),
  priorityIcon: require('@images/df-priority.svg'),
  addToListIcon: require('@images/df-icon-list.svg'),
  openRemote: require('@images/df-icon-open-remote.svg'),
  coldIcon: require('@images/df-icon-cold.svg'),
  ASANA: require('@images/trackers/asana.svg'),
  BITBUCKET: require('@images/trackers/bitbucket.svg'),
  BREEZE: require('@images/trackers/breeze.png'),
  CLICKUP: require('@images/trackers/clickup.svg'),
  COLLAB: require('@images/trackers/activecollab.svg'),
  GCALENDAR: require('@images/trackers/gcalendar.svg'),
  GITHUB: require('@images/trackers/github.svg'),
  GITLAB: require('@images/trackers/gitlab.svg'),
  INSIGHTLY: require('@images/trackers/insightly.png'),
  JIRA: require('@images/trackers/jira.svg'),
  LIQUIDPLANNER: require('@images/trackers/liquidplanner.svg'),
  MANTIS: require('@images/trackers/mantis.svg'),
  MSTODO: require('@images/trackers/mstodo.svg'),
  ODOO: require('@images/trackers/odoo.svg'),
  OUTLOOK: require('@images/trackers/outlook.svg'),
  PIVOTAL: require('@images/trackers/pivotal.svg'),
  PODIO: require('@images/trackers/podio.svg'),
  RALLY: require('@images/trackers/ca-technologies.svg'),
  REDBOOTH: require('@images/trackers/redbooth.png'),
  REDMINE: require('@images/trackers/redmine.svg'),
  TEAMWORK: require('@images/trackers/teamworks.svg'),
  TGTRACKER: require('@images/df-logo.png'),
  TODOIST: require('@images/trackers/todoist.svg'),
  TRELLO: require('@images/trackers/trello.svg'),
  VSTS: require('@images/trackers/vsts.svg'),
  WRIKE: require('@images/trackers/wrike.svg'),
  WUNDERLIST: require('@images/trackers/wunderlist.svg'),
  YOUTRACK: require('@images/trackers/youtrack.svg'),
  ZOHO: require('@images/trackers/zoho.svg'),
  TIP: require('@images/tip.svg'),
}

interface IIconWrapperProps {
  classes?: string | string[]
  color?: string
  dataName?: string
  fontSize?: string
  height?: string
  id?: string
  name: string
  onClick?: any
  title?: string
  width?: string
}

class IconWrapper extends React.PureComponent<IIconWrapperProps> {
  get propperClassName() {
    const { classes } = this.props
    let classesArray: string[]
    const isMaterial = !_.keys(images).includes(this.props.name)

    if (typeof classes === 'string') {
      classesArray = [classes]
    } else if (classes) {
      classesArray = classes
    } else {
      classesArray = []
    }

    if (isMaterial) {
      return classNames(styles.materialIcons, ...classesArray)
    } else {
      return classNames(classesArray)
    }
  }

  public render() {
    const { name, color, fontSize, width, height } = this.props
    const isMaterial = !_.keys(images).includes(name)
    if (isMaterial) {
      return (
        <i
          className={this.propperClassName}
          data-name={this.props.dataName || null}
          id={this.props.id || null}
          key={name}
          onClick={this.props.onClick || null}
          style={{ height, width, fontSize, color }}
          title={this.props.title || null}
        >
          {name}
        </i>
      )
    }

    if (images[name].includes('.svg')) {
      const svgStyle: React.HTMLAttributes<HTMLImageElement>['style'] = {}
      svgStyle.height = this.props.height || null
      svgStyle.width = this.props.width || null
      return (
        <div
          data-name={this.props.dataName || null}
          id={this.props.id || null}
          key={name}
          onClick={this.props.onClick || null}
          title={this.props.title || null}
          style={svgStyle}
        >
          <SVG
            className={this.propperClassName}
            preloader={<img src={images[name]} style={svgStyle} className={this.propperClassName} />}
            src={images[name]}
            style={svgStyle}
          />
        </div>
      )
    }

    return (
      <img
        alt={name}
        className={this.propperClassName}
        data-name={this.props.dataName || null}
        id={this.props.id || null}
        key={name}
        onClick={this.props.onClick || null}
        src={images[name]}
        style={
          (this.props.height && { height: this.props.height }) ||
          (this.props.width && { width: this.props.width }) ||
          (this.props.fontSize && { fontSize: this.props.fontSize })
        }
        title={this.props.title || null}
      />
    )
  }
}

export default IconWrapper
