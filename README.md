# rocm-toolkit-dev

[![CI](https://github.com/Navegos/rocm-toolkit-dev/actions/workflows/CI.yml/badge.svg)](https://github.com/Navegos/rocm-toolkit-dev/actions/workflows/CI.yml)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-rocm--toolkit--dev-blue?logo=github)](https://github.com/marketplace/actions/rocm-toolkit-dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

GitHub Action to install and configure the [AMD ROCm™](https://rocm.docs.amd.com/en/latest) and HIP SDK on GitHub Actions runners.

The action automatically sets the installation directory in `GITHUB_ENV` (`ROCM_PATH` and `ROCM_PATH_<version>` on Linux; `HIP_PATH` and `HIP_PATH_<version>` on Windows) and prepends the compiler `bin` directory to `GITHUB_PATH` so tools such as `hipcc` and `clang` are immediately available in subsequent workflow steps.

---

## Supported Platforms & Architectures

| OS          | Supported Runner Images                               | Architecture          |
| ----------- | ----------------------------------------------------- | --------------------- |
| **Linux**   | `ubuntu-26.04`, `ubuntu-24.04`, `ubuntu-22.04`        | `x86_64` (`x64`) only |
| **Windows** | `windows-2025-vs2026`, `windows-2025`, `windows-2022` | `x86_64` (`x64`) only |

> [!NOTE]
> ARM64 is not currently supported. Only `x86_64` (`x64`) runners are supported.

### Supported ROCm Versions

- **Windows**: `7.2.0`, `7.1.1`, `6.4.2`, `6.2.4`, `6.1.2`, `5.7.1`, `5.5.1`
- **Linux**: `7.2.0`–`7.2.4`, `7.1.0`–`7.1.1`, `7.0.0`–`7.0.3`, `6.4.0`–`6.4.4`, `6.3.0`–`6.3.4`, `6.2.0`–`6.2.4`, `6.1.0`–`6.1.5`, `6.0.0`–`6.0.3`, `5.7.0`–`5.7.3`, `5.6.0`–`5.6.1`, `5.5.0`–`5.5.3`

---

## Inputs

| Input                   | Description                                                                                    | Required | Default     |
| ----------------------- | ---------------------------------------------------------------------------------------------- | -------- | ----------- |
| `rocm`                  | ROCm version to install.                                                                       | No       | `'5.5.1'`   |
| `sub-packages`          | JSON array of specific subpackages to install (e.g. `'["hip-sdk"]'`).                          | No       | `'[]'`      |
| `non-rocm-sub-packages` | JSON array of subpackages without `rocm-` prefix (e.g. `'["rocblas"]'`).                       | No       | `'[]'`      |
| `method`                | Installation method: `'local'` or `'network'`. On Linux, installations use the APT repository. | No       | `'local'`   |
| `linux-local-args`      | Arguments for the local installer as a JSON string array.                                      | No       | `'[]'`      |
| `use-github-cache`      | Cache installer on GitHub Actions server cache.                                                | No       | `'true'`    |
| `use-local-cache`       | Cache installer on runner disk.                                                                | No       | `'true'`    |
| `log-file-suffix`       | Suffix for uploaded log artifact.                                                              | No       | `'log.txt'` |

---

## Outputs

| Output      | Description                             |
| ----------- | --------------------------------------- |
| `ROCM_PATH` | Installation path of ROCm (Linux).      |
| `HIP_PATH`  | Installation path of HIP SDK (Windows). |
| `rocm`      | Version of ROCm installed.              |

---

## Environment Variables Set

The action automatically exports the following environment variables:

- **Linux**:
  - `ROCM_PATH`: Root ROCm path (e.g. `/opt/rocm-5.5.1` or `/opt/rocm`)
  - `ROCM_PATH_<version>`: Version-specific ROCm path
  - Adds `$ROCM_PATH/bin` to `PATH`
- **Windows**:
  - `HIP_PATH`: Root HIP SDK path
  - `HIP_PATH_<version>`: Version-specific HIP SDK path
  - Adds `$HIP_PATH\bin` to `PATH`

---

## Example Usage

### Basic Example

```yaml
steps:
  - uses: actions/checkout@v7

  - name: Install AMD ROCm
    id: setup-rocm
    uses: Navegos/rocm-toolkit-dev@v0
    with:
      rocm: '5.5.1'

  - name: Verify installation
    run: hipcc --version
```

### Linux Subpackages Example (Network Method)

```yaml
steps:
  - uses: actions/checkout@v7

  - name: Install HIP SDK and rocblas
    uses: Navegos/rocm-toolkit-dev@v0
    with:
      rocm: '5.5.1'
      method: 'network'
      sub-packages: '["hip-sdk"]'
      non-rocm-sub-packages: '["rocblas"]'
```

---

## Complete CI Workflow Example (`CI.yml`)

The following complete workflow demonstrates cross-platform matrix testing across Linux and Windows runners, testing installation methods, and verifying the toolchain:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  CI:
    strategy:
      fail-fast: false
      matrix:
        os:
          - ubuntu-26.04
          - ubuntu-24.04
          - ubuntu-22.04
          - windows-2025-vs2026
          - windows-2025
          - windows-2022
        method: [local, network]
        rocm: ['5.5.1']
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v7

      - name: Install AMD ROCm
        id: test-action
        uses: Navegos/rocm-toolkit-dev@v0
        with:
          rocm: ${{ matrix.rocm }}
          method: ${{ matrix.method }}
          log-file-suffix: '${{ matrix.method }}-${{ matrix.os }}'

      - name: Install subpackages (Linux network only)
        if: runner.os == 'Linux' && matrix.method == 'network'
        uses: Navegos/rocm-toolkit-dev@v0
        with:
          method: ${{ matrix.method }}
          sub-packages: '["hip-sdk"]'
          non-rocm-sub-packages: '["rocblas"]'
          log-file-suffix: 'hip-sdk-rocblas-${{ matrix.method }}-${{ matrix.os }}'

      - name: Verify outputs
        run: |
          echo "ROCm Version: ${{ steps.test-action.outputs.rocm }}"
          echo "ROCM_PATH: ${{ steps.test-action.outputs.ROCM_PATH }}"
          echo "HIP_PATH: ${{ steps.test-action.outputs.HIP_PATH }}"

      - name: Test if hipcc compiler is available
        run: hipcc --version

      - name: List HIP files (Windows)
        if: runner.os == 'Windows'
        shell: pwsh
        run: |
          Get-ChildItem $env:HIP_PATH
          Get-ChildItem $env:HIP_PATH\bin
          Get-ChildItem $env:HIP_PATH\include

      - name: List ROCm files (Linux)
        if: runner.os == 'Linux'
        run: |
          ls -la $ROCM_PATH
          ls -la $ROCM_PATH/bin
          ls -la $ROCM_PATH/include
```

---

## Publishing to GitHub Marketplace Checklist

To publish this action to the GitHub Actions Marketplace:

1. Ensure the repository is **Public**.
2. Make sure `action.yml` is present in the repository root (includes `name`, `description`, `runs`, `branding`).
3. Bundle `dist/index.js` as a standalone executable (run `npm run all` or `npm run package`).
4. Commit the latest `dist/` and push to GitHub.
5. Create a Git release tag (e.g. `v0.2.40` and move/update `v0` major tag).
6. In GitHub Releases, click **Draft a new release**, choose the tag, and check **"Publish this Action to the GitHub Marketplace"**.

---

## License

This project is licensed under the [MIT License](LICENSE).
