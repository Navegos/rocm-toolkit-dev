import * as core from '@actions/core';
import * as path from 'node:path';
import { OSType, getOs } from './platform.js';
export async function updatePath(version) {
    const osType = await getOs();
    let rocmPath;
    switch (osType) {
        case OSType.linux:
            // Standard installation directory structure for versioned AMD ROCm on Linux
            rocmPath = `/opt/rocm-${version.major}.${version.minor}`;
            break;
        case OSType.windows:
            // Default AMD path layout convention on Windows systems
            rocmPath = `C:\\Program Files\\AMD\\ROCm\\${version.major}.${version.minor}`;
            break;
        default:
            throw new Error('Unsupported operating system detected for ROCm setup');
    }
    core.debug(`ROCm path resolved to: ${rocmPath}`);
    const versionMajorMinor = `${version.major}_${version.minor}`;
    const versionFull = `${version.major}_${version.minor}_${version.patch}`;
    if (osType === OSType.windows) {
        core.exportVariable('HIP_PATH', rocmPath);
        core.exportVariable(`HIP_PATH_${versionMajorMinor}`, rocmPath);
        core.exportVariable(`HIP_PATH_${versionFull}`, rocmPath);
    }
    else {
        core.exportVariable('ROCM_PATH', rocmPath);
        core.exportVariable(`ROCM_PATH_${versionMajorMinor}`, rocmPath);
        core.exportVariable(`ROCM_PATH_${versionFull}`, rocmPath);
    }
    // Append ROCm binaries location to standard system execution path
    const binPath = path.join(rocmPath, 'bin');
    core.debug(`Adding binaries folder to PATH: ${binPath}`);
    core.addPath(binPath);
    // Manage Linux specific dynamic runtime linker setups
    if (osType === OSType.linux) {
        // Get LD_LIBRARY_PATH
        const environment = globalThis.process;
        const libPath = environment?.env?.LD_LIBRARY_PATH ?? '';
        // Crucial ROCm divergence: ROCm packages shared object files inside
        // a root 'lib/' folder layout instead of the standard CUDA 'lib64/' directory.
        const rocmLibPath = path.join(rocmPath, 'lib');
        // Add path reference array checks to protect against duplicate definitions
        if (!libPath.split(':').includes(rocmLibPath)) {
            core.debug(`Appending tracking context to LD_LIBRARY_PATH: ${rocmLibPath}`);
            core.exportVariable('LD_LIBRARY_PATH', libPath ? `${rocmLibPath}${path.delimiter}${libPath}` : rocmLibPath);
        }
    }
    return rocmPath;
}
