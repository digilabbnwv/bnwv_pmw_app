import { isExpiringSoon, formatDate, defaultEndDate } from '../../lib/utils/dateUtils'

describe('isExpiringSoon', () => {
  it('returns true when date is within 30 days', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 15)
    expect(isExpiringSoon(soon.toISOString())).toBe(true)
  })

  it('returns false when date is more than 30 days away', () => {
    const far = new Date()
    far.setDate(far.getDate() + 60)
    expect(isExpiringSoon(far.toISOString())).toBe(false)
  })

  it('returns false when date is in the past', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    expect(isExpiringSoon(past.toISOString())).toBe(false)
  })

  it('returns true when date is today', () => {
    const today = new Date()
    expect(isExpiringSoon(today.toISOString())).toBe(true)
  })

  it('returns false for null or undefined', () => {
    expect(isExpiringSoon(null)).toBe(false)
    expect(isExpiringSoon(undefined)).toBe(false)
  })

  it('respects custom days parameter', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 10)
    expect(isExpiringSoon(soon.toISOString(), 5)).toBe(false)
    expect(isExpiringSoon(soon.toISOString(), 15)).toBe(true)
  })
})

describe('formatDate', () => {
  it('formats a date as DD-MM-YYYY', () => {
    const date = new Date(2025, 0, 5) // 5 januari 2025
    expect(formatDate(date)).toBe('05-01-2025')
  })

  it('formats a date string as DD-MM-YYYY', () => {
    expect(formatDate('2025-12-25')).toBe('25-12-2025')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })
})

describe('defaultEndDate', () => {
  it('returns a date 1 year after the start date', () => {
    const start = new Date(2025, 5, 15) // 15 juni 2025
    const end = defaultEndDate(start)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(5)
    expect(end.getDate()).toBe(15)
  })

  it('handles leap year correctly', () => {
    const start = new Date(2024, 1, 29) // 29 feb 2024 (schrikkeljaar)
    const end = defaultEndDate(start)
    expect(end.getFullYear()).toBe(2025)
    expect(end.getMonth()).toBe(2) // maart
    expect(end.getDate()).toBe(1)
  })

  it('returns null for null input', () => {
    expect(defaultEndDate(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(defaultEndDate(undefined)).toBeNull()
  })
})
