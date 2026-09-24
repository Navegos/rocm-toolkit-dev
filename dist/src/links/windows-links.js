import { AbstractLinks } from './links.js';
import { SemVer } from 'semver';
import { CPUArch, getArch } from '../arch.js';
/**
 * Singleton class for windows links.
 */
export class WindowsLinks extends AbstractLinks {
    // Singleton instance
    static _instance;
    rocmVersionToNetworkUrl = new Map([
        [
            '7.2.0',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-26.Q3-Win11-For-HIP.exe'
        ],
        [
            '7.1.1',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-26.Q1-Win11-For-HIP.exe'
        ],
        [
            '6.4.2',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-25.Q3-Win10-Win11-For-HIP.exe'
        ],
        [
            '6.2.4',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-24.Q4-Win10-Win11-For-HIP.exe'
        ],
        [
            '6.1.2',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-24.Q3-Win10-Win11-For-HIP.exe'
        ],
        [
            '5.7.1',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-23.Q4-Win10-Win11-For-HIP.exe'
        ],
        [
            '5.5.1',
            'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-23.Q3-Win10-Win11-For-HIP.exe'
        ]
    ]);
    // Private constructor to prevent instantiation
    constructor() {
        super();
        // Map of Rocm SemVer version to download URL
        this.rocmVersionToURL = new Map([
            [
                '7.2.0',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-26.Q3-Win11-For-HIP.exe'
            ],
            [
                '7.1.1',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-26.Q1-Win11-For-HIP.exe'
            ],
            [
                '6.4.2',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-25.Q3-Win10-Win11-For-HIP.exe'
            ],
            [
                '6.2.4',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-24.Q4-Win10-Win11-For-HIP.exe'
            ],
            [
                '6.1.2',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-24.Q3-Win10-Win11-For-HIP.exe'
            ],
            [
                '5.7.1',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-23.Q4-Win10-Win11-For-HIP.exe'
            ],
            [
                '5.5.1',
                'https://download.amd.com/developer/eula/rocm-hub/AMD-Software-PRO-Edition-23.Q3-Win10-Win11-For-HIP.exe'
            ]
        ]);
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
    getAvailableNetworkRocmVersions() {
        return Array.from(this.rocmVersionToNetworkUrl.keys()).map(s => new SemVer(s));
    }
    async getLocalURLFromRocmVersion(version) {
        const link = await super.getLocalURLFromRocmVersion(version);
        return await this.urlForCurrentArch(link, version);
    }
    async getNetworkURLFromRocmVersion(version) {
        const urlString = this.rocmVersionToNetworkUrl.get(`${version}`);
        if (urlString === undefined) {
            throw new Error(`Invalid version: ${version}`);
        }
        return await this.urlForCurrentArch(new URL(urlString), version);
    }
    /**
     * Patch a x86_64 URL to its arm64 counterpart on arm hosts (based on the version, 13.4.1+)
     */
    async urlForCurrentArch(url, version) {
        const arch = await getArch();
        if (arch !== CPUArch.x86_64) {
            throw new Error(`Link only available for x86_64: ${arch}. Version ${version}`);
        }
        return url;
        /* // gate older versions that don't have arm64 installers
        if (version.compare(WindowsLinks.firstArm64Version) < 0) {
          throw new Error(
            `Rocm ${version} does not provide a Windows arm64 installer (arm64 builds are available from ${WindowsLinks.firstArm64Version})`
          )
        }
        const x86Marker = '_windows_x86_64'
        const urlString = url.toString()
        if (!urlString.includes(x86Marker)) {
          throw new Error(
            `Cannot derive Windows arm64 installer URL for Rocm ${version} from ${urlString}`
          )
        }
        return new URL(urlString.replace(x86Marker, '_windows_arm64')) */
    }
}
