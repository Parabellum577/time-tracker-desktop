import {
  IAchievementStatus,
  IBasicIssue,
  IFindByOAuthCode,
  IGetAuthMethods,
  IGetIssueByURL,
  IGetIssuesData,
  IGetUser,
  IOAuthURL,
  IProjectID,
  IProjectIssue,
  IReportTimeInfo,
  ISupportedFeatures,
  ITracker,
  ITrackerAndProjectStatus,
  ITrackerExtendedInfo,
  ITrackerInfo,
  ITrackerWithStatus,
  IUserID,
  IUserProject,
  IValidationResult,
  IProjectDetails,
  IEditProjectIssue,
  IFullIssue,
} from '@types'
import {
  IAddUserCredentialsPayload,
  IColleaguePayload,
  ICreateIssuePayload,
  ICreateProjectPayload,
  IDatePayload,
  IGetAuthMethodsPayload,
  IIssuePayload,
  IGetIssuesDataPayload,
  IIssueURLPayload,
  IOAuthCodePayload,
  IProjectAndTrackerPayload,
  IRenameProjectPayload,
  IReportTimePayload,
  ISetStatusPayload,
  ISetPriorityPayload,
  ITrackerCredentialsPayload,
  ITrackerPayload,
  IURLPayload,
  IUpdateIssuePayload,
  IValidateTrackerPayload,
  IEditIssuePayload,
  IDeleteIssuePayload,
  IEditCommentPayload,
  IEditComment,
} from '@api-types'
import callApi from '../call-api'

/**
 * Get project's relevant tasks(without Done and Closed)
 */
export const GetProjectIssues = async (payload: IProjectAndTrackerPayload): Promise<IFullIssue[]> => {
  const response = await callApi('tracker', 'GetProjectIssues', payload)
  if (!response || !response.Issues) {
    return []
  }

  return response.Issues.map((issue: IProjectIssue) => ({
    ...issue,
    TrackerID: payload.TrackerID,
    ProjectID: payload.ProjectID,
  }))
}

/**
 * Get bookmarked tasks
 */
export const GetBookmarks = async (): Promise<IBasicIssue[]> => {
  const response = await callApi('tracker', 'GetBookmarks')
  if (!response || !response.Bookmarks) {
    return []
  }
  return response.Bookmarks
}

/**
 * Remove bookmarked task
 */
export const RemoveBookmark = async (payload: IIssuePayload) => callApi('tracker', 'RemoveBookmark', payload)

/**
 * Add task to bookmarks
 */
export const CreateBookmark = async (payload: IIssuePayload) => callApi('tracker', 'CreateBookmark', payload)

/**
 * Get details of a tasks
 */
export const GetIssues = async (payload: IGetIssuesDataPayload): Promise<IGetIssuesData[]> => {
  const response = await callApi('tracker', 'GetIssues', payload)
  if (!response || !response.Data) {
    return []
  }
  return response.Data
}

/**
 * Create task in BTS in or DF tracker
 */
export const CreateIssue = async (payload: ICreateIssuePayload): Promise<IProjectIssue> => {
  const response = await callApi('tracker', 'CreateIssue', payload)
  return response.Issue
}

/**
 * This endpoint called when issue details required, for example, when planning is created from issue.
 */
export const GetIssue = async (payload: IIssuePayload): Promise<IProjectIssue> => {
  const response = await callApi('tracker', 'GetIssue', payload)
  return response.Issue
}

/**
 * This endpoint called by ReportQueueMS when user closing planning.
 * Method also needs to catch errors from adapters and generate own errors in case if reporting is not possible.
 */
export const CreateReport = async (payload: IReportTimePayload) => callApi('tracker', 'CreateReport', payload)

/**
 * Change status of task in BTS
 */
export const SetStatus = async (payload: ISetStatusPayload) => callApi('tracker', 'SetStatus', payload)

/**
 * Change priority of task in BTS
 */
export const SetPriority = async (payload: ISetPriorityPayload) => callApi('tracker', 'SetPriority', payload)

/**
 * Method, should check credentials on Tracker Adapter, chosen according to Type parameter passed,
 * and if result is successful, store user credentials into own database for requesting user.
 */
export const AddUserTrackerCredentials = async (payload: IAddUserCredentialsPayload): Promise<ITracker> =>
  callApi('tracker', 'AddUserTrackerCredentials', payload)

/**
 * Method like add but called when user just update integration
 */
export const UpdateUserTrackerCredentials = async (payload: ITrackerCredentialsPayload) =>
  callApi('tracker', 'UpdateUserTrackerCredentials', payload)

/**
 * Remove integration and archive all project of this integration
 */
export const DeleteUserTrackerCredentials = async (payload: ITrackerPayload) =>
  callApi('tracker', 'DeleteUserTrackerCredentials', payload)

/**
 * Method return all connected integrations
 */
export const GetUserTrackers = async (): Promise<ITrackerWithStatus[]> => {
  const response = await callApi('tracker', 'GetUserTrackers')
  if (!response || !response.Trackers) {
    return []
  }
  return response.Trackers
}

/**
 * Method returns list of authentication methods.
 * If TrackerID is empty and Type is provided, method tries to retrieve list for generic tracker of that type.
 */
export const GetAuthMethods = async (payload: IGetAuthMethodsPayload): Promise<IGetAuthMethods> =>
  callApi('tracker', 'GetAuthMethods', payload)

/**
 * Client should call this endpoint when need to display form elements that may be unsupported by tracker
 */
export const GetSupportedFeatures = async (payload: IProjectAndTrackerPayload): Promise<ISupportedFeatures[]> =>
  callApi('tracker', 'GetSupportedFeatures', payload)

/**
 * Method GetIssueByURL returns issue from the one of the user`s trackers which recognizes the issue URL as its own.
 * Firstly it gets all the registered by user trackers. Then it iterates over them invoking GetIssueByURL.
 * If any tracker recognize the URL, the function returns the issue as a result. If none of trackers
 * recognizes the URL or has feature IssueByURL, function GetIssueBuyURL will return Error unrecognized issue URL
 */
export const GetIssueByURL = async (payload: IIssueURLPayload): Promise<IGetIssueByURL> =>
  callApi('tracker', 'GetIssueByURL', payload)

/**
 * Methor return details of project
 */
export const GetProjectDetails = async (payload: IProjectAndTrackerPayload): Promise<IProjectDetails> => {
  const response = await callApi('tracker', 'GetProjectDetails', payload)
  return response.Project
}

/**
 * Method get OAuth URL for connect integration
 */
export const GetOAuthURL = async (payload: ITrackerPayload): Promise<IOAuthURL> =>
  callApi('tracker', 'GetOAuthURL', payload)

/**
 * Accepts authenticated request containing OAuth verification code, exchanging Verification Code with
 * OAuth Provider to get Authorization Token and saves this token to Credential storage, this way,
 * adding integration to current user that is logged in.
 */
export const UseOAuthCode = async (payload: IOAuthCodePayload): Promise<any> =>
  callApi('tracker', 'UseOAuthCode', payload)

/**
 * Methor return details of tracker by URL or return RPC error if not found / not available
 */
export const GetTracker = async (payload: IURLPayload): Promise<ITrackerInfo> =>
  callApi('tracker', 'GetTracker', payload)

/* dashboard section */

/**
 * get user name and email from tracker integration
 */

export const GetCurrentUser = async (payload: ITrackerPayload): Promise<IGetUser> =>
  callApi('tracker', 'GetCurrentUser', payload)

/**
 * delete task in DF tracker
 */

export const DeleteIssue = async (payload: IDeleteIssuePayload) => callApi('tracker', 'DeleteIssue', payload)

/***
 * edit task's comment in DF tracker
 */

export const EditComment = async (payload: IEditCommentPayload): Promise<IEditComment> =>
  callApi('tracker', 'DeleteIssue', payload)

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

export const GetProjectsByUser = async (): Promise<IUserProject[]> => callApi('tracker', 'GetProjectsByUser')

export const GetAchievements = async (): Promise<IAchievementStatus[]> => callApi('tracker', 'GetAchievements')
/**
 * This method will add new colleague and will find and retrieve tracker list for this colleague, if it exists.
 */
export const AddColleague = async (payload: IColleaguePayload) => callApi('tracker', 'AddColleague', payload)

export const RemoveColleague = async (payload: IColleaguePayload) => callApi('tracker', 'RemoveColleague', payload)
/**
 * Method will remove colleague. After that it will retrieve tracker list and retreive credentials.
 * In the end it will configure adapter.
 */
export const LeaveProject = async (payload: IProjectAndTrackerPayload) => callApi('tracker', 'LeaveProject', payload)

export const GetProjectsByUserTrackers = async (payload: ITrackerPayload): Promise<ITrackerAndProjectStatus> =>
  callApi('tracker', 'GetProjectsByUserTrackers', payload)

export const CreateProject = async (payload: ICreateProjectPayload): Promise<IProjectID> =>
  callApi('tracker', 'CreateProject', payload)

export const RemoveProject = async (payload: IProjectAndTrackerPayload) => callApi('tracker', 'RemoveProject', payload)

export const RenameProject = async (payload: IRenameProjectPayload) => callApi('tracker', 'RenameProject', payload)

export const EditIssue = async (payload: IEditIssuePayload): Promise<IEditProjectIssue> => {
  const response = await callApi('tracker', 'EditIssue', payload)
  return response.Issue
}

export const UpdateIssueProgress = async (payload: IUpdateIssuePayload) =>
  callApi('tracker', 'UpdateIssueProgress', payload)
/**
 * This endpoint called when application needs to show to user how much time he reported for given day,
 * usually for today and yesterday. Method accepts timestamp marking beginning of “today” in user’s timezone.
 * Method then calculates total time reported today and nearest day within week before today.
 */
export const GetTotalReports = async (payload: IDatePayload): Promise<IReportTimeInfo> =>
  callApi('tracker', 'GetTotalReports', payload)

export const GetColleagues = async (payload: ITrackerPayload): Promise<IGetUser[]> =>
  callApi('tracker', 'GetColleagues', payload)

/**
 * Method should be used when user wants to connect external self-hosted tracker with Timeguard system.
 * Accepts authenticated request containing Tracker info and integration credentials
 */
export const AddTrackerIntegration = async (payload: IAddUserCredentialsPayload): Promise<ITracker> =>
  callApi('tracker', 'AddTrackerIntegration', payload)
/**
 * Method should be used when user wants to connect external self-hosted tracker with Timeguard system.
 */
export const UpdateTrackerIntegration = async (payload: ITrackerCredentialsPayload): Promise<ITracker> =>
  callApi('tracker', 'UpdateTrackerIntegration', payload)

export const FindByOAuthCode = async (payload: IOAuthCodePayload): Promise<IFindByOAuthCode> =>
  callApi('tracker', 'FindByOAuthCode', payload)

export const GetUserByOAuth = async (payload: IOAuthCodePayload): Promise<IUserID> =>
  callApi('tracker', 'GetUserByOAuth', payload)

export const GetUserByCredentials = async (payload: ITrackerCredentialsPayload): Promise<IUserID> =>
  callApi('tracker', 'GetUserByCredentials', payload)

/**
 * Validate tracker URL and server access.
 */
export const ValidateTracker = async (payload: IValidateTrackerPayload): Promise<IValidationResult[]> =>
  callApi('tracker', 'ValidateTracker', payload)
/**
 * Validate tracker URL, server availability and returns possible matches.
 */
export const ValidateURL = async (payload: IURLPayload): Promise<ITrackerExtendedInfo[]> =>
  callApi('tracker', 'ValidateURL', payload)
