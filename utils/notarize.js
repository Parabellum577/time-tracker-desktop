const notarize = require('electron-notarize').notarize

module.exports = async context => {
  const { electronPlatformName } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  try {
    const package = require('../package.json')
    if (!('build' in package)) {
      throw `Build field in package.json are required.
              Read for more details: https://www.electron.build/#quick-setup-guide`
    }

    if (!('appId' in package.build)) {
      throw `appId field in package.json are required. This is string like: com.company.product.
              Read for more details: https://www.electron.build/configuration/configuration#configuration`
    }

    if (!('productName' in package.build)) {
      throw `productName field in package.json are required.
              Read for more details: https://www.electron.build/configuration/configuration#configuration`
    }

    await notarize({
      // com.company.product
      appBundleId: package.build.appId,
      appPath: `${context.appOutDir}/${package.build.productName}.app`,
      // Sensitive information!
      // <email>@<domain>
      appleId: process.env.APPLE_ID,
      // Sensitive information!
      // Generate password on https://appleid.apple.com/
      // XXXX-XXXX-XXXX-XXXX
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    })
    console.log('Success notarize')
  } catch (err) {
    console.log(err)
  }
}
