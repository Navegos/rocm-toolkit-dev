import * as core from '@actions/core';
import { parseMethod } from './method.js';
import { OSType, getOs } from './platform.js';
import { aptInstall, aptSetup, useApt } from './apt-installer.js';
import { download } from './downloader.js';
import { getVersion } from './version.js';
import { install } from './installer.js';
import { updatePath } from './update-path.js';
import { parsePackages } from './parser.js';
async function run() {
    try {
        // Only Windows and Linux on x86_64 are supported
        const osType = await getOs();
        const rocm = core.getInput('rocm');
        core.debug(`Desired Rocm version: ${rocm}`);
        const subPackagesArgName = 'sub-packages';
        const subPackages = core.getInput(subPackagesArgName);
        core.debug(`Desired subPackages: ${subPackages}`);
        const nonRocmSubPackagesArgName = 'non-rocm-sub-packages';
        const nonRocmSubPackages = core.getInput(nonRocmSubPackagesArgName);
        core.debug(`Desired nonRocmsubPackages: ${nonRocmSubPackages}`);
        const methodString = core.getInput('method');
        core.debug(`Desired method: ${methodString}`);
        const linuxLocalArgs = core.getInput('linux-local-args');
        core.debug(`Desired local linux args: ${linuxLocalArgs}`);
        const useGitHubCache = core.getBooleanInput('use-github-cache');
        core.debug(`Desired GitHub cache usage: ${useGitHubCache}`);
        const useLocalCache = core.getBooleanInput('use-local-cache');
        core.debug(`Desired local cache usage: ${useLocalCache}`);
        const logFileSuffix = core.getInput('log-file-suffix');
        core.debug(`Desired log file suffix: ${logFileSuffix}`);
        // Parse subPackages array
        const subPackagesArray = await parsePackages(subPackages, subPackagesArgName);
        // Parse nonRocmSubPackages array
        const nonRocmSubPackagesArray = await parsePackages(nonRocmSubPackages, nonRocmSubPackagesArgName);
        // Parse method
        const methodParsed = parseMethod(methodString);
        core.debug(`Parsed method: ${methodParsed}`);
        // Parse version string
        const version = await getVersion(rocm, methodParsed);
        // Parse linuxLocalArgs array
        let linuxLocalArgsArray = [];
        try {
            linuxLocalArgsArray = JSON.parse(linuxLocalArgs);
        }
        catch (error) {
            core.debug(`Json parsing error: ${error}`);
            const errString = `Error parsing input 'linux-local-args' to a JSON string array: ${linuxLocalArgs}`;
            core.debug(errString);
            throw new Error(errString);
        }
        // Check if subPackages are specified in 'local' method on Linux
        if (methodParsed === 'local' &&
            subPackagesArray.length > 0 &&
            (await getOs()) === OSType.linux) {
            throw new Error(`Subpackages on 'local' method is not supported on Linux, use 'network' instead`);
        }
        // Linux only installs using the apt AMD repo
        const useAptInstall = await useApt(methodParsed);
        if (useAptInstall || osType === OSType.linux) {
            // Setup aptitude repos
            await aptSetup(version);
            // Install packages
            const installResult = await aptInstall(version, subPackagesArray, nonRocmSubPackagesArray);
            core.debug(`Install result: ${installResult}`);
        }
        else if (osType === OSType.windows) {
            // Windows downloads the exe binaries and installs
            const executablePath = await download(version, methodParsed, useLocalCache, useGitHubCache);
            await install(executablePath, version, subPackagesArray, linuxLocalArgsArray, methodString, logFileSuffix);
        }
        else {
            throw new Error(`Install packeages only suuported in wonws or linux, current os, got '${osType}'`);
        }
        // Add Rocm environment variables to GitHub environment variables
        const rocmPath = await updatePath(version);
        // Set output variables
        core.setOutput('rocm', rocm);
        if (osType === OSType.windows) {
            core.setOutput('HIP_PATH', rocmPath);
        }
        else {
            core.setOutput('ROCM_PATH', rocmPath);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
        }
        else {
            core.setFailed('Unknown error');
        }
    }
}
await run();
