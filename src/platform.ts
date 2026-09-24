import {debug} from '@actions/core'
import {getArch} from './arch.js'
export {getArch, CPUArch} from './arch.js'
import os from 'node:os'

export enum OSType {
  windows = 'windows',
  linux = 'linux'
}

export async function getOs(): Promise<OSType> {
  await getArch()
  const osPlatform = os.platform()
  switch (osPlatform) {
    case 'win32':
      return OSType.windows
    case 'linux':
      return OSType.linux
    default:
      debug(`Unsupported OS: ${osPlatform}`)
      throw new Error(
        `Unsupported OS: ${osPlatform}. Only Windows and Linux are supported.`
      )
  }
}

export async function getRelease(): Promise<string> {
  return os.release()
}
