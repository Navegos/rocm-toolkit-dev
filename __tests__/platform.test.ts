import {OSType, getArch, getOs} from '../src/platform'
import os from 'os'
import {afterEach, describe, expect, jest, test} from '@jest/globals'

test.concurrent('Return either windows of linux platform', async () => {
  const osString = os.platform()
  let expected: OSType
  switch (osString) {
    case 'win32':
      expected = OSType.windows
      break
    case 'linux':
      expected = OSType.linux
      break
    default:
      // eslint-disable-next-line jest/no-conditional-expect
      await expect(getOs()).rejects.toThrow(`Unsupported OS: ${osString}`)
      return
  }
  const osPlatform = await getOs()
  expect(osPlatform).toBe(expected)
})

describe('Architecture check', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Return x64 for x64 architecture', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    await expect(getArch()).resolves.toBe('x64')
  })

  test('Throw on unsupported architecture', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('arm64')
    await expect(getArch()).rejects.toThrow('Unsupported architecture: arm64')
  })

  test('getOs rejects on unsupported architecture', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('arm64')
    await expect(getOs()).rejects.toThrow('Unsupported architecture: arm64')
  })
})

describe('OS check', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Throw on unsupported OS', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    jest.spyOn(os, 'platform').mockReturnValue('darwin')
    await expect(getOs()).rejects.toThrow('Unsupported OS: darwin')
  })

  test('Return windows on win32', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    jest.spyOn(os, 'platform').mockReturnValue('win32')
    await expect(getOs()).resolves.toBe(OSType.windows)
  })

  test('Return linux on linux', async () => {
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    await expect(getOs()).resolves.toBe(OSType.linux)
  })
})
