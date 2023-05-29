export interface IIssueInfo {
  ActivityID: number
  FinishState: string
  IssueDone: number
  IssueDueDate: number
  IssueEstimation: number
  IssueID: string
  IssueSpent: number
  IssueState: string
  IssueTitle: string
  IssueURL: string
}

export interface IUserSession {
  Expires: number
  Refresh: string
  Token: string
}

export interface IUser {
  Activated: boolean
  Avatar: string
  ConfirmationSent: number
  Deleted: boolean
  FirstName: string
  IsAdmin: boolean
  IsAnonymous: boolean
  LastName: string
  Login: string
  PasswordUpdatedAt: number
  Phone: string
  Registered: number
  Skype: string
  SubscribeOnMail: boolean
  Timezone: number
  UpdatedAt: number
  UserID: number
  Role: string
}

export interface IDefaultUserSettings extends ITutorialSteps {
  isAppDefaultLaunch?: SettingsValueType
  isAutoPauseTask?: SettingsValueType
  isOverSpentMode?: SettingsValueType
  isAutoDailyReport?: SettingsValueType
  isNotifications?: SettingsValueType
  isSound?: SettingsValueType
  isInstantColdStart?: SettingsValueType
  isScreenshootNotifications?: SettingsValueType
  idle?: string
  cold_settings?: IBasicIssue
}

export interface ITutorialSteps {
  isDesktopInstalled: SettingsValueType
  isShowedSearchBarTutorial: SettingsValueType
  isShowedIntegrationTutorial: SettingsValueType
  isShowedPersonalProjectTutorial: SettingsValueType
  isShowedTaskAssignTutorial: SettingsValueType
}

type SettingsValueType = 'off' | 'on'

export interface IUpdateUser {
  FirstName: string
  LastName: string
  Phone: string
  Skype: string
  Avatar: string
  Role: string
}

export interface IError {
  code: number
  message: string
}

export interface IProductivityItem {
  Duration: number
  PlanningID: number
  Start: number
  End: number
  MouseClicks?: number
  MouseDistance?: number
  KeyboardPressed?: number
  ProjectID: string
  Title: string
  URL: string
  TrackerID: number
}

export interface IUserProject {
  Description: string
  Name: string
  ProjectID: string
  Status: 'Active' | 'Error' | 'Archived'
  Thumb: string
  TrackerID: number
}

export interface IUserSettings {
  Settings: ISettingsItem[]
}

export interface IUserInfo {
  User: IUser[]
}

export interface ISettingsItem {
  Key: string
  Value?: string
}

export interface IColleague {
  Members: IMember[]
  ProjectID: string
  ProjectStatus: string
  TrackerID: number
}

export interface IMember {
  UserID: number
  IsAdmin: boolean
}

export interface IProject {
  ActivityTypes: INamedID[]
  ColdProject: boolean
  DefaultProject: boolean
  Description: string
  IsAdmin: boolean
  IsHide: boolean
  IssuePriorities: INamedID[]
  IssueStatuses: INamedID[]
  IssueTypes: INamedID[]
  Name: string
  ProjectID: string
  ProjectStatus: string
  Thumb: string
  TrackerID: number
  TrackerType: string
  UserID: number
}
export interface IProjectDetails {
  ActivityTypes: INamedID[]
  DefaultProject: boolean
  ColdProject: boolean
  Description: string
  IssuePriorities: INamedID[]
  IssueStatuses: INamedID[]
  IssueTypes: INamedID[]
  Title: string
  ID: string
  TrackerID: number
  TrackerType: string
}

export interface INamedID {
  ID: number
  Name: string
}

export interface IProductivity {
  ActivityID: number
  ActivityName: 'WORK' | 'OTHER' | 'COMMUNICATION' | 'LEARNING' | 'ENTERTAINMENT'
  ActivityOrder: number
  CreatedAt: number
  Duration: number
  ID: number
  PlanningID: number
  ProjectID: string
  TrackerID: number
  Useful: boolean
  UserID: number
}

export interface IChartData {
  COMMUNICATION: number
  ENTERTAINMENT: number
  LEARNING: number
  OTHER: number
  WORK: number
}

export interface IColleagueInfo {
  Members: IActiveMember[]
  ProjectID: string
  ProjectStatus: string
  TrackerID: number
}

export interface IActiveMember {
  UserID: number
  IsAdmin: boolean
}

export interface IPlanningID {
  PlanningID: number
}

export interface IExtendedSpentTimeHistory {
  Comment?: string
  EndedAt: number
  IsEmpty: boolean
  IsFuture?: boolean
  IssueID?: string
  IssueTitle?: string
  Planning?: ITimelinePlanning
  PlanningID?: number
  ProjectID?: string
  TrackerType?: string
  Spent?: number
  minWidth?: number
  StartedAt: number
  Status?: 'ONLINE' | 'OFFLINE' | 'MANUAL'
  TrackerID?: number
  UserID?: number
}

export interface ITimelinePlanning {
  Active: boolean
  ID: number
  IsColdPlanning: boolean
  IsManual: boolean
  IssueEstimation: number
  IssueID: string
  IssueSpent: number
  IssueTitle: string
  IssueURL: string
  ProjectID: string
  SpentManual: number
  SpentOffline: number
  SpentOnline: number
  TrackerID: number
}

export interface ISpentTimeHistory {
  Comment: string
  EndedAt: number
  PlanningID: number
  Spent: number
  StartedAt: number
  Status: 'ONLINE' | 'OFFLINE' | 'MANUAL'
  UserID: number
}

export interface ITimeSummary {
  sumTotalDay: number
  sumManualToday: number
  sumTotalMonth?: number
  sumManualMonth?: number
}

export interface IGetPlanningsWithOptTimesheets {
  Plannings: IPlanning[]
  SpentTime: ISpentTimeHistory[]
}

export interface IIssueSpentTime {
  End: number
  IssueID: string
  PlanningID: number
  ProjectID: string
  Start: number
  TrackerID: number
}

export interface IPlanning {
  Active: boolean
  ActivityID: number
  CloseComment: string
  ClosedAt: number
  ColdPlanningID: number
  CreatedAt: number
  Estimation: number
  ID: number
  IsColdPlanning: boolean
  IsManual: boolean
  IssueDone: number
  IssueDueDate: number
  IssueEstimation: number
  IssueID: string
  IssueSpent: number
  IssueTitle: string
  IssueURL: string
  LastActivity?: number
  LastReason: string
  OpenComment: string
  Outdated: boolean
  Planned?: number
  PlanningDone: boolean
  ProjectID: string
  Reported: number
  SpentManual: number
  SpentOffline: number
  SpentOnline: number
  StartedBy: string
  Status: 'OPEN' | 'CLOSED'
  TrackerID: number
  UserID?: number
  IssuePriorities: INamedID
  IssueTypes: INamedID
  IssueStatuses: INamedID
  IssueActivities: number
}

export interface ISpentTime {
  Spent: number
}

export interface ISetSpent {
  TimeSpent: number
  TimeLeft: number
}

export interface INotificationInfo {
  preTitle?: string
  title?: string
  postTitle?: string
  message?: string
  image?: string
  leftButton?: string
  rightButton?: string
  idleTime?: number
}

export interface IGetEstimation {
  CreatedAt: number
  Estimation: number
  IssueID: string
  ProjectID: string
  TrackerID: number
}

export interface IBasicIssue {
  IssueID: string
  ProjectID: string
  TrackerID: number
  UserID?: number
}

export interface IFullIssue extends IProjectIssue {
  TrackerID: number
  ProjectID: string
}

export interface IGetFilteredPlannings {
  Plannings: IPlanning[]
  SpentTime: ISpentTimeHistory[]
}

export interface IProductivities {
  ActivityID: number
  ActivityName: 'WORK' | 'OTHER' | 'COMMUNICATION' | 'LEARNING' | 'ENTERTAINMENT'
  ActivityOrder: number
  CreatedAt: number
  Duration: number
  ID: number
  PlanningID: number
  ProjectID: string
  TrackerID: number
  Useful: boolean
  UserID: number
}

export interface IProductivitiesReduces {
  ActivityID: number
  Name: IProductivities['ActivityName']
  Time: number
  TimePercent: number
}
export interface IActivityTime {
  ActivityID: number
  Name: string
  Time: number
  TimePercent: number
}
export interface IFocusMonitoring {
  ID: number
  ActivityID: number
  Useful: boolean
  Type: string
  Title: string
  Time: number
  TimeP: number
  Switches: number
  Description: string
  TrackerID: number
  ProjectID: string
  URL: string
}
export interface IProductivitiesMonitoring {
  ActivityTime: IActivityTime[]
  FocusMonitoring: IFocusMonitoring[]
}

export interface IGetActivity {
  ID: number
  TrackerID: number
  ProjectID: string
  Name: string
  Order: number
  Useful: boolean
  Description: string
  AddWord: string
  Words: string[]
  DeletedWords: string[]
}
export interface IFocus {
  Focus: number
  Points: number
  Period: number
  TotalTime: number
  UsefulTime: number
  UnusefullTime: number
  CreatedAt: number
}

export interface IFocusChart {
  x: number
  y: number
}

export interface IGetUsersViolations {
  IssueAmount: number // Count of unique issues for given period
  OriginalEstimate: number // Seconds original estim
  PlansViolation: number // Amount of Planned time instances
  Reported: number // Reported time for issues for this users. It should include both users reports and other players
  UserID: number
}

export interface IGetProjectsViolations {
  IssueAmount: number
  OriginalEstimate: number
  PlansViolation: number
  ProjectID: string
  Reported: number
  TrackerID: number
}

export interface IIssueViolation {
  IssueInfo: IIssueInfo
  ProjectID: string
  TrackerID: number
  UserID: number
  Violation: IViolation
}

export interface IViolation {
  IssueAmount: number
  OriginalEstimate: number
  PlansViolation: number
  Reported: number
}

export interface IViolationReasons {
  Comment: string
  NewEstimation: number
  Timestamp: number
}

export interface IEstimate {
  CreatedAt: number
  Estimation: number
  IssueID: string
  ProjectID: string
  TrackerID: number
}

export interface IBasicIssueInfo {
  IssueID: string
  IssueTitle: string
  ProjectID: string
  TrackerID: number
}

export interface IGetTotalTime {
  Planned: number
  Spent: number
}

export interface IUserProject {
  ActivityTypes: INamedID[]
  DefaultProject: boolean
  Description: string
  ID: number
  IssueStatuses: INamedID[]
  IssueTypes: INamedID[]
  Title: string
  TrackerID: number
  TrackerType: string
  Trackers: IStatus[]
}

export interface IStatus {
  Available: boolean
  TrackerID: number
}

export interface IAchievementStatus {
  AchievedAt: number
  AchievedTimes: number
  Type: string
}

export interface ITrackerAndProjectStatus {
  Project: ITrackerProject[]
  Status: IStatus[]
}

export interface ITrackerProject {
  ActivityTypes: INamedID[]
  ColdProject: boolean
  DefaultProject: boolean
  Description: string
  ID: string
  IssuePriorities: INamedID[]
  IssueStatuses: INamedID[]
  IssueTypes: INamedID[]
  Title: string
  TrackerID: number
  TrackerType: string
}
export interface IBiller {
  ID: number
  Email: string
  Name: string
  Company: string
  Phone: string
  InvoiceId: string
}
export interface IClient {
  ID: number
  Email: string
  Name: string
  Company: string
  Phone: string
}
export interface ITaxes {
  Title: string
  Value: number
}
export interface IUserOnProject {
  UserID: number
  TrackerID: number
  ProjectID: string
}
export interface IRates {
  ID: number
  Type: string
  InvoiceId: string
  TrackerId: number
  ProjectId: string
  UserId: number
  Rate: number
  RateNotSet: boolean
}
export interface ICustomItems {
  Text: string
  Quantity: number
  Price: number
  Taxes: ITaxes[]
  Discount: number
}
export interface IInvoiceStatus {
  InvoiceStatus: string
}
export interface IInvoiceID {
  InvoiceID: string
}
export interface IPlanningItems {
  ID: number
  PlanningID: number
  Discount: number
  Taxes: ITaxes[]
  InvoiceId: string
}
export interface IInvoice {
  ID: string
  UserId: number
  DateCreated: number
  DueDate: number
  OrderNo: string
  InvoiceNo: string
  Sum: number
  SubTotal: number
  Paid: number
  SharingUri: string
  Notes: string
  TotalDiscount: number
  ClientId: number
  Client: IClient
  ViewMode: string
  Status: string
  Biller: IBiller
  Taxes: ITaxes[]
  CustomItems: ICustomItems[]
  PlanningItems: IPlanningItems[]
  PaymentItems: string
}

export interface IProjectID {
  IProjectID: string
}

export interface IInvoiceNumber {
  InvoiceNumber: string
}
export interface IInvoiceNumber {
  ID: number
  Email: string
  Name: string
  Company: string
  Phone: string
}
export interface IProjectIssue {
  Done: number
  DueDate: number // unix
  Estimate: number // seconds
  ID: string
  IsAssigned: true
  Spent: number
  Title: string
  Priority: INamedID
  Status: INamedID
  Type: INamedID
  Activity: number
  URL: string
}

export interface IEditProjectIssue {
  Title: string
  Description?: string
  Estimate: number
  DueDate: number
  Assignee?: string
  Priority?: INamedID
  Status?: INamedID
  Type?: INamedID['ID']
}

export interface IGetIssuesData {
  TrackerID: number
  ProjectIssues: Array<{
    ProjectID: string
    Issues: IProjectIssue[]
  }>
}

export interface IReportTimeInfo {
  LastDate: number // unix
  TotalLast: number // seconds
  TotalToday: number // seconds
}

export interface IReportTimeInfo {
  LastDate: number // unix
  TotalLast: number // seconds
  TotalToday: number // seconds
}

export interface IGetIssueByURL {
  Issue: IProjectIssue
  ProjectID: string
  TrackerID: number
}

export interface IGetUser {
  ID: string
  Mail: string
  Name: string
}

export interface ITracker {
  TrackerID: number
}

export interface ITrackerWithStatus {
  CredentialType: string
  Data: string
  Error: string
  ID: number
  ParentID: number
  Status: boolean
  TrackerUserMail: string
  Type: string
  URL: string
  Number?: number
}

export interface IUpdateTracker {
  ID: number
  URL: string
}

export interface IGetAuthMethods {
  Methods: IMethod[]
  RequiredIntegration: boolean
}

export type IMethod = 'PASS' | 'OAUTH' | 'OAUTH2' | 'TOKEN'

export interface ISupportedFeatures {
  Feature: string
}

export interface IOAuthURL {
  URL: string
}

export interface IFindByOAuthCode {
  FirstName: string
  LastName: string
  Login: string
  NewUser: boolean
  UserID: number
}

export interface IUserID {
  UserID: number
}

export interface ITrackerInfo {
  HasIntegration: boolean
  TrackerID: number
  Type: string
  URL: string
}

export interface IValidationResult {
  AuthMethods: IAuthMethods
  Confidence: number // 0 - 100
  URL: string
}

export interface ITrackerExtendedInfo {
  AuthMethods: IAuthMethods[]
  Confidence: number // 0 - 100
  HasIntegration: boolean
  IntegrationRequired: boolean
  TrackerID: number
  Type: string
  URL: string
}

export interface IAuthMethods {
  IAuthMethod: 'OAUTH' | 'OAUTH2' | 'TOKEN' | 'PASS'
}

export interface IScreenshotData {
  CreatedAt: number
  DeletedByUserID: number | null
  FileSize: number
  Files: null
  ID: number
  PlanningID: number
  ProjectID: string
  ProjectName: string
  TrackerID: number
  UserID: number
  UserName: string
}

export interface IUserScreenshots {
  Amount: number
  Screenshots: IScreenshotData[]
}

export interface ILastScreenshots {
  Screenshots: IScreenshotData[]
}

export interface IProjectConfigs {
  ID: number
  MaxSize: number
  ProjectID: string
  StorageType: 'LOCAL_STORAGE' | 'DROPBOX' | 'GOOGLE_DRIVE'
  TrackerID: number
}

export interface IProjectSettings {
  Screenshots: IProjectConfigs
}

export interface IUserScreenshotSettings {
  Email: string
  FolderName: string
  Image: string
  Name: string
  StorageType: 'LOCAL_STORAGE' | 'DROPBOX' | 'GOOGLE_DRIVE'
}

export interface IUserOAuthRedirectURI {
  URI: string
}

export interface IConfigureUserWithOAuthCode {
  Email: string
  FolderName: string
  StorageType: string
}

export interface IScreenshotAuthMethods {
  Methods: string[]
}

export interface IScreenshotStatus {
  newScreenshotStatus?: boolean
}

export interface IReportColdPlannings {
  reportComment: string
  valueToReport: number
  selectedIssue: IFullIssue
}

export interface IReportManually {
  EndTime: number
  ProjectID: string
  SelectedIssue: IProjectIssue
  StartTime: number
  TrackerID: number
  IssueStatus: INamedID
  IssuePriority: INamedID
  Comment: string
}

export interface IPlanningInfo {
  ActivityID: null | number
  Comment: string
  IssueDone: number
  IssueDueDate: number
  IssueEstimation: number
  IssueID: string
  IssueTitle: string
  IssueURL: string
  ProjectID: string
  TrackerID: number
  IssueStatus: INamedID
  IssuePriority: INamedID
}

export interface ISpendPart {
  start: number
  end: number
}
