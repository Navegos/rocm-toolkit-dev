import * as core from '@actions/core';
import { OSType, getOs } from './platform.js';
import { exec } from '@actions/exec';
import { execReturnOutput } from './run-command.js';
import { CPUArch, getArch } from './arch.js';
import { LinuxLinks } from './links/linux-links.js';
function verifyLinuxVersion(version) {
    const linuxLinks = LinuxLinks.Instance;
    const availableVersions = linuxLinks.getAvailableLocalRocmVersions();
    if (!availableVersions.some(v => v.compare(version) === 0)) {
        throw new Error(`Version not available: ${version}`);
    }
}
export async function useApt(method) {
    return method === 'network' && (await getOs()) === OSType.linux;
}
export async function aptSetup(version) {
    const osType = await getOs();
    const archType = await getArch();
    if (osType !== OSType.linux) {
        throw new Error(`apt setup can only be run on linux runners! Current os type: ${osType}`);
    }
    if (archType !== CPUArch.x86_64) {
        throw new Error(`apt setup can only be run on x86_64 runners! Current arch type: ${archType}`);
    }
    verifyLinuxVersion(version);
    core.debug(`Setup packages for ROCm ${version}`);
    const rocmVersion = version.patch === 0
        ? `${version.major}.${version.minor}`
        : `${version.major}.${version.minor}.${version.patch}`;
    let codename = await execReturnOutput('lsb_release', ['-cs']);
    if (!codename) {
        codename = 'ubuntu';
    }
    const gpgKeyUrl = 'https://repo.radeon.com/rocm/rocm.gpg.key';
    const keyringPath = '/etc/apt/keyrings/rocm.gpg';
    const pinPath = '/etc/apt/preferences.d/rocm-pin-600';
    const listPath = '/etc/apt/sources.list.d/rocm.list';
    const repoUrl = `https://repo.radeon.com/rocm/apt/${rocmVersion}`;
    core.debug(`ROCm version string: ${rocmVersion}`);
    core.debug(`Distribution codename: ${codename}`);
    core.debug(`Keyring path: ${keyringPath}`);
    core.debug(`Repo URL: ${repoUrl}`);
    core.debug('Adding ROCm GPG key');
    await exec('sudo mkdir --parents --mode=0755 /etc/apt/keyrings');
    await exec('bash', [
        '-c',
        `wget -qO - ${gpgKeyUrl} | gpg --yes --dearmor | sudo tee ${keyringPath} > /dev/null`
    ]);
    core.debug('Setting ROCm repository pin priority');
    await exec('bash', [
        '-c',
        String.raw `echo -e "Package: *\nPin: release o=repo.radeon.com\nPin-Priority: 600" | sudo tee ${pinPath} > /dev/null`
    ]);
    core.debug(`Adding ROCm repository`);
    await exec('bash', [
        '-c',
        `echo "deb [arch=amd64 signed-by=${keyringPath}] ${repoUrl} ${codename} main" | sudo tee ${listPath} > /dev/null`
    ]);
    core.debug('Updating apt repository list');
    await exec('sudo apt-get update');
}
export async function aptInstall(version, subPackages = [], nonRocmSubPackages = []) {
    const osType = await getOs();
    const archType = await getArch();
    if (osType !== OSType.linux) {
        throw new Error(`apt install can only be run on linux runners! Current os type: ${osType}`);
    }
    if (archType !== CPUArch.x86_64) {
        throw new Error(`apt install can only be run on x86_64 runners! Current arch type: ${archType}`);
    }
    verifyLinuxVersion(version);
    if (subPackages.length === 0 && nonRocmSubPackages.length === 0) {
        // Install default ROCm development package
        const packageName = 'rocm-dev';
        core.debug(`Install package: ${packageName}`);
        return await exec('sudo apt-get -y install', [packageName]);
    }
    else {
        // Only install specified packages
        const prefixedSubPackages = subPackages.map(subPackage => subPackage.startsWith('rocm-') ? subPackage : `rocm-${subPackage}`);
        const allPackages = prefixedSubPackages.concat(nonRocmSubPackages);
        core.debug(`Only install subpackages: ${allPackages.join(' ')}`);
        return await exec('sudo apt-get -y install', allPackages);
    }
}
