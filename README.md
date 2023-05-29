# Builds

- Dev:
  [Windows](https://tgmsdev.qarea.org/distribution/win32/v3/timetrackerDev%20Setup%201.9.33.exe)
  [Linux](https://tgmsdev.qarea.org/distribution/linux/v3/timetrackerdev_1.9.33_amd64.deb)
  [macOS](https://tgmsdev.qarea.org/distribution/darwin/v3/timetrackerDev-1.9.33.pkg)

- Staging:
  [Windows](https://tgms-staging.qarea.org/distribution/win32/v3/timetrackerStaging%20Setup%201.9.33.exe)
  [Linux](https://tgms-staging.qarea.org/distribution/linux/v3/timetrackerstaging_1.9.33_amd64.deb)
  [macOS](https://tgms-staging.qarea.org/distribution/darwin/v3/timetrackerStaging-1.9.33.pkg)

- Prod:
  [Windows](https://web.timetracker.com/distribution/win32/v3/timetracker%20Setup%201.9.33.exe)
  [Linux](https://web.timetracker.com/distribution/linux/v3/timetracker_1.9.33_amd64.deb)
  [macOS](https://web.timetracker.com/distribution/darwin/v3/timetracker-1.9.33.pkg)

## Branches

- `dev` => development
- `master` => production

### Install C++ to JS compiler(Ruby, Python, build tools)

##### Windows(admin):

`npm install --global --production windows-build-tools`
[Fixing Node-Gyp Issues on Windows](https://spin.atomicobject.com/2019/03/27/node-gyp-windows/)

##### MacOS:

`Xcode 9/10`

### Install node-gyp for rebuild C/C++ modules

`sudo npm install -g node-gyp`

### Install npm modules

`yarn`

### Prepare electron-builder (Linux only)

```bash
sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils libxext-dev libxss-dev g++ libxss-dev pkg-config
```

## Running Application

Run command in console `yarn run dev`
