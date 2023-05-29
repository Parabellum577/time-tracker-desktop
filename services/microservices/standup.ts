import {
  IScheduleStandupPayload,
  IStandupId,
  IStandupIdPayload,
  ILeaveStandupPayload,
  
} from '@api-types'
import callApi from '../call-api'

/** dashboard */
/**
 * create Team with users, creater is owner return tem id
 */
export const ScheduleStandup = async (payload: IScheduleStandupPayload): Promise<IStandupId> =>
  callApi('standup', 'ScheduleStandup', payload)

/**
 * delete team
 */
export const DeleteStandup = async (payload: IStandupIdPayload)=>
  callApi('standup', 'DeleteStandup', payload)

/**
 * Leave team. if you have a ownership of this group you should set a new owner
 */
export const LeaveStandup = async (payload: ILeaveStandupPayload)=>
  callApi('standup', 'LeaveStandup', payload)
