import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '../lib/errors'

const axiosError = (response?: { status: number; data?: unknown }, code?: string) => ({
  isAxiosError: true,
  response,
  code,
})

describe('getErrorMessage', () => {
  it('uses a server error message', () => {
    expect(getErrorMessage(axiosError({ status: 400, data: { error: 'Bad zip' } }), 'fallback')).toBe(
      'Bad zip',
    )
  })

  it('ignores HTML error bodies', () => {
    expect(
      getErrorMessage(axiosError({ status: 404, data: '<html>not found</html>' }), 'fallback'),
    ).toBe('The repository or endpoint could not be found.')
  })

  it('explains unreachable backends', () => {
    expect(getErrorMessage(axiosError(undefined), 'fallback')).toContain(
      'Cannot reach the analysis backend',
    )
  })

  it('handles timeouts', () => {
    expect(getErrorMessage(axiosError(undefined, 'ECONNABORTED'), 'fallback')).toContain('timed out')
  })

  it('handles plain errors and unknown values', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
