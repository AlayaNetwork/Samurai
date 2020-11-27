import React from 'react'
import { action } from '@storybook/addon-actions'
import CheckBox, { CHECKED, INDETERMINATE, UNCHECKED } from './check-box.component'
import { boolean, select, text } from '@storybook/addon-knobs/react'

export default {
  title: 'Check Box',
}

const checkboxOptions = {
  [CHECKED]: CHECKED,
  [INDETERMINATE]: INDETERMINATE,
  [UNCHECKED]: UNCHECKED,
  True: true,
  False: false,
}

export const primaryType = () => (
  <CheckBox
    checked={select('checked state', checkboxOptions, UNCHECKED)}
    disabled={boolean('Disabled', false)}
    id={text('ID', 'checkboxId')}
    onClick={action('checkbox clicked')}
  />
)
