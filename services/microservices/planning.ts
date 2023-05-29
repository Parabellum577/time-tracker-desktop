import {
  ICreatePlanningPayload,
  ICreateManualPlanningPayload,
  ICreateManualPlanningsPayload,
  ISetPlanningDonePayload,
  ICloseColdPlanningWithoutReportPayload,
  ICreateColdPlanningPayload,
  IDurationPayload,
  IGetTimesheetPlanningsPayload,
  IGetFilteredPlanningsPayload,
  ITaskAssignmentSliceayPayload,
  ISetExtraPayload,
  ISetActivePayload,
  ISetSpentPayload,
  IClosePlanningPayload,
  IIssuePayload,
  IGetUsersPlanningsPayload,
  IAddManualPeriodPayload,
  IPostponedReportPayload,
  IIssuesLimitPayload,
} from '@api-types'
import {
  IPlanning,
  IPlanningID,
  IExtendedSpentTimeHistory,
  IGetPlanningsWithOptTimesheets,
  IIssueSpentTime,
  ISpentTime,
  ISetSpent,
  IGetEstimation,
  IGetFilteredPlannings,
  IGetUsersViolations,
  IGetProjectsViolations,
  IIssueViolation,
  IViolationReasons,
  IEstimate,
  IBasicIssueInfo,
  IIssueInfo,
  IGetTotalTime,
} from '@types'
import callApi from '../call-api'

/**
 * Method create new Planning
 */
export const CreatePlanning = async (payload: ICreatePlanningPayload): Promise<number> => {
  const response = await callApi('planning', 'CreatePlanning', payload)
  return response.PlanningID
}

/**
 * Method create new manual Planning, add this manual planning to timesheets and report time to BTS.
 */
export const CreateManualPlanning = async (payload: ICreateManualPlanningPayload): Promise<IPlanningID> =>
  callApi('planning', 'CreateManualPlanning', payload)

/**
 * CreateColdPlanning create new ColdPlanning with specified CreatedAt(defualt now)
 */
export const CreateColdPlanning = async (payload?: ICreateColdPlanningPayload): Promise<number> => {
  const { PlanningID }: { PlanningID: number } = await callApi('planning', 'CreateColdPlanning', payload)
  return PlanningID
}

/**
 * Needed for using cold start without report more than one day
 * Method changes status of the given Cold planning to “CLOSED” and puts current time to “ClosedAt” field.
 */
export const CloseColdPlanningWithoutReport = async (payload: ICloseColdPlanningWithoutReportPayload) =>
  callApi('planning', 'CloseColdPlanningWithoutReport', payload)

/**
 * Return all cold plannings
 * Open: null or one relevant cold planning
 * NotReported: null or Array of Closed cold plannings without report
 */
export const GetColdPlannings = async (): Promise<IPlanning[]> => {
  const response = await callApi('planning', 'GetColdPlannings')
  response.Open = response.Open || []
  response.NotReported = response.NotReported || []
  response.NotReported = response.NotReported.map((p: IPlanning) => ({ ...p, Outdated: true }))
  return response.Open.concat(response.NotReported)
}

/**
 * Method returns SpentTimeHistory parts for given period of time
 */
export const GetSpentParts = async (payload: IDurationPayload): Promise<IExtendedSpentTimeHistory[]> => {
  const response = await callApi('planning', 'GetSpentParts', payload)
  response.SpentParts = response.SpentParts || []
  return response.SpentParts
}

/**
 * Method creates new Plannings and report them to BTS, from existing ColdPlanning.
 */
export const ReassignColdPlanning = async (payload: ITaskAssignmentSliceayPayload): Promise<IIssueSpentTime[]> =>
  callApi('planning', 'ReassignColdPlanning', payload)

/**
 * Return all unreported plannings
 */
export const GetOpenPlannings = async (): Promise<IPlanning[]> => {
  const response = await callApi('planning', 'GetOpenPlannings')
  if (!response || !response.Plannings) {
    return []
  }
  return response.Plannings
}

/**
 * Return all reported plannings using some filters(see types)
 */
export const GetClosedPlannings = async (payload: IGetFilteredPlanningsPayload): Promise<IPlanning[]> => {
  const response = await callApi('planning', 'GetClosedPlannings', payload)
  if (!response || !response.Plannings) {
    return []
  }
  return response.Plannings
}

/**
 * Update planned time(Estimation field) of Planning
 */
export const SetExtra = async (payload: ISetExtraPayload) => callApi('planning', 'SetExtra', payload)

/**
 * Delivers on a WebSocket(NotificationMS) Subject: "request_master_status" and UserID: int
 * Required to change the active machine, tells the active to stop tracking so that the current slave can start.
 */
export const RequestMasterStatus = async () => callApi('planning', 'RequestMasterStatus')

/**
 * Start/stop(Active field) Planning, needed for timetracking
 */
export const SetActive = async (payload: ISetActivePayload) => callApi('planning', 'SetActive', payload)

/**
 * Start/stop(Active field) Planning Spent part, needed for timetracking
 * Should be called after and before SetActive also each one minute of tracking
 */
export const SetSpent = async (payload: ISetSpentPayload): Promise<ISetSpent> =>
  callApi('planning', 'SetSpent', payload)

/**
 * Method should update planning issue with closed status, report time to BTS and close Planning
 */
export const ClosePlanning = async (payload: IClosePlanningPayload) => callApi('planning', 'ClosePlanning', payload)

/**
 * Return all spent parts and their plannings
 */
export const GetTimesheets = async (payload: IGetFilteredPlanningsPayload): Promise<IGetFilteredPlannings> =>
  callApi('planning', 'GetTimesheets', payload)

/**
 * This method returns array of task with tracking in last two weeks
 */
export const GetLastIssues = async (payload?: IIssuesLimitPayload): Promise<IBasicIssueInfo[]> => {
  const response = await callApi('planning', 'GetLastIssues', payload)
  return response.Issues || []
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * UNUSED SECTION
 */
export const GetUnfinishedIssues = async (payload: IIssuesLimitPayload): Promise<IBasicIssueInfo[]> =>
  callApi('planning', 'GetUnfinishedIssues', payload)

export const GetFinishedIssues = async (payload: IIssuesLimitPayload): Promise<IBasicIssueInfo[]> =>
  callApi('planning', 'GetFinishedIssues', payload)

export const GetPlanningIssuesInfo = async (payload: IIssuePayload): Promise<IIssueInfo[]> =>
  callApi('planning', 'GetPlanningIssuesInfo', payload)

export const GetTotalTime = async (payload: IDurationPayload): Promise<IGetTotalTime[]> =>
  callApi('planning', 'GetTotalTime', payload)

export const GetUsersPlannings = async (payload: IGetUsersPlanningsPayload): Promise<IPlanning[]> =>
  callApi('planning', 'GetUsersPlannings', payload)

export const AddManualPeriod = async (payload: IAddManualPeriodPayload) =>
  callApi('planning', 'AddManualPeriod', payload)

export const PostponedReport = async (payload: IPostponedReportPayload) =>
  callApi('planning', 'PostponedReport', payload)

export const GetUsersViolations = async (payload: IGetFilteredPlanningsPayload): Promise<IGetUsersViolations[]> =>
  callApi('planning', 'GetUsersViolations', payload)

export const GetProjectsViolations = async (payload: IGetFilteredPlanningsPayload): Promise<IGetProjectsViolations[]> =>
  callApi('planning', 'GetProjectsViolations', payload)

export const GetViolatedIssues = async (payload: IGetFilteredPlanningsPayload): Promise<IIssueViolation[]> =>
  callApi('planning', 'GetViolatedIssues', payload)

export const GetViolationReasons = async (payload: IIssuePayload): Promise<IViolationReasons[]> =>
  callApi('planning', 'GetViolatedIssues', payload)

export const GetEstimataion = async (payload: IIssuePayload): Promise<IEstimate> =>
  callApi('planning', 'GetEstimataion', payload)

export const GetEstimation = async (payload: IIssuePayload): Promise<IGetEstimation> =>
  callApi('planning', 'GetEstimation', payload)

export const CreateManualPlannings = async (payload: ICreateManualPlanningsPayload): Promise<IPlanningID> =>
  callApi('planning', 'CreateManualPlannings', payload)

export const SetPlanningDone = async (payload: ISetPlanningDonePayload) =>
  callApi('planning', 'SetPlanningDone', payload)

export const GetTimesheetPlannings = async (payload: IGetTimesheetPlanningsPayload): Promise<IPlanning[]> =>
  callApi('planning', 'GetTimesheetPlannings', payload)

export const GetPlanningsWithOptTimesheets = async (
  payload: IGetFilteredPlanningsPayload,
): Promise<IGetPlanningsWithOptTimesheets> => callApi('planning', 'GetPlanningsWithOptTimesheets', payload)

export const SpentTime = async (payload: IDurationPayload): Promise<ISpentTime> =>
  callApi('planning', 'SpentTime', payload)
