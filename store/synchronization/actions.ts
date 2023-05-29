import { createAction } from 'typesafe-actions'

export const changeMasterStatus = createAction('synchronization/CHANGE_MASTER_STATUS', resolve => (isMaster: boolean) =>
  resolve(isMaster),
)

export const becomeMaster = createAction('synchronization/BECOME_MASTER', resolve => () => resolve())
