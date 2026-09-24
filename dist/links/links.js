import { SemVer } from 'semver';
// Interface for getting Rocm versions and corresponding download URLs
export class AbstractLinks {
    rocmVersionToURL = new Map();
    getAvailableLocalRocmVersions() {
        return Array.from(this.rocmVersionToURL.keys()).map(s => new SemVer(s));
    }
    async getLocalURLFromRocmVersion(version) {
        const urlString = this.rocmVersionToURL.get(`${version}`);
        if (urlString === undefined) {
            throw new Error(`Invalid version: ${version}`);
        }
        return new URL(urlString);
    }
}
