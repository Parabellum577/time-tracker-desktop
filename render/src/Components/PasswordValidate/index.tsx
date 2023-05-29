import * as React from 'react'

const styles = require('./styles.module.scss')

interface IOwnProps {
  password: string
  setPasswordValid: React.Dispatch<React.SetStateAction<boolean>>
  isPasswordValidBlockShow: boolean
}

const PasswordValidate: React.FC<IOwnProps> = props => {
  const [isHasLowerCaseLetter, setHasLowerCaseLetter] = React.useState(false)
  const [isHasUpperCaseLetter, setHasUpperCaseLetter] = React.useState(false)
  const [isHasNumber, setHasNumber] = React.useState(false)
  const [isHasEnoughLetters, setHasEnoughLetters] = React.useState(false)

  const validateSteps = [
    { title: 'Lower case letter', flag: isHasLowerCaseLetter },
    { title: 'Upper case letter or number', flag: isHasUpperCaseLetter || isHasNumber },
    { title: 'At least 8 to 64 characters', flag: isHasEnoughLetters },
  ]

  React.useEffect(() => {
    setHasLowerCaseLetter(props.password !== props.password.toLocaleUpperCase())

    setHasUpperCaseLetter(props.password !== props.password.toLocaleLowerCase())

    setHasNumber(!!props.password.match(/\d+/))

    setHasEnoughLetters(props.password.length >= 8 && props.password.length <= 64)
  }, [props.password])

  React.useEffect(() => {
    const isAllPasswordValidateStepsDone =
      isHasLowerCaseLetter && (isHasUpperCaseLetter || isHasNumber) && isHasEnoughLetters

    props.setPasswordValid(isAllPasswordValidateStepsDone)
  }, [isHasLowerCaseLetter, isHasUpperCaseLetter, isHasNumber, isHasEnoughLetters])

  return (
    (props.password || props.isPasswordValidBlockShow) && (
      <div className={styles.passwordValidateBlock}>
        <h3>Your password must have:</h3>
        <ul>
          {validateSteps.map(item => {
            return (
              <li key={item.title} className={item.flag ? styles.valid : undefined}>
                {item.title}
              </li>
            )
          })}
        </ul>
      </div>
    )
  )
}

export default React.memo(PasswordValidate)
