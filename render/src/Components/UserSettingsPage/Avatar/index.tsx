import * as React from 'react'
import * as AvatarEditor from 'react-avatar-editor'
import * as alertActions from '@store/alerts/actions'

import useShallowEqualSelector from '@services/useShallowEqualSelector'
import IconWrapper from '@components/IconWrapper'
import Slider from 'rc-slider'

import { sendAvatar } from '@services/microservices/avatar'
import { useDispatch } from 'react-redux'

const styles = require('./styles.module.scss')

interface IOwnProps {
  updateUser: any
}

interface IImageResolution {
  width: number
  height: number
}

const sliderScaleStep = 0.1

const validResolution: IImageResolution = {
  width: 200,
  height: 200,
}

const Avatar: React.FC<IOwnProps> = props => {
  const dispatch = useDispatch()
  const userInfo = useShallowEqualSelector(state => state.user.currentUser)
  const inputFileRefEl: React.Ref<HTMLInputElement> = React.useRef(null)
  const editorRef: React.Ref<any> = React.useRef(null)

  const [imageDataUrl, setImageDataUrl] = React.useState('')
  const [imageInEditorScale, setImageInEditorScale] = React.useState(1)
  const [isAvatarHover, setAvatarHover] = React.useState(false)

  const showAlert = React.useCallback(
    data => {
      const action = alertActions.showAlertMessage.request(data)
      dispatch(action)
    },
    [dispatch],
  )

  const setAvatarImage = async () => {
    try {
      const canvas = editorRef.current.getImageScaledToCanvas().toDataURL()

      await sendAvatar(userInfo.UserID, canvas).then(() => {
        props.updateUser({ ...userInfo, Avatar: canvas })
      })

      resetImgDataAndClose()

      showAlert({ alertType: 'success', alertMessage: 'Avatar updated' })
    } catch (error) {
      console.error(error)
      showAlert({ alertType: 'error', alertMessage: error.message })
    }
  }

  const openBrowseFiles = () => {
    inputFileRefEl.current.click()
  }

  const getImageFromInput = () => {
    const reader = new FileReader()
    const selectImage = inputFileRefEl.current.files[0]

    reader.readAsDataURL(selectImage)

    reader.onload = (e: ProgressEvent) => {
      const { result }: any = e.srcElement
      const img = new Image()

      img.src = result

      img.onload = () => {
        const imgResolution: IImageResolution = {
          width: img.width,
          height: img.height,
        }

        const validatedImage = validateSelectImage(selectImage, imgResolution)

        if (!validatedImage) {
          resetImgDataAndClose()
        } else {
          setImageDataUrl(result)
        }
      }
    }
  }

  const validateSelectImage = (img: File, imgProperties: IImageResolution) => {
    const unsupportedTypes = ['ico', 'x-icon', 'vnd.microsoft.icon', 'svg+xml']
    const ONE_MB_IN_BYTES = 1048576
    const MAX_IMAGE_FILE_SIZE = ONE_MB_IN_BYTES * 2

    if (!img) {
      return
    }

    if (!/^image\/.+/.test(img.type) || unsupportedTypes.includes(img.type.slice(6))) {
      showAlert({ alertType: 'error', alertMessage: 'Unsupported file type' })
      return
    } else if (img.size > MAX_IMAGE_FILE_SIZE) {
      showAlert({ alertType: 'error', alertMessage: 'Max image size is 2mb' })
      return
    } else if (imgProperties.width < validResolution.width && imgProperties.height < validResolution.height) {
      showAlert({
        alertType: 'error',
        alertMessage: 'Unsupported resolution less than ' + validResolution.width + 'x' + validResolution.height,
      })
      return
    } else {
      return img
    }
  }

  const resetImgDataAndClose = () => {
    inputFileRefEl.current.value = ''
    setImageDataUrl('')
  }

  const handleImageInEditorScaleOnWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      setImageInEditorScale(Math.max(1, imageInEditorScale - sliderScaleStep))
    } else {
      setImageInEditorScale(Math.min(5, imageInEditorScale + sliderScaleStep))
    }
  }

  const handleImageInEditor = (newScale: number) => {
    setImageInEditorScale(newScale)
  }

  const toggleAvatarHover = () => {
    setAvatarHover(!isAvatarHover)
  }

  return (
    <>
      <div
        className={styles.avatarBlock}
        onClick={openBrowseFiles}
        onMouseEnter={toggleAvatarHover}
        onMouseLeave={toggleAvatarHover}
      >
        <input
          type="file"
          title="Сlick to select your avatar"
          accept="image/*"
          ref={inputFileRefEl}
          onChange={getImageFromInput}
        />
        <img src={userInfo.Avatar} alt="User Avatar" />
        {isAvatarHover && <IconWrapper name="edit" classes={styles.iconEdit} />}
      </div>
      {imageDataUrl && (
        <div className={styles.avatarEditPopup}>
          <div className={styles.avatarEditHead}>
            <span>Avatar</span>
            <IconWrapper classes={styles.closeIcon} name="clear" onClick={resetImgDataAndClose} />
          </div>
          <div onWheel={handleImageInEditorScaleOnWheel}>
            <AvatarEditor
              ref={editorRef}
              image={imageDataUrl}
              width={333}
              height={330}
              border={50}
              borderRadius={165}
              scale={imageInEditorScale}
            />
          </div>
          <div className={styles.avatarEditFooter}>
            <button className={styles.btnSave} onClick={setAvatarImage}>
              Save
            </button>
            <div className={styles.sliderWrap}>
              <Slider
                min={1}
                max={5}
                value={imageInEditorScale}
                step={sliderScaleStep}
                onChange={handleImageInEditor}
                trackStyle={{ height: '6px', background: '#1991eb' }}
                railStyle={{ height: '6px', background: '#d8dce3' }}
                handleStyle={{
                  height: '20px',
                  width: '20px',
                  background: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0 7px 20px 0 #222328',
                  border: '0',
                  marginTop: '-8px',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default React.memo(Avatar)
