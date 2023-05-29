import * as React from 'react'
import * as helpActions from '@store/helpIntegration/actions'

import { useDispatch } from 'react-redux'
import IconWrapper from '@components/IconWrapper'
import { IHintType } from '@store/helpIntegration/types'

const styles = require('./styles.module.scss')

interface IOwnProps {
  trackerType: string
}

interface ITrackerHelpInstruction {
  trackerName: string
  hintTypes: IHintType[]
}

const trackersWithHelpInstructions: ITrackerHelpInstruction[] = [
  {
    trackerName: 'ASANA',
    hintTypes: [
      {
        hintTemplate: 'asana-help.html',
        hintName: 'Get Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'BREEZE',
    hintTypes: [
      {
        hintTemplate: 'breeze-help.html',
        hintName: 'Get Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'PIVOTAL',
    hintTypes: [
      {
        hintTemplate: 'pivotal-help.html',
        hintName: 'Get Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'VSTS',
    hintTypes: [
      {
        hintTemplate: 'vsts-help.html',
        hintName: 'Help',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'LIQUIDPLANNER',
    hintTypes: [
      {
        hintTemplate: 'liquidplanner-help.html',
        hintName: 'How to Create Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'TEAMWORK',
    hintTypes: [
      {
        hintTemplate: 'teamwork-help.html',
        hintName: 'Get Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'TODOIST',
    hintTypes: [
      {
        hintTemplate: 'todoist-help.html',
        hintName: 'Help',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'ZOHO',
    hintTypes: [
      {
        hintTemplate: 'zoho-help.html',
        hintName: 'How to Generate Token',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'INSIGHTLY',
    hintTypes: [
      {
        hintTemplate: 'insightly-help.html',
        hintName: 'Get API Key',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'GITLAB',
    hintTypes: [
      {
        hintTemplate: 'gitlab-token-help.html',
        hintName: 'Get Token',
        templateWithGif: true,
      },
      {
        hintTemplate: 'gitlab-help.html',
        hintName: 'Self Hosted',
        templateWithGif: false,
      },
    ],
  },
  {
    trackerName: 'REDMINE',
    hintTypes: [
      {
        hintTemplate: 'redmine-help.html',
        hintName: 'Get Access Key',
        templateWithGif: true,
      },
    ],
  },
  {
    trackerName: 'YOUTRACK',
    hintTypes: [
      {
        hintTemplate: 'youtrack-help.html',
        hintName: 'Help',
        templateWithGif: false,
      },
    ],
  },
  {
    trackerName: 'JIRA',
    hintTypes: [
      {
        hintTemplate: 'jira-help.html',
        hintName: 'Help',
        templateWithGif: false,
      },
    ],
  },
]

const ButtonForHelpWindow: React.FC<IOwnProps> = ({ trackerType }) => {
  const trackerHintSettings = trackersWithHelpInstructions.find(item => item.trackerName === trackerType)
  const trackerHintTypes = trackerHintSettings && trackerHintSettings.hintTypes

  const dispatch = useDispatch()

  const showHelpWindow = React.useCallback(
    (template: IHintType) => {
      const action = helpActions.showHelpWindow(template)
      dispatch(action)
    },
    [dispatch],
  )

  return (
    trackerHintSettings && (
      <div className={styles.hintBlock}>
        {trackerHintTypes.map(item => {
          return (
            <div key={item.hintName} className={styles.helpBtn} onClick={() => showHelpWindow(item)}>
              <span>{item.hintName}</span>
              <IconWrapper name="iconInfo" classes={styles.iconInfo} />
            </div>
          )
        })}
      </div>
    )
  )
}

export default React.memo(ButtonForHelpWindow)
