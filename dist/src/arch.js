import { debug } from '@actions/core';
import os from 'node:os';
export var CPUArch;
(function (CPUArch) {
    CPUArch["x86_64"] = "x64";
})(CPUArch || (CPUArch = {}));
export async function getArch() {
    const arch = os.arch();
    switch (arch) {
        case 'x64':
            return CPUArch.x86_64;
        default:
            debug(`Unsupported architecture: ${arch}`);
            throw new Error(`Unsupported architecture: ${arch}. Only x86_64 its supported.`);
    }
}
