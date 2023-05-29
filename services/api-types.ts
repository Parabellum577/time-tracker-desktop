import {
  IPlanning,
  IProductivityItem,
  INamedID,
  IEditProjectIssue,
  IBiller,
  IClient,
  ITaxes,
  ICustomItems,
  IUserOnProject,
  IPlanningItems,
} from '@types'

export type Service =
  | 'planning'
  | 'user'
  | 'tracker'
  | 'project'
  | 'amplitude'
  | 'feedback'
  | 'productivity'
  | 'screenshot'
  | 'confirmation'
  | 'standup'
  | 'statistics'
  | 'invoice'
  | 'avatar'

export interface IMassiveGenerateAvatarLinkPayload {
  UserIds: number[]
  SizeX: number
  SizeY: number
}

export interface IAvatarsLinks {
  AvatarLinks: string[]
}

export interface ILoginUserPayload {
  Login: string
  Password: string
}

export interface ILoginOTSPayload {
  OTS: string
}

export interface IAddUserPayload extends IUpdateUserPayload {
  Login: string
  Password: string
}

export interface IAnalyzeActivityPayload {
  URLs: void[]
  Applications: void[]
  Titles: IProductivityItem[]
}

export interface IUpdateUserPayload {
  FirstName: string
  LastName: string
  Phone: string
  Skype: string
}

export interface IForgotPwdPayload {
  Login: string
}

export interface IUpdatePwdByUser {
  NewPassword: string
  OldPassword: string
}

export interface IRefreshTokenPayload {
  Refresh: string
}

export interface IMakeUserAdminPayload {
  UserID: number
  TrackerID: number
  ProjectID: string
  Admin: boolean
}

export interface IUpdateProjectVisibilityPayload {
  ProjectID: string
  TrackerID: number
  Value: boolean
}

export interface IGetSettingsPayload {
  ProjectID: string
  TrackerID: number
  IssueID?: string
  hasUpdate?: boolean
}

export interface IGetProductivitiesPayload {
  FilterProjects: IGetSettingsPayload[]
  FilterUsers: number[]
  From: number
  To: number
}

export interface IGetFocusPayload {
  FilterProjects: IGetSettingsPayload[]
  FilterUsers: number[]
  From: number
  To: number
  Period: 'currently' | 'hourly' | 'daily' | 'weekly' | 'none'
}

export interface IGetSwitchesPayload {
  FilterProjects: IGetSettingsPayload[]
  FilterUsers: number[]
  From: number
  To: number
}

export interface IGetMonitoringPayload {
  FilterProjects: IGetSettingsPayload[]
  FilterUsers: number[]
  From: number
  To: number
}

export interface IDistributeTitlePayload {
  Title: string
  From: number
  To: number
}

export interface ISetSettingsPayload {
  ProjectID: string
  TrackerID: number
  Key: string
  Value: string
}

export interface ISettingsItemPayload {
  Key: string
  Value: string
}

export interface ICreatePlanningPayload {
  ProjectID: string
  TrackerID: number
  IssueID: string
  IssueTitle: string
  IssueURL: string
  IssueEstimation: number
  IssueDueDate: number
  IssueSpent: number
  IssueDone: number
  IssuePriorities: INamedID
  IssueStatuses: INamedID
  IssueTypes: INamedID
  ActivityID: number
  Estimation: number // in seconds
  Comment: string
}

export type IStopPlanning =
  | {
      reason: 'idle'
    }
  | {
      reason: 'become-master'
    }
  | {
      reason: 'expired'
      expiredTime: number
    }

export interface ICreateManualPlanningPayload {
  Active?: boolean
  ActivityID: number | null
  ClosedAt?: number
  Comment: string
  CreatedAt?: number
  Estimation: number
  IssueDone?: number
  IssueDueDate?: number
  IssueEstimation: number
  IssueID: string
  IssueSpent?: number
  IssueTitle: string
  IssueURL: string
  LastActivity?: number
  Outdated?: boolean
  ProjectID: string
  Reported?: number
  SpentManual: number
  SpentOffline?: number
  SpentOnline?: number
  StartedBy?: string
  Status?: string
  Time: number
  TrackerID: number
}

export interface ICreateManualPlanningsPayload {
  ActivityID: number
  Comment: string
  Estimation: number
  FinishState: number
  IssueDone: number
  IssueDueDate: number
  IssueEstimation: number
  IssueID: string
  IssueSpent: number
  IssueState: number
  IssueTitle: string
  IssueURL: string
  ProjectID: string
  SpentManual: number
  Time: number
  TrackerID: number
}

export interface ISetPlanningDonePayload {
  Cl: IClaimsPayload[]
  UserID: number
  PlanningID: number
}

export interface IClaimsPayload {
  UserID: number
  Admin: boolean
}

export interface ICreateColdPlanningPayload {
  CreatedAt: number
}

export interface ICloseColdPlanningWithoutReportPayload {
  CreatedAt?: number
  PlanningID: number
}

export interface IGetColdPlanningsPayload {
  Open: IExtendedPlanningPayload[]
  NotReported: IExtendedPlanningPayload[]
}

export interface IExtendedPlanningPayload {
  Planning: IPlanning[]
  Estimation: number
  LastActivity: number
  Outdated: boolean
  Active: boolean
}

export interface IPlanningPayload {
  ID: number
  UserID: number
  Status: string
  ProjectID: string
  TrackerID: string
  SpentOnline: number
  SpentOffline: number
  SpentManual: number
  Reported: number
  CreatedAt: number
  CloseComment: string
  OpenComment: string
  ClosedAt: number
  PlanningDone: boolean
  StartedBy: string
  ColdPlanningID: number
  IsColdPlanning: boolean
  IsManual: boolean
  IssueInfo: IIssueInfoPayload[]
}

export interface IIssueInfoPayload {
  IssueID: string
  IssueTitle: string
  IssueURL: string
  IssueEstimation: number
  IssueDueDate: number
  IssueDone: number
  IssueSpent: number
  ActivityID: number
  IssueState: string
  FinishState: string
}

export interface IDurationPayload {
  From: number
  To: number
}

export interface IGetTimesheetPlanningsPayload {
  FilterUsers: IFilterUsersPayload[]
  FilterProjects: IFilterProjectsPayload[]
  DateFrom: number // start of the day in seconds. UTC Timestamp
  DateTo: number
  Plannings: IPlanningPayload[]
}

export interface IFilterUsersPayload {
  userID: number
}

export interface IFilterProjectsPayload {
  TrackerID: number
  ProjectID: string
}

export interface IGetFilteredPlanningsPayload {
  FilterUsers: number[]
  FilterProjects: IFilterProjectsPayload[]
  DateFrom: number
  DateTo: number
}

export interface ITaskAssignmentSliceayPayload {
  Slices: IColdSlice[]
}

export interface IColdSlice {
  ActivityID: number | null
  Comment: string
  End: number
  IssueDone: number
  IssueDueDate: number
  IssueEstimation: number
  IssueID: string
  IssueTitle: string
  IssueURL: string
  ProjectID: string
  Start: number // Start of period by GMT
  Status: string
  TrackerID: number
}

export interface ISetExtraPayload {
  PlanningID: number
  Estimation: number
  Reason: string
}

export interface ISetActivePayload {
  UserID?: number
  PlanningID: number
  Time: number
  TracingID?: string
}

export interface ISetSpentPayload {
  PlanningID: number
  Time: number
}

export interface IClosePlanningPayload {
  PlanningID: number
  Progress: number
  Time: number // amount in seconds reported for this planning
  Comment: string
  IssueState?: INamedID // Issue State from tracker
  FinishState?: INamedID // Issue State for Time Guard
  IssuePriority: INamedID
  IssueStatus: INamedID
}

export interface IIssuePayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
}
export interface IProjectIDs {
  TrackerID: number
  ProjectID: string
}
export interface ICopyDistributionSettingsPayload {
  FromProject: IProjectIDs[]
  ToProject: IProjectIDs[]
}
export interface IEditIssuePayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
  Issue: IEditProjectIssue
}

export interface IPlanningIDPayload {
  PlanningID: number
}

export interface IGetUsersPlanningsPayload {
  FilterUsers: IFilterUsersPayload[]
  DateFrom: number
  DateTo: number
}

export interface IAddManualPeriodPayload {
  PlanningID: number
  StartDateTime: number
  Duration: number
}

export interface IPostponedReportPayload {
  PlanningID: number
  Time: number
}

export interface IIssuesLimitPayload {
  Limit: number // default 5
}

export interface IColleaguePayload {
  TrackerID: number
  ProjectID: string
  Email: string
  URL: string
}

export interface IProjectAndTrackerPayload {
  TrackerID: number
  ProjectID: string
}

export interface ITrackerPayload {
  TrackerID: number
}

export interface ICreateProjectPayload {
  TrackerID: number
  ID: string
  Title: string
  Description: string
}

export interface IRenameProjectPayload {
  TrackerID: number
  ID: string
  NewTitle: string
  Description: string
}

export interface IGetProjectIssuesPayload {
  TrackerID: number
  ProjectID: string
  IssueStatuses: INamedID[]
  AssignedOnly: boolean
}

export interface IGetIssuesDataPayload {
  Data: Array<{
    TrackerID: number
    ProjectIssues: IProjectIssuesPayload[]
  }>
}

export interface IProjectIssuesPayload {
  ProjectID: string
  IssueIDs: string[]
}

export interface ICreateIssuePayload {
  TrackerID: number
  ProjectID: string
  Issue: IIssueDataPayload
}

export interface IIssueDataPayload {
  Title: string
  Description: string
  Estimate: number
  DueDate: number
  Status: INamedID
  Priority: INamedID
  Type: INamedID['ID']
  Assignee: string
}

export interface IUpdateIssuePayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
  Progress: number
}

export interface IDeleteIssuePayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
}

export interface IEditCommentPayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
  CommentID: number
  ThreadID: number
  NewMessage: string
}

export interface IEditComment {
  Comments: string
}

export interface IReportTimePayload {
  TrackerID: number
  ProjectID: string
  Report: IReportPayload
}

export interface IReportPayload {
  IssueID: string
  ActivityID: number
  Started: number // unix
  Duration: number // seconds
  Comments: string
  Progress: number // 0-100%
  ReportTime?: string
  IssueTitle?: string
}

export interface ISetStatusPayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
  IssueStatus: INamedID
}

export interface ISetPriorityPayload {
  TrackerID: number
  ProjectID: string
  IssueID: string
  IssuePriority: INamedID
}

export interface IDatePayload {
  Date: number // unix
}

export interface IIssueURLPayload {
  IssueURL: string
}

export interface IAddUserCredentialsPayload {
  URL: string
  Type: string
  Credentials: IPassCredentialsPayload | ITokenCredentialsPayload
}

export interface IPassCredentialsPayload {
  Login: string
  Password: string
  Type: 'PASS'
}

export interface ITokenCredentialsPayload {
  Token: string
  Type: 'TOKEN'
}

export interface ITrackerCredentialsPayload {
  TrackerID: number
  Credentials: IPassCredentialsPayload | ITokenCredentialsPayload
}

export interface IGetAuthMethodsPayload {
  TrackerID?: number
  ProjectID?: string
  Type?: string
}

export interface IOAuthCodePayload {
  TrackerID: number
  Code?: string
  Token?: string
}

export interface IURLPayload {
  URL: string
}

export interface IValidateTrackerPayload {
  URL: string
  Type?: string // optional
}

export interface IGetUserScreenshotsPayload {
  DateFrom: number
  DateTo: number
  FilterProjects: IProjectAndTrackerPayload[]
  FilterUsers: number[]
  Limit: number
  Offset: number
}

export interface IGetLastScreenshotsPayload {
  Date: number
  ProjectID: string
  TrackerID: number
  Users: number[]
}

export interface IScreenshotIDPayload {
  ScreenshotID: number
}

export interface IDeleteScreenshotPayload {
  ScreenshotID: number
}

export interface IConfigureProjectPayload {
  MaxSize: number
  ProjectID: string
  StorageType: string
  TrackerID: number
}

export interface IConfigureProjectWithIntegrationPayload {
  Addr?: string
  AppID?: string
  AppSecret?: string
  Bucket?: string
  MaxSize?: number
  ProjectID: string
  Region?: string
  StorageType?: string
  TrackerID: number
}

export interface IExpireData {
  wall: number // uint64
  ext: number
  loc?: any // location info
}

export interface IStorageInfo {
  FolderID: string
  AccessToken: string
  RefreshToken: string
  Expiry: IExpireData
}

export interface IUserInfoPayload {
  UserIDs: number[]
}
export interface IConfigureUserPayload {
  UserID: number
  MaxSize: number
  StorageType: string
  StrorageInfo: IStorageInfo
  Email: string
}

export interface IConfigureUserWithIntegrationPayload {
  Addr?: string
  AppID?: string
  AppSecret?: string
  Bucket?: string
  MaxSize?: number
  Region?: string
  StorageType?: string
}

export interface IConfigureProjectWithPasswordPayload {
  Folder?: string
  Login: string
  MaxSize?: number
  Password: string
  ProjectID: string
  StorageType?: string
  TrackerID: number
}

export interface IConfigureUserWithPasswordPayload {
  Folder?: string
  Login: string
  MaxSize?: number
  Password: string
  StorageType?: string
}

export interface IUserOAuthRedirectURIPayload {
  StorageType: string
}

export interface IConfigureUserWithOAuthCodePayload {
  Code: string
  MaxSize: number
  StorageType: string
}

export interface IGetProjectAuthMethodsPayload {
  Code: string
  ProjectID: string
  TrackerID: number
}

export interface IGetUserAuthMethodsPayload {
  Code: string
}
export interface IInvoiceRatesPayload {
  UserOnProject: IUserOnProject[]
  InvoiceID: string
}
export interface IRecordPaymentPayload {
  Amount: number
  Date: number
  Notes: string
  InvoiceId: string
}

export interface ICreateInvoicePayload {
  DateCreated: number
  DueDate: number
  OrderNo: string
  InvoiceNo: string
  Sum: number
  Paid: number
  SubTotal: number
  Notes: string
  Status: string
  Client: IClient
  ClientId: number
  Biller: IBiller
  Taxes: ITaxes[]
  TotalDiscount: number
  PlanningItems: IPlanningItems[]
  CustomItems: ICustomItems[]
}
export interface IInvoiceStatusPayload {
  InvoiceID: string
  Status: string
}
export interface IGetInvoicePayload {
  InvoiceID: string
}
export interface ISaveClientPayload {
  Name: string
  Company: string
  Email: string
  Phone: string
}

export interface IUpdateProjectCacheByTrackers {
  TrackerIDs: number[]
}

export interface IConfirmEmailCheckCodePayload {
  Code: string
}

export interface IResendConfirmationPayload {
  Login: string
}

export interface IScheduleStandupPayload {
  Name: string
  Users: number[]
}

export interface IStandupId {
  ID: number
}

export interface IStandupIdPayload {
  ID: number
}

export interface ILeaveStandupPayload {
  ID: number
  UserID: number
  NewOwnerID?: number
}

export interface IScheduleReportPayload {
  ReportType: 'user' | 'manager'
  Frequency: 'daily' | 'weekly' | 'fortnightly' | 'three-week' | 'monthly' | 'off'
  Day: '' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  Email: string
}

export interface IUnscheduleReportPayload {
  ReportType: 'user' | 'manager'
  Frequency: 'off'
  Day: ''
  Email: string
}

export type UserPayloads =
  | ILoginUserPayload
  | IAddUserPayload
  | IUpdateUserPayload
  | IRefreshTokenPayload
  | IForgotPwdPayload
  | IUpdatePwdByUser
  | ISettingsItemPayload

export type ProjectPayloads = IMakeUserAdminPayload | IGetSettingsPayload | ISetSettingsPayload

export type PlanningPayloads =
  | ICreateManualPlanningPayload
  | ICreateManualPlanningsPayload
  | ISetPlanningDonePayload
  | ICreateColdPlanningPayload
  | IGetColdPlanningsPayload
  | IDurationPayload
  | IGetTimesheetPlanningsPayload
  | IGetFilteredPlanningsPayload
  | ITaskAssignmentSliceayPayload
  | ISetExtraPayload
  | ISetActivePayload
  | ISetSpentPayload
  | IClosePlanningPayload
  | IIssuePayload[]
  | IPlanningIDPayload
  | IGetUsersPlanningsPayload
  | IAddManualPeriodPayload
  | IPostponedReportPayload
  | IIssuesLimitPayload

export type TrackerPayloads =
  | IColleaguePayload
  | IProjectAndTrackerPayload
  | ITrackerPayload
  | ICreateProjectPayload
  | IRenameProjectPayload
  | IGetProjectIssuesPayload
  | IGetIssuesDataPayload[]
  | ICreateIssuePayload
  | IUpdateIssuePayload
  | IReportTimePayload
  | ISetStatusPayload
  | ISetPriorityPayload
  | IDatePayload
  | IIssueURLPayload
  | IAddUserCredentialsPayload
  | ITrackerCredentialsPayload
  | IGetAuthMethodsPayload
  | IURLPayload
  | IValidateTrackerPayload
  | IGetIssuesDataPayload

export type ProductivityPayloads = IAnalyzeActivityPayload | IGetProductivitiesPayload

export type ScreenshotPayloads =
  | IGetUserScreenshotsPayload
  | IGetLastScreenshotsPayload
  | IScreenshotIDPayload
  | IConfigureProjectPayload
  | IConfigureUserPayload
  | IConfigureProjectWithIntegrationPayload
  | IConfigureUserWithIntegrationPayload
  | IConfigureProjectWithPasswordPayload
  | IConfigureUserWithPasswordPayload
  | IUserOAuthRedirectURIPayload
  | IConfigureUserWithOAuthCodePayload
  | IGetProjectAuthMethodsPayload
  | IGetUserAuthMethodsPayload

export type IStandupPayload = IScheduleStandupPayload | IStandupIdPayload | ILeaveStandupPayload

export type IConfirmPayload = IConfirmEmailCheckCodePayload | IResendConfirmationPayload

export type IStatisticsPayload = IScheduleReportPayload | IUnscheduleReportPayload

export type IAvatarPayload = IMassiveGenerateAvatarLinkPayload

export type Payloads =
  | UserPayloads
  | ProjectPayloads
  | PlanningPayloads
  | TrackerPayloads
  | ProductivityPayloads
  | ScreenshotPayloads
  | ILoginOTSPayload
  | IUpdateProjectCacheByTrackers
  | IInvoiceRatesPayload
  | IGetInvoicePayload
  | ICreateInvoicePayload
  | ISaveClientPayload
  | IDurationPayload
  | IRecordPaymentPayload
  | IInvoiceStatusPayload
  | IStandupPayload
  | IConfirmPayload
  | IStatisticsPayload
  | IAvatarPayload
