import { debug } from '@actions/core';
import { getArch } from './arch.js';
export { getArch, CPUArch } from './arch.js';
import os from 'node:os';
export var OSType;
(function (OSType) {
    OSType["windows"] = "windows";
    OSType["linux"] = "linux";
})(OSType || (OSType = {}));
export async function getOs() {
    await getArch();
    const osPlatform = os.platform();
    switch (osPlatform) {
        case 'win32':
            return OSType.windows;
        case 'linux':
            return OSType.linux;
        default:
            debug(`Unsupported OS: ${osPlatform}`);
            throw new Error(`Unsupported OS: ${osPlatform}. Only Windows and Linux are supported.`);
    }
}
export async function getRelease() {
    return os.release();
}
