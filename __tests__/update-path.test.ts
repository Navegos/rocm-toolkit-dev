import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test
} from '@jest/globals'
import * as path from 'path'
import os from 'os'
import {SemVer} from 'semver'

const exportVariableSpy = jest.fn()
const addPathSpy = jest.fn()
const debugSpy = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  exportVariable: exportVariableSpy,
  addPath: addPathSpy,
  debug: debugSpy
}))

const {updatePath} = await import('../src/update-path.js')

describe('updatePath', () => {
  beforeEach(() => {
    exportVariableSpy.mockClear()
    addPathSpy.mockClear()
    debugSpy.mockClear()
    jest.spyOn(os, 'arch').mockReturnValue('x64')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Linux exports ROCM_PATH and versioned variants', async () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    const version = new SemVer('5.5.1')

    const rocmPath = await updatePath(version)

    expect(rocmPath).toBe('/opt/rocm-5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith('ROCM_PATH', '/opt/rocm-5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ROCM_PATH_5_5',
      '/opt/rocm-5.5'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ROCM_PATH_5_5_1',
      '/opt/rocm-5.5'
    )
    expect(addPathSpy).toHaveBeenCalledWith(path.join('/opt/rocm-5.5', 'bin'))
  })

  test('Windows exports HIP_PATH and versioned variants without ROCM_PATH', async () => {
    jest.spyOn(os, 'platform').mockReturnValue('win32')
    const version = new SemVer('5.5.1')

    const rocmPath = await updatePath(version)

    expect(rocmPath).toBe('C:\\Program Files\\AMD\\ROCm\\5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'HIP_PATH',
      'C:\\Program Files\\AMD\\ROCm\\5.5'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'HIP_PATH_5_5',
      'C:\\Program Files\\AMD\\ROCm\\5.5'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'HIP_PATH_5_5_1',
      'C:\\Program Files\\AMD\\ROCm\\5.5'
    )
    expect(exportVariableSpy).not.toHaveBeenCalledWith(
      'ROCM_PATH',
      expect.anything()
    )
    expect(addPathSpy).toHaveBeenCalledWith(
      'C:\\Program Files\\AMD\\ROCm\\5.5\\bin'
    )
  })
})
