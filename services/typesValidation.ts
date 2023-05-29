import { isWebUri } from 'valid-url'

const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const EMAIL_REGEXP_2 = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@[^-]/
const EMAIL_REGEXP_3 = /^(([a-zA-Z0-9!.\-#$%&'"*+-/=?^_`{|}~[\]\s]+)*)@[^-]/

export const isEmailValid = (mail: string) => {
  if (!EMAIL_REGEXP.test(mail)) {
    return false
  }

  if (!EMAIL_REGEXP_2.test(mail)) {
    return false
  }

  return EMAIL_REGEXP_3.test(mail)
}

export const isUrlValid = (url: string) => isWebUri(url)
