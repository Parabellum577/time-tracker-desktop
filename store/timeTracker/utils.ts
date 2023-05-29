import * as _ from 'lodash'

/**
 *
 * @param A Array like object
 * @param B Array like object
 * @returns "left xor" for arrays. Return elements of the left array that are not including in the right
 *
 * @example
 * A = [1, 2, 3, 4, 5]
 * B = [1, 2, 4, 6, 7]
 * xorLeft(A, B) => [3, 5]
 */
export const xorLeft = <T>(A: T[], B: T[]) => A.filter(itemA => !B.some(itemB => _.isEqual(itemA, itemB)))
