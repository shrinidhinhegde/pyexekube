import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FileSelector } from '@/components/codebase/FileSelector'

const mockUseSession = jest.fn()
const mockFetcher = jest.fn()
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  ;(global as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
    ResizeObserverMock

  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

jest.mock('@/lib/utils', () => {
  const actual = jest.requireActual('@/lib/utils')
  return {
    ...actual,
    fetcher: (...args: Parameters<typeof actual.fetcher>) => mockFetcher(...args),
  }
})

describe('FileSelector', () => {
  beforeEach(() => {
    mockUseSession.mockReset()
    mockFetcher.mockReset()
  })

  it('renders login prompt when user is not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null })

    render(
      <FileSelector
        onFileSelect={jest.fn()}
        selectedFile={null}
      />,
    )

    expect(
      screen.getByText('Please log in to select files'),
    ).toBeInTheDocument()
  })

  it('loads and selects files when user is authenticated', async () => {
    const files = [
      {
        key: 'file-1',
        name: 'report.zip',
        size: 4096,
        lastModified: '2024-01-01T00:00:00.000Z',
        etag: 'etag',
      },
    ]

    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
    })
    mockFetcher.mockResolvedValue({ files })

    const Wrapper = () => {
      const [selected, setSelected] = React.useState<typeof files[0] | null>(null)

      return (
        <FileSelector
          onFileSelect={setSelected}
          selectedFile={selected}
        />
      )
    }

    const user = userEvent.setup()

    render(<Wrapper />)

    await waitFor(() => expect(mockFetcher).toHaveBeenCalledWith('/api/files?userId=user-1'))

    const combobox = await screen.findByRole('combobox')

    await waitFor(() => expect(combobox).not.toBeDisabled())
    await user.click(combobox)

    const option = await screen.findByText('report.zip')
    await user.click(option)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('report.zip')
    })
  })

  it('respects disabled state', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-2' } },
    })
    mockFetcher.mockResolvedValue({ files: [] })

    render(
      <FileSelector
        onFileSelect={jest.fn()}
        selectedFile={null}
        disabled
      />,
    )

    const combobox = await screen.findByRole('combobox')

    await waitFor(() => {
      expect(combobox).toBeDisabled()
    })

    await waitFor(() => expect(mockFetcher).toHaveBeenCalledWith('/api/files?userId=user-2'))
  })
})

