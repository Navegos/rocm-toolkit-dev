import {Method} from '../src/method'
import {SemVer} from 'semver'
import {getVersion} from '../src/version'
import {expect, test} from '@jest/globals'

test.concurrent.each<Method>(['local', 'network'])(
  'Successfully parse correct version for method %s',
  async method => {
    const versionString = '5.5.1'
    try {
      const version = await getVersion(versionString, method)
      expect(version).toBeInstanceOf(SemVer)
      expect(version.compare(new SemVer(versionString))).toBe(0)
    } catch {
      // Other OS
    }
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on invalid version string for method %s',
  async method => {
    const versionString =
      'invalid version string that does not conform to semver'
    await expect(getVersion(versionString, method)).rejects.toThrow(
      TypeError(`Invalid Version: ${versionString}`)
    )
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on unavailable version for method %s',
  async method => {
    const versionString = '0.0.1'
    try {
      await expect(getVersion(versionString, method)).rejects.toThrow(
        `Version not available: ${versionString}`
      )
    } catch {
      // Other OS
    }
  }
)
