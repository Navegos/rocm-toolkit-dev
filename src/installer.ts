import artifactClient from '@actions/artifact'
import * as core from '@actions/core'
import {filterReadable} from './fs-utils.js'
import {OSType, getOs, getRelease} from './platform.js'
import {CPUArch, getArch} from './arch.js'
import {SemVer} from 'semver'
import {exec} from '@actions/exec'
import path from 'node:path'
import * as os from 'node:os'
import fs from 'node:fs'
import {WindowsLinks} from './links/windows-links.js'
import {aptSetup, aptInstall} from './apt-installer.js'

export async function install(
  executablePath: string,
  version: SemVer,
  subPackagesArray: string[] = [],
  linuxLocalArgsArray: string[] = [],
  method: string = 'local',
  logFileSuffix: string = ''
): Promise<void> {
  const archType = await getArch()
  if (archType !== CPUArch.x86_64) {
    throw new Error(
      `Unsupported architecture: ${archType}. Only x86_64 is supported.`
    )
  }

  const osType = await getOs()
  if (osType !== OSType.windows && osType !== OSType.linux) {
    throw new Error(
      `Unsupported OS: ${osType}. Only Windows and Linux are supported.`
    )
  }

  // Linux uses apt-installer only
  if (osType === OSType.linux) {
    core.debug(`Installing ROCm ${version} using apt-installer`)
    await aptSetup(version)
    await aptInstall(version, subPackagesArray)
    return
  }

  // Windows: only accepts versions as in WindowsLinks
  const winLinks = WindowsLinks.Instance
  const availableVersions = winLinks.getAvailableLocalRocmVersions()
  if (!availableVersions.some(v => v.compare(version) === 0)) {
    throw new Error(`Version not available: ${version}`)
  }

  const logPath = path.join(os.tmpdir(), 'installer_log.txt')

  // Execution options which contain callback functions for stdout and stderr of install process
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  // Windows uses exe file installer only through PowerShell
  const command = 'powershell'
  const installArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    `$process = Start-Process -FilePath "${executablePath}" -ArgumentList "-install","-log","${logPath}" -NoNewWindow -Wait -PassThru; exit $process.ExitCode`
  ]

  // Run installer
  try {
    core.debug(`Running install executable: ${executablePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.warning(`Error during installation: ${error}`)
    throw error
  } finally {
    // Always upload installation log regardless of error
    const osRelease = await getRelease()
    if (osType === OSType.windows) {
      if (fs.existsSync(logPath)) {
        const artifactName = `rocm-install-${osType}-${osRelease}-${method}-${logFileSuffix || 'log'}`
        try {
          await artifactClient.uploadArtifact(
            artifactName,
            [logPath],
            os.tmpdir()
          )
        } catch (error) {
          core.debug(`Upload artifact error: ${error}`)
        }
      }
    } else if (osType === OSType.linux) {
      const artifactName = `rocm-install-${osType}-${osRelease}-${method}-${logFileSuffix || 'log'}`
      const candidates = ['/var/log/rocm-installer.log']
      const files = await filterReadable(candidates)
      const username = os.userInfo().username
      if (files.length > 0) {
        for (const file of files) {
          await exec(`sudo chmod 644 ${file}`)
          await exec(`sudo chown ${username} ${file}`)
        }
        const rootDirectory = '/var/log'
        try {
          await artifactClient.uploadArtifact(
            artifactName,
            files,
            rootDirectory
          )
        } catch (error) {
          core.debug(`Upload artifact error: ${error}`)
        }
      } else {
        core.debug(`No log file to upload`)
      }
    }
  }
}
