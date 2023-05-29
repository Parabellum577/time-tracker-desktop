import axios from 'axios'
import callApi from '../call-api'
import { IMassiveGenerateAvatarLinkPayload, IAvatarsLinks } from '@api-types'
import { getAuthData } from '@store/auth/utils'
import { setAuthCookies } from '@services/call-api'
const defaultAvatar = require('@images/df-icon-profile.svg')

/**
 * Get user avatar
 * NOT RPC CALL
 *
 * Request Query params:
 *    Cookies:
 *      Authorization=Token
 *    UserId(dy default current userid from token)
 *
 * Reponse:
 *    HTTP Code 200 and binary data if user has avatar
 *    HTTP Code 404 if user hasn't avatar
 */
export async function getAvatar() {
  const url = `${process.env.API_URL}/avatar`
  return axios
    .get(url, {
      headers: {
        Cookie: `Authorization=${getAuthData().Token}`,
      },
      responseType: 'arraybuffer',
    })
    .then(response => {
      const image = Buffer.from(response.data, 'binary').toString('base64')
      // localStorage.setItem(`avatar_${userID}`, imageBase) // TODO: Implement offline mode
      return `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
    })
    .catch(() => {
      // console.error(error)
      return defaultAvatar
    })
}

/**
 * Send user avatar
 * NOT RPC CALL
 *
 *
 * Request Query params:
 *    Cookies:
 *      Authorization=Token
 *    UserId(dy default current userid from token)
 *    sizex: number, width of avatar
 *    sizey: number, height of avatar
 * Request body:
 *    Avatar: DataURL
 *
 *
 * Reponse:
 *    HTTP Code 200
 */
export async function sendAvatar(userID: number, avatar: string) {
  await setAuthCookies()
  const url = `${process.env.API_URL}/avatar?sizex=400&sizey=400`
  return axios({
    url,
    method: 'POST',
    data: avatar,
  }).then(() => {
    // localStorage.setItem(`avatar_${userID}`, avatar) // TODO: Implement offline mode
  })
}

/* dashboard */

/**
 * method checks ability to delete and delets one screenshot
 */
export const MassiveGenerateAvatarLink = async (payload: IMassiveGenerateAvatarLinkPayload): Promise<IAvatarsLinks[]> =>
  callApi('avatar', 'MassiveGenerateAvatarLink', payload)
