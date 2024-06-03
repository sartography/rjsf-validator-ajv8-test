import { FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';

import { CustomValidatorOptionsType, Localizer } from './types';
import AJV8Validator from './validator';

/** Creates and returns a customized implementation of the `ValidatorType` with the given customization `options` if
 * provided. If a `localizer` is provided, it is used to translate the messages generated by the underlying AJV
 * validation.
 *
 * @param [options={}] - The `CustomValidatorOptionsType` options that are used to create the `ValidatorType` instance
 * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
 * @returns - The custom validator implementation resulting from the set of parameters provided
 */
export default function customizeValidator<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(options: CustomValidatorOptionsType = {}, localizer?: Localizer) {
  return new AJV8Validator<T, S, F>(options, localizer);
}
