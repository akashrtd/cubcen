import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  AriaUtils,
  KeyboardNavigation,
  announceToScreenReader,
} from '@/lib/accessibility'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  announceOnClick?: string
  describedBy?: string
  labelledBy?: string
  pressed?: boolean
  expanded?: boolean
}

const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      announceOnClick,
      describedBy,
      labelledBy,
      pressed,
      expanded,
      disabled,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const combinedRef = React.useMemo(
      () => ref || buttonRef,
      [ref]
    ) as React.RefObject<HTMLButtonElement>

    // Handle click with accessibility announcements
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return

        onClick?.(event)

        // Announce action to screen readers
        if (announceOnClick) {
          announceToScreenReader(announceOnClick, 'polite')
        }
      },
      [onClick, loading, disabled, announceOnClick]
    )

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event)

        // Handle Enter and Space activation
        if (!loading && !disabled) {
          KeyboardNavigation.handleActivation(event.nativeEvent, () => {
            handleClick(event as any)
          })
        }
      },
      [onKeyDown, handleClick, loading, disabled]
    )

    // Update ARIA attributes when props change
    React.useEffect(() => {
      const button = combinedRef.current
      if (!button) return

      // Set ARIA pressed state for toggle buttons
      if (pressed !== undefined) {
        AriaUtils.setPressed(button, pressed)
      }

      // Set ARIA expanded state for disclosure buttons
      if (expanded !== undefined) {
        AriaUtils.setExpanded(button, expanded)
      }

      // Set ARIA disabled state
      AriaUtils.setDisabled(button, loading || disabled || false)

      // Set described by
      if (describedBy) {
        button.setAttribute('aria-describedby', describedBy)
      }

      // Set labelled by
      if (labelledBy) {
        button.setAttribute('aria-labelledby', labelledBy)
      }
    }, [
      pressed,
      expanded,
      loading,
      disabled,
      describedBy,
      labelledBy,
      combinedRef,
    ])

    const buttonContent = React.useMemo(() => {
      if (loading) {
        return (
          <>
            <div
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
              aria-hidden="true"
            />
            {loadingText || 'Loading...'}
            <span className="sr-only">Loading, please wait</span>
          </>
        )
      }
      return children
    }, [loading, loadingText, children])

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={combinedRef}
        disabled={loading || disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        // Accessibility attributes
        role={asChild ? undefined : 'button'}
        tabIndex={disabled || loading ? -1 : 0}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </Comp>
    )
  }
)
AccessibleButton.displayName = 'AccessibleButton'

export { AccessibleButton, buttonVariants }
