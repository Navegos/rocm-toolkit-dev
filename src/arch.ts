import {debug} from '@actions/core'
import os from 'node:os'

export enum CPUArch {
  x86_64 = 'x64'
}

export async function getArch(): Promise<CPUArch> {
  const arch = os.arch()
  switch (arch) {
    case 'x64':
      return CPUArch.x86_64
    default:
      debug(`Unsupported architecture: ${arch}`)
      throw new Error(
        `Unsupported architecture: ${arch}. Only x86_64 its supported.`
      )
  }
}
