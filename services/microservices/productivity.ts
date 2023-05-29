import callApi from '../call-api'
import {
  IAnalyzeActivityPayload,
  IGetProductivitiesPayload,
  IGetFocusPayload,
  IGetSwitchesPayload,
  IGetMonitoringPayload,
  IDistributeTitlePayload,
  IUpdateProjectCacheByTrackers,
} from '@services/api-types'
import { 
  IProductivities,
  IFullIssue,
  IFocus, 
  IProductivitiesReduces,
  IProductivitiesMonitoring,
  IGetActivity,
} from '@services/types'

/**
 * Method for calculating Productivity and Focus from raw data (window titles, mouse and keyboard data)
 */
export const AnalyzeActivity = async (payload: IAnalyzeActivityPayload) =>
  callApi('productivity', 'AnalyzeActivity', payload)

/**
 * Method for getting calculated productivity
 */
export const GetProductivities = async (payload: IGetProductivitiesPayload): Promise<IProductivities[]> => {
  const response = await callApi('productivity', 'GetProductivities', payload)
  if (!response || !response.Productivities) {
    return []
  }
  return response.Productivities
}

/**
 * Method for getting calculated focus by periods
 */
export const GetFocus = async (payload: IGetFocusPayload): Promise<IFocus[]> => {
  const response = await callApi('productivity', 'GetFocus', payload)
  if (!response || !response.Focuses) {
    return []
  }
  return response.Focuses
}

/**
 * Method for getting calculated Switch Focus
 */
export const GetSwitches = async (payload: IGetSwitchesPayload): Promise<IProductivitiesReduces[]> => {
  const response = await callApi('productivity', 'GetSwitches', payload)
  if (!response || !response.ActivityTime) {
    return []
  }
  return response.ActivityTime
}

/**
 * Method for getting calculated Monitoring Titles Focus
 */
export const GetMonitoring = async (payload: IGetMonitoringPayload): Promise<IProductivitiesMonitoring[]> => {
  const response = await callApi('productivity', 'GetMonitoring', payload)
  if (!response || !response.FocusMonitoring) {
    return []
  }
  return response.FocusMonitoring
}

/**
 * Method for distributing Titles on Focus page (Dashboard) 
 */
export const DistributeTitle = async (payload: IDistributeTitlePayload) => {
  await callApi('productivity', 'DistributeTitle', payload)
}

/**
 * Method for getting category of activity (WORK, COMMUNICATION, OTHER, LEARNING, ENTERTAINMENT)
 */
export const GetActivities = (payload: IFullIssue): Promise<IGetActivity[]> => 
    callApi('productivity', 'GetActivities', payload)


/**
 * Method for copy distribution settings for projects
 */
export const CopyDistributionSettings = async (payload: IUpdateProjectCacheByTrackers) => {
 await callApi('productivity', 'CopyDistributionSettings', payload)
}
