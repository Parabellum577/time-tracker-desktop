import { 
    IInvoice,
    IInvoiceNumber,
    IInvoiceID,
    IInvoiceStatus,
    IRates,
    IClient,

} from '@types'
import {
    IDurationPayload,
    ISaveClientPayload,
    ICreateInvoicePayload,
    IInvoiceStatusPayload,
    IGetInvoicePayload,
    IRecordPaymentPayload,
    IInvoiceRatesPayload,

} from '@api-types'
import callApi from '../call-api'


/**
 * Method for getting invoice list
 */
export const GetInvoicesList = async (payload: IDurationPayload): Promise<IInvoice[]> => {
    const response = await callApi('invoice', 'GetMyCustomers', payload)
    if (!response || !response.Invoices) {
      return []
    }
    return response.Invoices
}

/**
 * Method for getting invoice rates
 */
export const GetRates = async (payload: IInvoiceRatesPayload): Promise<IRates[]> => {
    const response = await callApi('invoice', 'GetRates', payload)
    if (!response || !response.Rates) {
      return []
    }
    return response.Rates
}

/**
 * Method for getting invoice
 */
export const GetInvoice = async (payload: IGetInvoicePayload): Promise<IInvoice> =>
  callApi('invoice', 'GetInvoice', payload)


/**
 * Method for create new invoice
 */
export const CreateInvoice = async (payload: ICreateInvoicePayload): Promise<IInvoiceID> =>
   callApi('invoice', 'CreateInvoice', payload)


/**
 * Method for update invoice
 */
export const UpdateInvoice = async (payload: IInvoice) =>
  callApi('invoice', 'UpdateInvoice', payload)

/**
 * Method for save new client
 */
export const SaveClient = async (payload: ISaveClientPayload): Promise<IClient> =>
  callApi('invoice', 'SaveClient', payload)


/**
 * Method for set invoice status
 */
export const SetInvoiceStatus = async (payload: IInvoiceID): Promise<IInvoiceStatus> =>
  callApi('invoice', 'SetInvoiceStatus', payload)

/**
 * Method for sent mail
 */
export const SentMail = async (payload: IInvoiceStatusPayload) =>
  callApi('invoice', 'SentMail', payload)


/**
 * Method for record payments
 */
export const RecordPayment = async (payload: IRecordPaymentPayload) =>
  callApi('invoice', 'RecordPayment', payload)
  
  
/**
 * Method has generate invoice number
 */
export const GenerateInvoiceNumber = async (payload: IDurationPayload): Promise<IInvoiceNumber> => 
    callApi('invoice', 'GenerateInvoiceNumber', payload)

