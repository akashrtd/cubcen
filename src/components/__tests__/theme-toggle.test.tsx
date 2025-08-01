import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'

// Mock the theme provider
const mockSetTheme = jest.fn()
jest.mock('../theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('opens dropdown menu when clicked', () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme when light option is selected', () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)

    const lightOption = screen.getByText('Light')
    fireEvent.click(lightOption)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme when dark option is selected', () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)

    const darkOption = screen.getByText('Dark')
    fireEvent.click(darkOption)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme when system option is selected', () => {
    render(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(toggleButton)

    const systemOption = screen.getByText('System')
    fireEvent.click(systemOption)

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })
})
