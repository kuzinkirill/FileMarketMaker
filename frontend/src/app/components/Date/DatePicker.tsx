import 'react-datepicker/dist/react-datepicker.css'

import { observer } from 'mobx-react-lite'
import { forwardRef, type HTMLProps } from 'react'
import DatePickerBase from 'react-datepicker'
import { type Control, Controller, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form'

import { StyledInput } from '../../UIkit'

export interface ControlledDatePickerProps<T extends FieldValues> {
  control: Control<T, any>
  name: Path<T>
  rules: Omit<RegisterOptions<T, any>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
}

export const DatePicker = observer(<T extends FieldValues>({
  control,
  name,
  rules,
}: ControlledDatePickerProps<T>) => {
  const ExampleCustomInput = forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement>>(({
    value,
    onClick,
    onChange,
  },
  ref,
  ) => (
    <StyledInput
      onClick={onClick}
      ref={ref}
      value={value}
      onChange={onChange}
    />
  ))

  return (
    <Controller<T>
      control={control}
      render={(field) => {
        return (
          <DatePickerBase
            {...field}
            selected={field.field.value}
            onChange={(date) => { field.field.onChange(date) }}
            customInput={<ExampleCustomInput />}
          />
        )
      }}
      rules={rules}
      name={name}
    />
  )
})
