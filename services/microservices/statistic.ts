import {
  IScheduleReportPayload,
  IUnscheduleReportPayload,
  } from '@api-types'
import callApi from '../call-api'
  
/**
 * dashboard
 */

/**
 * start /once or subcribe/ get statistic by mail
 */
export const ScheduleReport = async (payload: IScheduleReportPayload)=>
  callApi('statistics', 'ScheduleReport', payload)
  
/**
 * unsubcribe gettting statistic by mail
 */
export const UnscheduleReport = async (payload: IUnscheduleReportPayload)=>
  callApi('statistics', 'UnscheduleReport', payload)