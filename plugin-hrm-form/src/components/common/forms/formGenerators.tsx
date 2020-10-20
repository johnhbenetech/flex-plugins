import React from 'react';
import { useFormContext, ValidationRules } from 'react-hook-form';

import { FormItem, FormRow } from '../../../styles/HrmStyles';
import type { FormItemDefinition, FormDefinition } from './types';

const ConnectForm: React.FC<{ children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element }> = ({
  children,
}) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const getRules = (field: FormItemDefinition): ValidationRules => ({
  max: field.max,
  maxLength: field.maxLength,
  min: field.min,
  minLength: field.minLength,
  pattern: field.pattern,
  required: field.required,
  validate: field.validate,
});

// eslint-disable-next-line react/display-name
const getInputType = (field: FormItemDefinition) => (onBlur: () => void) => {
  const rules = getRules(field);

  switch (field.type) {
    case 'input':
      return (
        <ConnectForm key={`${field.name}-input`}>
          {({ errors, register }) => {
            console.log('>>> input rerender');
            return (
              <FormItem>
                <label htmlFor={field.name}>{field.label}</label>
                <input name={field.name} onBlur={onBlur} ref={register(rules)} />
                {field.required && errors[field.name] && <span>This field is required</span>}
              </FormItem>
            );
          }}
        </ConnectForm>
      );
    case 'numeric input':
      return (
        <ConnectForm key={`${field.name}-input`}>
          {({ errors, register }) => {
            console.log('>>> input rerender');
            return (
              <FormItem>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  name={field.name}
                  onBlur={onBlur}
                  ref={register({
                    ...rules,
                    pattern: { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' },
                  })}
                />
                {errors[field.name] && <span>{errors[field.name].message}</span>}
              </FormItem>
            );
          }}
        </ConnectForm>
      );
    case 'select':
      return (
        <ConnectForm key={`${field.name}-select`}>
          {({ errors, register }) => (
            <FormItem>
              <label htmlFor={field.name}>{field.label}</label>
              <select name={field.name} onBlur={onBlur} ref={register(rules)}>
                {field.options.map(o => (
                  <option key={`${field.name}-${o.value}-option`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {field.required && errors[field.name] && <span>This field is required</span>}
            </FormItem>
          )}
        </ConnectForm>
      );
    default:
      return null;
  }
};

export const createFormFromDefinition = (definition: FormDefinition) => (onBlur: () => void): JSX.Element[] => {
  console.log('>>>> createFormFromDefinition called');

  if (!definition.length) return [];

  if (definition.length === 1)
    return [
      <FormRow key={`${definition[0].name}-form-row`}>
        {getInputType(definition[0])(onBlur)}
        <div />
      </FormRow>,
    ];

  const [x, y, ...rest] = definition;
  const row = (
    <FormRow key={`${x.name}-${y.name}-form-row`}>
      {getInputType(x)(onBlur)}
      {getInputType(y)(onBlur)}
    </FormRow>
  );
  return [row, ...createFormFromDefinition(rest)(onBlur)];
};
