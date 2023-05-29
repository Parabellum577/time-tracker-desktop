import { createAction } from 'typesafe-actions'
import { IHintType } from './types'

export const showHelpWindow = createAction('helpIntegration/SHOW_INSTRUCTIONS', action => (template: IHintType) =>
  action(template),
)

export const closeHelpWindow = createAction('helpIntegration/HIDE_INSTRUCTIONS', action => action)
