import { describe, expect, it } from 'vitest'
import { asArray, asNumber, asRecord, asString, asStringMap } from '../lib/safe'

describe('safe helpers', () => {
  it('returns an empty array for non-arrays', () => {
    expect(asArray(null)).toEqual([])
    expect(asArray({ length: 2 })).toEqual([])
    expect(asArray([1, 2])).toEqual([1, 2])
  })

  it('returns an empty record for non-objects', () => {
    expect(asRecord(null)).toEqual({})
    expect(asRecord([])).toEqual({})
    expect(asRecord('text')).toEqual({})
    expect(asRecord({ a: 1 })).toEqual({ a: 1 })
  })

  it('coerces numbers and strings safely', () => {
    expect(asNumber(3)).toBe(3)
    expect(asNumber('3', 7)).toBe(7)
    expect(asNumber(Number.NaN, 7)).toBe(7)
    expect(asString('ok')).toBe('ok')
    expect(asString(null, 'fallback')).toBe('fallback')
  })

  it('filters invalid language counts', () => {
    expect(asStringMap({ ts: 2, js: '3', py: Number.NaN })).toEqual({ ts: 2 })
    expect(asStringMap(null)).toEqual({})
  })
})
