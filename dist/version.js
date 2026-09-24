import * as core from '@actions/core';
import { OSType, getOs } from './platform.js';
import { SemVer } from 'semver';
import { getLinks } from './links/get-links.js';
// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(versionString, method) {
    const version = new SemVer(versionString);
    const links = await getLinks();
    let versions;
    switch (method) {
        case 'local':
            versions = links.getAvailableLocalRocmVersions();
            break;
        case 'network':
            switch (await getOs()) {
                case OSType.linux:
                    // TODO adapt this to actual available network versions for linux
                    versions = links.getAvailableLocalRocmVersions();
                    break;
                case OSType.windows:
                    versions = links.getAvailableNetworkRocmVersions();
                    break;
            }
    }
    core.debug(`Available versions: ${versions}`);
    if (versions.some(v => v.compare(version) === 0)) {
        core.debug(`Version available: ${version}`);
        return version;
    }
    else {
        core.debug(`Version not available error!`);
        throw new Error(`Version not available: ${version}`);
    }
}
