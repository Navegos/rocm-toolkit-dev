import { AbstractLinks } from './links.js';
import { CPUArch, getArch } from '../arch.js';
/**
 * Singleton class for linux links.
 */
export class LinuxLinks extends AbstractLinks {
    // Singleton instance
    static _instance;
    // Private constructor to prevent instantiation
    constructor() {
        super();
        // Map of Rocm SemVer version to apt repository URL
        this.rocmVersionToURL = new Map([
            ['7.2.4', 'https://repo.radeon.com/rocm/apt/7.2.4'],
            ['7.2.3', 'https://repo.radeon.com/rocm/apt/7.2.3'],
            ['7.2.2', 'https://repo.radeon.com/rocm/apt/7.2.2'],
            ['7.2.1', 'https://repo.radeon.com/rocm/apt/7.2.1'],
            ['7.2.0', 'https://repo.radeon.com/rocm/apt/7.2'],
            ['7.1.1', 'https://repo.radeon.com/rocm/apt/7.1.1'],
            ['7.1.0', 'https://repo.radeon.com/rocm/apt/7.1'],
            ['7.0.3', 'https://repo.radeon.com/rocm/apt/7.0.3'],
            ['7.0.2', 'https://repo.radeon.com/rocm/apt/7.0.2'],
            ['7.0.1', 'https://repo.radeon.com/rocm/apt/7.0.1'],
            ['7.0.0', 'https://repo.radeon.com/rocm/apt/7.0'],
            ['6.4.4', 'https://repo.radeon.com/rocm/apt/6.4.4'],
            ['6.4.3', 'https://repo.radeon.com/rocm/apt/6.4.3'],
            ['6.4.2', 'https://repo.radeon.com/rocm/apt/6.4.2'],
            ['6.4.1', 'https://repo.radeon.com/rocm/apt/6.4.1'],
            ['6.4.0', 'https://repo.radeon.com/rocm/apt/6.4'],
            ['6.3.4', 'https://repo.radeon.com/rocm/apt/6.3.4'],
            ['6.3.3', 'https://repo.radeon.com/rocm/apt/6.3.3'],
            ['6.3.2', 'https://repo.radeon.com/rocm/apt/6.3.2'],
            ['6.3.1', 'https://repo.radeon.com/rocm/apt/6.3.1'],
            ['6.3.0', 'https://repo.radeon.com/rocm/apt/6.3'],
            ['6.2.4', 'https://repo.radeon.com/rocm/apt/6.2.4'],
            ['6.2.3', 'https://repo.radeon.com/rocm/apt/6.2.3'],
            ['6.2.2', 'https://repo.radeon.com/rocm/apt/6.2.2'],
            ['6.2.1', 'https://repo.radeon.com/rocm/apt/6.2.1'],
            ['6.2.0', 'https://repo.radeon.com/rocm/apt/6.2'],
            ['6.1.5', 'https://repo.radeon.com/rocm/apt/6.1.5'],
            ['6.1.4', 'https://repo.radeon.com/rocm/apt/6.1.4'],
            ['6.1.3', 'https://repo.radeon.com/rocm/apt/6.1.3'],
            ['6.1.2', 'https://repo.radeon.com/rocm/apt/6.1.2'],
            ['6.1.1', 'https://repo.radeon.com/rocm/apt/6.1.1'],
            ['6.1.0', 'https://repo.radeon.com/rocm/apt/6.1'],
            ['6.0.3', 'https://repo.radeon.com/rocm/apt/6.0.3'],
            ['6.0.2', 'https://repo.radeon.com/rocm/apt/6.0.2'],
            ['6.0.1', 'https://repo.radeon.com/rocm/apt/6.0.1'],
            ['6.0.0', 'https://repo.radeon.com/rocm/apt/6.0'],
            ['5.7.3', 'https://repo.radeon.com/rocm/apt/5.7.3'],
            ['5.7.2', 'https://repo.radeon.com/rocm/apt/5.7.2'],
            ['5.7.1', 'https://repo.radeon.com/rocm/apt/5.7.1'],
            ['5.7.0', 'https://repo.radeon.com/rocm/apt/5.7'],
            ['5.6.1', 'https://repo.radeon.com/rocm/apt/5.6.1'],
            ['5.6.0', 'https://repo.radeon.com/rocm/apt/5.6'],
            ['5.5.3', 'https://repo.radeon.com/rocm/apt/5.5.3'],
            ['5.5.2', 'https://repo.radeon.com/rocm/apt/5.5.2'],
            ['5.5.1', 'https://repo.radeon.com/rocm/apt/5.5.1'],
            ['5.5.0', 'https://repo.radeon.com/rocm/apt/5.5']
        ]);
    }
    async getLocalURLFromRocmVersion(version) {
        const link = await super.getLocalURLFromRocmVersion(version);
        const arch = await getArch();
        if (arch === CPUArch.x86_64) {
            return new URL(link.toString());
        }
        else {
            throw new Error(`Link only available for x86_64: ${arch}`);
        }
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
