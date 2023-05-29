import * as React from 'react'
import classNames from 'classnames'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

const rolesArr = [
  'Accounting',
  'Backend Developer',
  'Business Analyst',
  'Business Development',
  'Business Operations',
  'C-Level Positions',
  'Community Manager',
  'Consulting',
  'Content Creator',
  'Creative Arts',
  'Creative Director',
  'Customer Service',
  'Data Scientist',
  'DevOps',
  'Developer',
  'Engineering Manager',
  'Finance',
  'Founder',
  'Frontend Developer',
  'Full Stack Developer',
  'Growth Hacking',
  'Human Resources',
  'Hardware Engineer',
  'Manager Business Development',
  'Marketing',
  'Mechanical Engineer',
  'Mobile Developer',
  'Mobile QA',
  'Net Security',
  'Office Manager',
  'Product Manager',
  'Project Manager',
  'Program Manager',
  'QA /QC Engineering',
  'Recruiter',
  'Sales',
  'Software Architect',
  'Software Development',
  'System Administration',
  'System Engineer',
  'Tech support',
  'UI/UX Designer',
  'User Researcher',
  'Other',
]

interface IOwnProps {
  setUserRole: React.Dispatch<React.SetStateAction<string>>
  userRole: string
  isPickerDisable: boolean
}

const RolePicker: React.FC<IOwnProps> = props => {
  const roleMenuRef = React.useRef(null)
  const maxLengthOfRole = 19
  const [isRoleMenuOpened, setRoleMenuOpened] = React.useState(false)
  const [role, setRole] = React.useState(props.userRole)
  const chosenRole = role.length > maxLengthOfRole ? role.substring(0, maxLengthOfRole) + '...' : role

  React.useEffect(() => {
    document.addEventListener('click', detectOutClick)
    return () => {
      document.removeEventListener('click', detectOutClick)
    }
  }, [isRoleMenuOpened])

  const detectOutClick = (e: MouseEvent) => {
    if (roleMenuRef.current && !roleMenuRef.current.contains(e.target) && isRoleMenuOpened) {
      setRoleMenuOpened(false)
    }
  }

  const roleMenuToggle = () => {
    setRoleMenuOpened(!isRoleMenuOpened)
  }

  const handleRole = (chosenItem: string) => {
    setRole(chosenItem)
    props.setUserRole(chosenItem)
    setRoleMenuOpened(!isRoleMenuOpened)
  }

  return (
    <>
      <div
        className={classNames(
          styles.rolePickerBlock,
          isRoleMenuOpened ? styles.rolePickerBlockFocus : undefined,
          props.isPickerDisable ? styles.rolePickerBlockDisable : undefined,
        )}
        onClick={roleMenuToggle}
        title={role}
      >
        <span>{chosenRole || 'Role not selected'}</span>
        <IconWrapper name="arrowDownIcon" color="#2f2e3e" />
      </div>
      {isRoleMenuOpened && (
        <ul className={styles.roleMenu} ref={roleMenuRef}>
          {rolesArr.map(item => {
            return (
              <li
                key={item}
                onClick={() => handleRole(item)}
                className={role === item ? styles.chosenRoleItem : undefined}
              >
                {item}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default React.memo(RolePicker)
