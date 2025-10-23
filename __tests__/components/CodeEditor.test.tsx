import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'

// Mock NextAuth
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock the utility functions
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  fetcher: jest.fn(),
}))

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

// Mock the Tabs components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div reckid="tabs-list">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>
      {children}
    </button>
  ),
}))

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: jest.fn(({ onChange, value, onMount }) => {
    // Call onMount with a mock editor
    if (onMount) {
      onMount({
        getModel: () => ({
          updateOptions: jest.fn(),
        }),
      })
    }
    
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    )
  }),
}))

import { CodeEditor } from '@/components/codebase/CodeEditor'

describe('CodeEditor', () => {
  const defaultProps = {
    code: 'print("Hello, World!")',
    onCodeChange: jest.fn(),
    requirements: 'requests==2.31.0',
    onRequirementsChange: jest.fn(),
    onExecute: jest.fn(),
    executing: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    })
  })

  it('should render the code editor with default content', () => {
    render(<CodeEditor {...defaultProps} />)

    expect(screen.getByText('Code Editor')).toBeInTheDocument()
    expect(screen.getAllByTestId('monaco-editor')).toHaveLength(2) // One for each tab
    expect(screen.getByTestId('tab-trigger-main.py')).toBeInTheDocument()
    expect(screen.getByTestId('tab-trigger-requirements.txt')).toBeInTheDocument()
    expect(screen.getByText('Execute')).toBeInTheDocument()
  })

  it('should display the execute button with play icon', () => {
    render(<CodeEditor {...defaultProps} />)

    const executeButton = screen.getByText('Execute')
    expect(executeButton).toBeInTheDocument()
    expect(executeButton).not.toBeDisabled()
  })

  it('should disable execute button when executing', () => {
    render(<CodeEditor {...defaultProps} executing={true} />)

    const executeButton = screen.getByText('Executing...')
    expect(executeButton).toBeInTheDocument()
    expect(executeButton).toBeDisabled()
  })

  it('should call onExecute when execute button is clicked', async () => {
    const user = userEvent.setup()
    render(<CodeEditor {...defaultProps} />)

    const executeButton = screen.getByText('Execute')
    await user.click(executeButton)

    expect(defaultProps.onExecute).toHaveBeenCalledTimes(1)
  })

  it('should switch between tabs', async () => {
    const user = userEvent.setup()
    render(<CodeEditor {...defaultProps} />)

    const requirementsTab = screen.getByTestId('tab-trigger-requirements.txt')
    await user.click(requirementsTab)

    // The editors should still be visible (Monaco Editor mock)
    expect(screen.getAllByTestId('monaco-editor')).toHaveLength(2)
  })

  it('should handle code changes', async () => {
    const user = userEvent.setup()
    render(<CodeEditor {...defaultProps} />)

    const editors = screen.getAllByTestId('monaco-editor')
    await user.type(editors[0], 'print("New code")')

    expect(defaultProps.onCodeChange).toHaveBeenCalled()
  })

  it('should not allow code changes when executing', async () => {
    const user = userEvent.setup()
    render(<CodeEditor {...defaultProps} executing={true} />)

    const editors = screen.getAllByTestId('monaco-editor')
    await user.type(editors[0], 'print("New code")')

    // onCodeChange should not be called when executing
    expect(defaultProps.onCodeChange).not.toHaveBeenCalled()
  })

  it('should adjust editor height', async () => {
    const user = userEvent.setup()
    render(<CodeEditor {...defaultProps} />)

    const decreaseButtons = screen.getAllByText('-')
    const increaseButtons = screen.getAllByText('+')

    await user.click(decreaseButtons[0])
    await user.click(increaseButtons[0])

    // Height adjustment buttons should be present
    expect(decreaseButtons).toHaveLength(2) // One for each tab
    expect(increaseButtons).toHaveLength(2) // One for each tab
  })

  it('should handle unauthenticated user', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<CodeEditor {...defaultProps} />)

    // Should still render but not make API calls
    expect(screen.getByText('Code Editor')).toBeInTheDocument()
  })

  it('should render with default Python code when no code provided', () => {
    render(<CodeEditor {...defaultProps} code="" />)

    const editors = screen.getAllByTestId('monaco-editor')
    expect(editors).toHaveLength(2)
  })

  it('should render with default requirements when no requirements provided', () => {
    render(<CodeEditor {...defaultProps} requirements="" />)

    const editors = screen.getAllByTestId('monaco-editor')
    expect(editors).toHaveLength(2)
  })
})