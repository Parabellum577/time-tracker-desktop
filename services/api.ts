import * as user from './microservices/user'
import * as project from './microservices/project'
import * as planning from './microservices/planning'
import * as tracker from './microservices/tracker'
import * as productivity from './microservices/productivity'
import * as screenshot from './microservices/screenshot'
import * as invoice from './microservices/invoice'

const api = {
  user,
  project,
  planning,
  tracker,
  productivity,
  screenshot,
  invoice
}

export default api
