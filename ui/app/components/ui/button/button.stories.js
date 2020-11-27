import React from 'react'
import { action } from '@storybook/addon-actions'
import Button from '.'
import { text, boolean } from '@storybook/addon-knobs/react'

export default {
  title: 'Button',
}

export const primaryType = () => (
  <Button
    onClick={action('clicked')}
    type="primary"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const secondaryType = () => (
  <Button
    onClick={action('clicked')}
    type="secondary"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const defaultType = () => (
  <Button
    onClick={action('clicked')}
    type="default"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const warningType = () => (
  <Button
    onClick={action('clicked')}
    type="warning"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const dangerType = () => (
  <Button
    onClick={action('clicked')}
    type="danger"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const dangerPrimaryType = () => (
  <Button
    onClick={action('clicked')}
    type="danger-primary"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)

export const linkType = () => (
  <Button
    onClick={action('clicked')}
    type="link"
    disabled={boolean('disabled', false)}
  >
    {text('text', 'Click me')}
  </Button>
)
