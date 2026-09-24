# rocm-toolkit

This action installs the [AMD ROCm™](https://rocm.docs.amd.com/en/latest) on the system.
It adds the rocm install location as `ROCM_PATH` and `ROCM_PATH_<version>` on Linux, and `HIP_PATH` and `HIP_PATH_<version>` on Windows to `GITHUB_ENV` so you can access the rocm install location in subsequent steps. The `bin` directory is added to `GITHUB_PATH` so you can use commands such as `clang` directly in subsequent steps. Right now only Windows and Linux on x86_64 are supported (`ubuntu-26.04, ubuntu-24.04, ubuntu-22.04, windows-2025-vs2026, windows-2025, windows-2022`).

## Inputs

### `rocm`

Default: `'1'`.

## Example usage

```yaml
steps:
  - uses: Navegos/rocm-toolkit-dev@v0.1.0
    id: rocm-toolkit-dev
    with:
      rocm: '5.5.1'
```
