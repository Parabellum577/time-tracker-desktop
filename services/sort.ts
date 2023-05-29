import { IFullIssue } from '@types'

const azSortByFieldList = <A, B, K extends keyof (A | B)>(a: A, b: B, fieldList: K[]) => {
  const values = fieldList.reduce(
    (res, fieldName) => {
      res.a += a[fieldName]
      res.b += b[fieldName]
      return res
    },
    {
      a: '',
      b: '',
    },
  )
  return compareStrings(values.a, values.b)
}

const azSortByField = <A, B, K extends keyof (A | B)>(a: A, b: B, fieldName: K) => {
  return compareStrings(String(a[fieldName]), String(b[fieldName]))
}

const compareStrings = (a: string, b: string) => {
  const av = a.trim().toUpperCase()
  const bv = b.trim().toUpperCase()

  if (av < bv) {
    return -1
  } else if (av > bv) {
    return 1
  } else {
    return 0
  }
}

const onPlaceSortByRecent = (recentIssues: IFullIssue[], array: any[]) => {
  if (!recentIssues.length || !array.length) {
    return
  }

  const key = 'ID' in array[0] ? 'ID' : 'ProjectID'

  const recentIssuesIds = recentIssues.reduce((list, item) => {
    if (list.indexOf(item[key]) < 0) {
      list.push(item[key])
    }
    return list
  }, [])

  array.sort((a: any, b: any) => {
    const aIndex = recentIssuesIds.indexOf(a[key])
    const bIndex = recentIssuesIds.indexOf(b[key])

    return bIndex - aIndex
  })
}

export { azSortByFieldList, azSortByField, onPlaceSortByRecent, compareStrings }
