import { FormContextType, RJSFSchema, StrictRJSFSchema, ValidatorType } from '@rjsf/utils';

import { Localizer, ValidatorFunctions } from './types';
import AJV8PrecompiledValidator from './precompiledValidator';

/** Creates and returns a `ValidatorType` interface that is implemented with a precompiled validator. If a `localizer`
 * is provided, it is used to translate the messages generated by the underlying AJV validation.
 *
 * NOTE: The `validateFns` parameter is an object obtained by importing from a precompiled validation file created via
 * the `compileSchemaValidators()` function.
 *
 * @param validateFns - The map of the validation functions that are created by the `compileSchemaValidators()` function
 * @param rootSchema - The root schema that was used with the `compileSchemaValidators()` function
 * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
 * @returns - The precompiled validator implementation resulting from the set of parameters provided
 */
export default function createPrecompiledValidator<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(validateFns: ValidatorFunctions, rootSchema: S, localizer?: Localizer): ValidatorType<T, S, F> {
  return new AJV8PrecompiledValidator<T, S, F>(validateFns, rootSchema, localizer);
}
