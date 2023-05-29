import { IConfirmEmailCheckCodePayload, IResendConfirmationPayload } from '@api-types'
import callApi from '../call-api'

/**
 * dashboard
 */

/**
 * send mail confirmation code to server
 */
export const ConfirmEmailCheckCode = async (payload: IConfirmEmailCheckCodePayload) =>
  callApi('confirmation', 'ConfirmEmailCheckCode', payload)

/**
 * send mail confirmation link code to user mail
 */
export const ResendConfirmation = async (payload: IResendConfirmationPayload) =>
  callApi('confirmation', 'ResendConfirmation', payload)

// return callApi('feedback', 'ConfirmRequest', {
//   Topic: topic,
// })

// await callApi('statistics', 'UnscheduleReport', data);
// await callApi('statistics', 'ScheduleReport', data);
