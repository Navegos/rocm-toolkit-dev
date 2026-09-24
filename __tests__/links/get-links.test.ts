import {LinuxLinks} from '../../src/links/linux-links'
import {WindowsLinks} from '../../src/links/windows-links'
import {getLinks} from '../../src/links/get-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  try {
    const links = await getLinks()
    expect(
      links instanceof LinuxLinks || links instanceof WindowsLinks
    ).toBeTruthy()
  } catch (error) {
    // Other OS
  }
})

test.concurrent(
  'getLinks returns available versions for platforms',
  async () => {
    const linuxLinks = LinuxLinks.Instance.getAvailableLocalRocmVersions()
    const windowsLinks = WindowsLinks.Instance.getAvailableLocalRocmVersions()
    const windowsNetworkLinks =
      WindowsLinks.Instance.getAvailableNetworkRocmVersions()

    expect(linuxLinks.length).toBe(46)
    expect(windowsLinks.length).toBe(7)
    expect(windowsLinks.length).toBe(windowsNetworkLinks.length)
    expect(windowsLinks).toEqual(windowsNetworkLinks)
  }
)
