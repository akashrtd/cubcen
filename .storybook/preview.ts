import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { ThemeProvider } from 'next-themes'
import '../src/app/globals.css'
import '../src/components/dashboard/styles/dashboard-variables.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
        wide: {
          name: 'Wide',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    a11y: {
      test: 'todo',
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [
    Story =>
      React.createElement(
        ThemeProvider,
        {
          attribute: 'class',
          defaultTheme: 'light',
          enableSystem: true,
          disableTransitionOnChange: false,
        },
        React.createElement(
          'div',
          { className: 'min-h-screen bg-background text-foreground' },
          React.createElement(Story)
        )
      ),
  ],
}

export default preview
