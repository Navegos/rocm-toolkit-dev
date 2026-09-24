import * as core from '@actions/core'
import * as path from 'path'
import * as platform from '../src/platform'
import {SemVer} from 'semver'
import {updatePath} from '../src/update-path'

describe('updatePath', () => {
  let exportVariableSpy: jest.SpyInstance
  let addPathSpy: jest.SpyInstance

  beforeEach(() => {
    exportVariableSpy = jest.spyOn(core, 'exportVariable').mockImplementation()
    addPathSpy = jest.spyOn(core, 'addPath').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Linux exports ROCM_PATH and versioned variants', async () => {
    jest.spyOn(platform, 'getOs').mockResolvedValue(platform.OSType.linux)
    const version = new SemVer('5.5.1')

    const rocmPath = await updatePath(version)

    expect(rocmPath).toBe('/opt/rocm-5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith('ROCM_PATH', '/opt/rocm-5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith('ROCM_PATH_5_5', '/opt/rocm-5.5')
    expect(exportVariableSpy).toHaveBeenCalledWith('ROCM_PATH_5_5_1', '/opt/rocm-5.5')
    expect(addPathSpy).toHaveBeenCalledWith(path.join('/opt/rocm-5.5', 'bin'))
  })

  test('Windows exports HIP_PATH and versioned variants without ROCM_PATH', async () => {
    jest.spyOn(platform, 'getOs').mockResolvedValue(platform.OSType.windows)
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
