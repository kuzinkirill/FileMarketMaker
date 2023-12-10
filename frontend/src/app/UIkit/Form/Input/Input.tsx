import { type ComponentProps } from '@stitches/react'
import { observer } from 'mobx-react-lite'
import { type ReactNode, useState } from 'react'
import {
  type Control,
  Controller, type FieldValues, type Path,
  type RegisterOptions,
  type UseFormSetValue,
} from 'react-hook-form'

import { filterData, type IFilterData } from '../../../utils/input/filterData'
import { Txt } from '../../Txt'
import {
  StyledAfterContainer,
  StyledErrorMessage,
  StyledNotificationMessage, StyledRightContent,
  StyledTextFieldsContainer,
} from '../TextFields.styles'
import { StyledInput } from './Input.styles'

export interface ControlledInputProps<T extends FieldValues> {
  control: Control<T, any>
  name: Path<T>
  placeholder?: string
  rules?: RegisterOptions
  onChange?: () => void
  error?: any
  validateParams?: Omit<IFilterData, 'value'>
  setValue: UseFormSetValue<T>
}

export type InputProps = ComponentProps<typeof StyledTextFieldsContainer> & ComponentProps<typeof StyledInput> & {
  errorMessage?: string
}

export type InputControlProps<T extends FieldValues> = InputProps & {
  errorMessage?: string
  controlledInputProps: ControlledInputProps<T>
  after?: string
  notification?: ReactNode
  rightInputContent?: ReactNode
}

export const Input = observer(<T extends FieldValues>({
  after,
  errorMessage,
  controlledInputProps,
  notification,
  rightInputContent,
  ...inputProps
}: InputControlProps<T>) => {
  const [state, setState] = useState<string | undefined>(
    controlledInputProps.control._defaultValues[controlledInputProps.name],
  )

  return (
    <Controller
      control={controlledInputProps?.control}
      name={controlledInputProps?.name}
      rules={controlledInputProps?.rules}
      render={({ field }) => (
        <StyledTextFieldsContainer>
          <StyledInput
            {...inputProps}
            {...field}
            onChange={(e) => {
              field.onChange?.(e)
              const value = filterData({
                value: e.target.value,
                ...controlledInputProps.validateParams,
              })
              controlledInputProps.setValue(controlledInputProps.name, value as any)
              setState(value)
            }}
            value={state}
          />
          {after && (
            <StyledAfterContainer>
              {after}
            </StyledAfterContainer>
          )}
          {(errorMessage && inputProps.isError) && (
            <StyledErrorMessage>
              <Txt primary1>{errorMessage}</Txt>
            </StyledErrorMessage>
          )}
          {(notification && inputProps.isNotification) && (
            <StyledNotificationMessage>
              {notification}
            </StyledNotificationMessage>
          )}
          {rightInputContent && (
            <StyledRightContent>
              { rightInputContent }
            </StyledRightContent>
          )}
        </StyledTextFieldsContainer>
      )}
    />
  )
})
