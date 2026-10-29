import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot, type Root } from 'react-dom/client'
import ErrorBoundary from '../components/ErrorBoundary'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Boom(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('renders a friendly fallback instead of a blank screen', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    act(() => {
      root.render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      )
    })

    expect(container.textContent).toContain('Something went wrong')
    expect(container.textContent).toContain('Try Again')
    spy.mockRestore()
  })
})
