'use strict'

const builder = require('electron-builder')
const { Platform, Arch } = builder
const name = process.env.BUILD_NAME || process.env.npm_package_name
const productName = process.env.BUILD_PRODUCT_NAME || process.env.npm_package_productName

const config = {
  appId: `com.qarea.${name}`,
  productName: `${productName}`,
  afterSign: './notarize-app.js',
  afterAllArtifactBuild: './utils/createBuildInfo.js',
  forceCodeSigning: false,
  protocols: {
    name: `${productName}`,
    schemes: [`${name}`],
  },
  directories: {
    buildResources: './',
    output: './dist/appInstaller',
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    include: 'scripts/installer.nsh',
    license: 'LICENSE.txt',
  },
  win: {
    publish: {
      provider: 'generic',
      url: 'http://need_for_latest.yml',
    },
    verifyUpdateCodeSignature: false,
    icon: 'images/icon1024.ico',
  },
  mac: {
    category: 'tracker',
    publish: {
      provider: 'generic',
      url: 'http://need_for_latest.yml',
    },
    hardenedRuntime: true,
    entitlementsInherit: 'scripts/entitlements.mac.plist',
    entitlements: 'scripts/entitlements.mac.plist',
    gatekeeperAssess: false,
    icon: 'images/icon1024.png',
  },
  dmg: {
    title: `${productName}`,
    icon: 'images/icon1024.png',
    background: 'images/background.png',
    contents: [
      {
        x: 130,
        y: 120,
      },
      {
        x: 410,
        y: 120,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  pkg: {
    license: 'LICENSE.txt',
  },
  linux: {
    icon: 'images/icon1024.icns',
    publish: {
      provider: 'generic',
      url: 'http://need_for_latest.yml',
    },
    category: 'Office',
    description: `${productName}, app for help planning your day`,
    desktop: {
      MimeType: `application/${productName};x-scheme-handler/${name}`,
    },
  },
  files: [
    '!*.js.map',
    'build-electron-main/**/*',
    'build-render/**/*',
    'electron-main/devtools/**/*',
    'images/**/*',
    'LICENSE.txt',
    'notifications.html',
    'services/tray/tray.html',
    'chat.html',
    'notifications/**/*',
    'help-instructions/**/*',
    'screen-window/**/*',
    'package.json',
    'scripts/*.nsh',
    'scripts/*.tpl',
  ],
}

const build = async targets => {
  await builder.build({
    config,
    targets,
  })
}

const TARGET_BUILDERS = {
  linux: Platform.LINUX,
  win32: Platform.WINDOWS,
  darwin: Platform.MAC,
}

const targetBuilder = TARGET_BUILDERS[process.platform]

if (!targetBuilder) {
  console.error('Unable to find target builder for this platform')
  process.exit(1)
}

const target = process.env.TARGET_PACKAGE
const arches = process.env.TARGET_ARCH === 'ia32' ? [Arch.ia32, Arch.x64] : [Arch.x64]

build(targetBuilder.createTarget(target === 'dmg' ? ['dmg', 'zip'] : target, ...arches))
