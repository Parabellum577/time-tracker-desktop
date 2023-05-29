import * as React from 'react'
import * as _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { RootAction, IRootState } from '@store/rootReducer'
import { STORAGES } from '@services/helpers'
import * as screenshotActions from '@store/screenshot/actions'
import * as alertActions from '@store/alerts/actions'
import IntegratedStorage from './integrated/integratedStorage'
import NotIntegratedStorage from './notIntegrated/notIntegratedStorage'

const styles = require('./screenshots.module.scss')

const mapStateToProps = (state: IRootState) => ({
  storage: state.screenshots.availableStorage,
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      addStorage: screenshotActions.addScreenshotStorage.request,
      showAlert: alertActions.showAlertMessage.request,
      removeStorage: screenshotActions.deleteScreenshotStorages,
    },
    dispatch,
  )

type IScreenshotsPageProps = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>

class ScreenshotsPage extends React.PureComponent<IScreenshotsPageProps> {
  public render() {
    let notIntegrated
    if (!_.isEmpty(this.props.storage)) {
      notIntegrated = STORAGES.find(storage => storage.type !== this.props.storage.StorageType)
    }
    return (
      <div className={styles.screenshotsMainBlock}>
        <div className={styles.connectStorageHeader}>
          <span>Connect your Private Storage to save Screenshots</span>
        </div>
        {notIntegrated ? (
          <React.Fragment>
            <NotIntegratedStorage storage={notIntegrated} hasConnectedStorage={true} />
            <IntegratedStorage storage={this.props.storage} removeStorage={this.props.removeStorage} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            {STORAGES.map(storage => (
              <NotIntegratedStorage storage={storage} hasConnectedStorage={false} key={`key-${storage.type}`} />
            ))}
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScreenshotsPage)
