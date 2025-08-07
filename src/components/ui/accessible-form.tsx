import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  generateId,
  AriaUtils,
  announceToScreenReader,
} from '@/lib/accessibility'

interface AccessibleFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  announceErrors?: boolean
  errorSummaryId?: string
}

interface AccessibleFieldProps {
  children: React.ReactNode
  error?: string
  required?: boolean
  className?: string
}

interface AccessibleLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  children: React.ReactNode
}

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  describedBy?: string
  invalid?: boolean
}

interface AccessibleTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  describedBy?: string
  invalid?: boolean
}

interface AccessibleSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  describedBy?: string
  invalid?: boolean
  children: React.ReactNode
}

// Form component
const AccessibleForm = React.forwardRef<HTMLFormElement, AccessibleFormProps>(
  (
    {
      className,
      onSubmit,
      announceErrors = true,
      errorSummaryId,
      children,
      ...props
    },
    ref
  ) => {
    const [errors, setErrors] = React.useState<string[]>([])
    const formRef = React.useRef<HTMLFormElement>(null)
    const combinedRef = (ref || formRef) as React.RefObject<HTMLFormElement>

    const handleSubmit = React.useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        // Collect form validation errors
        const form = combinedRef.current
        if (form) {
          const invalidElements = form.querySelectorAll(':invalid')
          const errorMessages: string[] = []

          invalidElements.forEach(element => {
            const input = element as HTMLInputElement
            if (input.validationMessage) {
              const label = form.querySelector(
                `label[for="${input.id}"]`
              ) as HTMLLabelElement
              const fieldName = label?.textContent || input.name || 'Field'
              errorMessages.push(`${fieldName}: ${input.validationMessage}`)
            }
          })

          setErrors(errorMessages)

          // Announce errors to screen readers
          if (errorMessages.length > 0 && announceErrors) {
            const errorSummary = `Form has ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''}: ${errorMessages.join(', ')}`
            announceToScreenReader(errorSummary, 'assertive')

            // Focus first invalid field
            const firstInvalid = invalidElements[0] as HTMLElement
            if (firstInvalid) {
              firstInvalid.focus()
            }

            event.preventDefault()
            return
          }
        }

        onSubmit?.(event)
      },
      [onSubmit, announceErrors, combinedRef]
    )

    return (
      <form
        ref={combinedRef}
        className={cn('space-y-4', className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {/* Error Summary */}
        {errors.length > 0 && (
          <div
            id={errorSummaryId || 'form-error-summary'}
            role="alert"
            aria-live="assertive"
            className="rounded-md bg-red-50 border border-red-200 p-4"
          >
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Please correct the following errors:
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {children}
      </form>
    )
  }
)
AccessibleForm.displayName = 'AccessibleForm'

// Field wrapper component
const AccessibleField = React.forwardRef<HTMLDivElement, AccessibleFieldProps>(
  ({ children, error, required, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {children}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600"
            id={`${generateId('error')}`}
          >
            {error}
          </div>
        )}
      </div>
    )
  }
)
AccessibleField.displayName = 'AccessibleField'

// Label component
const AccessibleLabel = React.forwardRef<
  HTMLLabelElement,
  AccessibleLabelProps
>(({ className, required, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  )
})
AccessibleLabel.displayName = 'AccessibleLabel'

// Input component
const AccessibleInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(({ className, type, error, describedBy, invalid, ...props }, ref) => {
  const inputId = props.id || generateId('input')
  const errorId = error ? `${inputId}-error` : undefined
  const allDescribedBy = [describedBy, errorId].filter(Boolean).join(' ')

  return (
    <>
      <input
        type={type}
        id={inputId}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        aria-invalid={invalid || !!error}
        aria-describedby={allDescribedBy || undefined}
        {...props}
      />
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </>
  )
})
AccessibleInput.displayName = 'AccessibleInput'

// Textarea component
const AccessibleTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AccessibleTextareaProps
>(({ className, error, describedBy, invalid, ...props }, ref) => {
  const textareaId = props.id || generateId('textarea')
  const errorId = error ? `${textareaId}-error` : undefined
  const allDescribedBy = [describedBy, errorId].filter(Boolean).join(' ')

  return (
    <>
      <textarea
        id={textareaId}
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        aria-invalid={invalid || !!error}
        aria-describedby={allDescribedBy || undefined}
        {...props}
      />
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </>
  )
})
AccessibleTextarea.displayName = 'AccessibleTextarea'

// Select component
const AccessibleSelect = React.forwardRef<
  HTMLSelectElement,
  AccessibleSelectProps
>(({ className, error, describedBy, invalid, children, ...props }, ref) => {
  const selectId = props.id || generateId('select')
  const errorId = error ? `${selectId}-error` : undefined
  const allDescribedBy = [describedBy, errorId].filter(Boolean).join(' ')

  return (
    <>
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        aria-invalid={invalid || !!error}
        aria-describedby={allDescribedBy || undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </>
  )
})
AccessibleSelect.displayName = 'AccessibleSelect'

export {
  AccessibleForm,
  AccessibleField,
  AccessibleLabel,
  AccessibleInput,
  AccessibleTextarea,
  AccessibleSelect,
}
