import {SemVer} from 'semver'

// Interface for getting Rocm versions and corresponding download URLs
export abstract class AbstractLinks {
  protected rocmVersionToURL: Map<string, string> = new Map()

  getAvailableLocalRocmVersions(): SemVer[] {
    return Array.from(this.rocmVersionToURL.keys()).map(s => new SemVer(s))
  }

  async getLocalURLFromRocmVersion(version: SemVer): Promise<URL> {
    const urlString = this.rocmVersionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }
}
