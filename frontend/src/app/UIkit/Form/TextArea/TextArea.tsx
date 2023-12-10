import { type ComponentProps } from '@stitches/react'
import { observer } from 'mobx-react-lite'
import {
  type Control,
  Controller, type FieldValues, type Path,
  type RegisterOptions,
} from 'react-hook-form'

import { Txt } from '../../Txt'
import { StyledErrorMessage, StyledTextFieldsContainer } from '../TextFields.styles'
import { StyledTextArea } from './TextArea.styles'

export interface ControlledTextAreaProps<T extends FieldValues> {
  control: Control<T, any>
  name: Path<T>
  placeholder?: string
  rules?: RegisterOptions
}

export type TextAreaProps = ComponentProps<typeof StyledTextFieldsContainer> & ComponentProps<typeof StyledTextArea> & {
  errorMessage?: string
}

export type TextAreaControlProps<T extends FieldValues> = TextAreaProps & {
  errorMessage?: string
  controlledInputProps: ControlledTextAreaProps<T>
  after?: string
}

export const TextArea = observer(<T extends FieldValues>({
  after,
  errorMessage,
  controlledInputProps,
  ...textAreaProps
}: TextAreaControlProps<T>) => {
  return (
    <Controller
      control={controlledInputProps?.control}
      name={controlledInputProps?.name}
      rules={controlledInputProps?.rules}
      render={({ field }) => (
        <StyledTextFieldsContainer>
          <StyledTextArea
            {...textAreaProps}
            {...field}
          />
          {after && (
            <StyledTextFieldsContainer>
              {after}
            </StyledTextFieldsContainer>
          )}
          {(errorMessage && textAreaProps.isError) && (
            <StyledErrorMessage>
              <Txt primary1>{errorMessage}</Txt>
            </StyledErrorMessage>
          )}
        </StyledTextFieldsContainer>
      )}
    />
  )
})
