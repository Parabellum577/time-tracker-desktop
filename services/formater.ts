export const formatTime = (
  total: number,
  pattern:
    | 'Hh MMm'
    | 'Hh Mm'
    | 'HH:MM'
    | 'H:MM'
    | 'HH:MM:SS'
    | 'H:MM:SS'
    | 'H:M'
    | 'H:M:S'
    | 'H: MM: SS'
    | 'H'
    | 'h'
    | 'Hh'
    | 'Hh Mm Ss'
    | 'H:MMm' = 'Hh Mm',
): string => {
  const totalValidated = Math.max(total, 0)
  let time: string
  const hours = Math.floor(totalValidated / 3600).toString()
  const minutes = Math.floor((totalValidated % 3600) / 60).toString()
  const seconds = Math.floor((totalValidated % 3600) % 60).toString()

  switch (pattern) {
    case 'Hh MMm':
      time = `${hours}h ${minutes.padStart(2, '0')}m`
      break
    case 'H: MM: SS':
      time = `${hours.padStart(1, '0')}: ${minutes.padStart(2, '0')}: ${seconds.padStart(2, '0')}`
      break
    case 'HH:MM':
      time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
      break
    case 'H':
      time = +hours > 0 ? `${hours}h` : `${minutes}m`
      break
    case 'h':
      time = +hours > 0 ? `${hours}` : `${minutes}m`
      break
    case 'H:M':
      time = `${hours.padStart(1, '0')}:${minutes.padStart(1, '0')}`
      break
    case 'H:MMm':
      time = `${hours}:${minutes.padStart(2, '0')}m`
      break
    case 'H:MM':
      time = `${hours}:${minutes.padStart(2, '0')}`
      break
    case 'H:M:S':
      time = `${hours.padStart(1, '0')}:${minutes.padStart(1, '0')}:${seconds.padStart(1, '0')}`
      break
    case 'HH:MM:SS':
      time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
      break
    case 'H:MM:SS':
      time = `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
      break
    case 'Hh Mm':
      time = `${hours}h ${minutes}m`
      break
    case 'Hh Mm Ss':
      time = `${hours}h ${minutes}m ${seconds}s`
      break
    case 'Hh':
      time = `${hours}.${minutes}h`
      break
  }

  return time
}

export const normalizeString = (str: string) =>
  Array.from(str)
    .map(char => char.replace(/[\+\*\?\{\}\(\)\[\]\.\\\|]/, `\\${char}`))
    .join('')
