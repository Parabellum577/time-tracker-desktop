import { IPlanning, ITrackerWithStatus, IUser, IFullIssue, IUserScreenshotSettings } from '@services/types'
import { IAlert } from '@store/alerts/types'

export const SIMPLE_PLANNING: IPlanning = {
  Active: false,
  ActivityID: 0,
  CloseComment: 'string',
  ClosedAt: 0,
  ColdPlanningID: 0,
  CreatedAt: 0,
  Estimation: 0,
  ID: 0,
  IsColdPlanning: true,
  IsManual: true,
  IssueDone: 0,
  IssueDueDate: 0,
  IssueEstimation: 0,
  IssueID: 'string',
  IssueSpent: 0,
  IssueTitle: 'string',
  IssueURL: 'string',
  LastReason: 'string',
  OpenComment: 'string',
  Outdated: true,
  PlanningDone: true,
  ProjectID: 'string',
  Reported: 0,
  SpentManual: 0,
  SpentOffline: 0,
  SpentOnline: 0,
  StartedBy: 'string',
  Status: 'OPEN',
  TrackerID: 0,
  IssuePriorities: null,
  IssueStatuses: null,
  IssueTypes: null,
  IssueActivities: null,
}

export const SIMPLE_TRACKER: ITrackerWithStatus = {
  CredentialType: 'string',
  Data: 'string',
  Error: 'string',
  ID: 0,
  ParentID: 0,
  Status: true,
  TrackerUserMail: 'string',
  Type: 'string',
  URL: 'string',
}

export const SIMPLE_USER: IUser = {
  Activated: true,
  Avatar: '',
  ConfirmationSent: 0,
  Deleted: false,
  FirstName: 'Sam',
  IsAdmin: false,
  IsAnonymous: false,
  LastName: 'Smith',
  Login: 'test@gmail.com',
  PasswordUpdatedAt: 0,
  Phone: '911',
  Registered: 1538382878,
  Skype: 'whatIsIt',
  SubscribeOnMail: false,
  Timezone: 10800,
  UpdatedAt: 1555054724,
  UserID: 27311,
  Role: 'Other',
}

export const SIMPLE_ALERT: IAlert = {
  alertType: 'error',
  alertMessage: 'INVALID_LOGIN',
}

export const SIMPLE_ISSUE: IFullIssue = {
  Done: 0,
  DueDate: 0, // unix
  Estimate: 0,
  ID: 'string',
  IsAssigned: true,
  Priority: {
    ID: 0,
    Name: 'string',
  },
  ProjectID: 'string',
  Spent: 0,
  Status: {
    ID: 0,
    Name: 'string',
  },
  Title: 'string',
  TrackerID: 0,
  Type: {
    ID: 0,
    Name: 'string',
  },
  Activity: 0,
  URL: 'string',
}

export const SIMPLE_SCREENSHOT_STORAGE: IUserScreenshotSettings = {
  Email: 'user@gmail.com',
  FolderName: 'New Folder',
  Image: '',
  Name: 'bla-bla-bla',
  StorageType: 'DROPBOX',
}
