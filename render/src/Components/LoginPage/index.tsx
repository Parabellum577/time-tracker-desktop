import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import SignIn from './SignIn'
import SignUp from './SignUp'
import ForgotPass from './ForgotPassword'

const LoginPage = () => (
  <section>
    <Switch>
      <Redirect exact={true} from="/login" to="/login/signin" />
      <Route path="/login/signin" component={SignIn} />
      <Route path="/login/signup" component={SignUp} />
      <Route path="/login/recovery" component={ForgotPass} />
    </Switch>
  </section>
)

export default React.memo(LoginPage)
