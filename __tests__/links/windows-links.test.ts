import {AbstractLinks} from '../../src/links/links'
import {SemVer} from 'semver'
import {WindowsLinks} from '../../src/links/windows-links'

test.concurrent('Windows Rocm versions in descending order', async () => {
  const wLinks: AbstractLinks = WindowsLinks.Instance
  const versions = wLinks.getAvailableLocalRocmVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test.concurrent(
  'Windows Rocm version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableLocalRocmVersions()) {
      const url =
        await WindowsLinks.Instance.getLocalURLFromRocmVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent('There is at least windows 1 version url pair', async () => {
  expect(
    WindowsLinks.Instance.getAvailableLocalRocmVersions().length
  ).toBeGreaterThanOrEqual(1)
})

test.concurrent(
  'Windows Rocm network versions in descending order',
  async () => {
    const wLinks = WindowsLinks.Instance
    const versions = wLinks.getAvailableNetworkRocmVersions()
    for (let i = 0; i < versions.length - 1; i++) {
      const versionA: SemVer = versions[i]
      const versionB: SemVer = versions[i + 1]
      expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
    }
  }
)

test.concurrent(
  'Windows network Rocm version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableNetworkRocmVersions()) {
      const url: URL =
        await WindowsLinks.Instance.getNetworkURLFromRocmVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent(
  'There is at least windows network 1 version url pair',
  async () => {
    expect(
      WindowsLinks.Instance.getAvailableNetworkRocmVersions().length
    ).toBeGreaterThanOrEqual(1)
  }
)
