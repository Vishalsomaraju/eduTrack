// Standardize API errors for hook consumers
export function parseApiError(err) {
  if (err instanceof Error) {
    return err.message
  }
  return 'An unexpected error occurred'
}

// Wrap async api calls with consistent
// loading/error state pattern
export async function withLoading(setLoading, setError, fn) {
  setLoading(true)
  setError(null)
  try {
    const result = await fn()
    return result
  } catch (err) {
    setError(parseApiError(err))
    return null
  } finally {
    setLoading(false)
  }
}
