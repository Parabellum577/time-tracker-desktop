// TODO: handle SENTRY_KEY
module.exports = {
  production: {
    API_URL: 'https://web.test.com',
    REDIRECT_URL: 'https://web.test.com',
    WSS_URL: 'wss://web.test.com',
    SENTRY_KEY: 'https://924b0b78ec844eedae1c2eefaecbdd94@tgms-sentry.qarea.org/13',
    PROTOCOL: 'test',
  },
  development: {
    API_URL: 'https://dev-api.test.com',
    REDIRECT_URL: 'https://tgmsdev.qarea.org',
    WSS_URL: 'wss://dev-api.test.com',
    SENTRY_KEY: 'https://924b0b78ec844eedae1c2eefaecbdd94@tgms-sentry.qarea.org/13',
    PROTOCOL: 'dev',
  },
  docker: {
    API_URL: 'https://df-docker.qarea.org',
    REDIRECT_URL: 'https://df-docker.qarea.org',
    WSS_URL: 'wss://docker.qarea.org',
    SENTRY_KEY: 'https://924b0b78ec844eedae1c2eefaecbdd94@tgms-sentry.qarea.org/13',
    PROTOCOL: 'test',
  },
  staging: {
    API_URL: 'https://staging-api.test.com',
    REDIRECT_URL: 'https://tgms-staging.qarea.org',
    WSS_URL: 'wss://staging-api.test.com',
    SENTRY_KEY: 'https://924b0b78ec844eedae1c2eefaecbdd94@tgms-sentry.qarea.org/13',
    PROTOCOL: 'staging',
  },
  local: {
    API_URL: 'https://dev-api.test.com',
    REDIRECT_URL: 'https://tgmsdev.qarea.org',
    WSS_URL: 'wss://dev-api.test.com',
    SENTRY_KEY: 'https://924b0b78ec844eedae1c2eefaecbdd94@tgms-sentry.qarea.org/13',
    PROTOCOL: 'testing',
  },
}
