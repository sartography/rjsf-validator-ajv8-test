import Ajv from 'ajv';
import { CustomValidator, ErrorSchema, ErrorTransformer, FormContextType, RJSFSchema, StrictRJSFSchema, UiSchema, ValidationData, ValidatorType } from '@rjsf/utils';
import { CustomValidatorOptionsType, Localizer } from './types';
import { RawValidationErrorsType } from './processRawValidationErrors';
/** `ValidatorType` implementation that uses the AJV 8 validation mechanism.
 */
export default class AJV8Validator<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> implements ValidatorType<T, S, F> {
    /** The AJV instance to use for all validations
     *
     * @private
     */
    ajv: Ajv;
    /** The Localizer function to use for localizing Ajv errors
     *
     * @private
     */
    readonly localizer?: Localizer;
    /** Constructs an `AJV8Validator` instance using the `options`
     *
     * @param options - The `CustomValidatorOptionsType` options that are used to create the AJV instance
     * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
     */
    constructor(options: CustomValidatorOptionsType, localizer?: Localizer);
    /** Converts an `errorSchema` into a list of `RJSFValidationErrors`
     *
     * @param errorSchema - The `ErrorSchema` instance to convert
     * @param [fieldPath=[]] - The current field path, defaults to [] if not specified
     * @deprecated - Use the `toErrorList()` function provided by `@rjsf/utils` instead. This function will be removed in
     *        the next major release.
     */
    toErrorList(errorSchema?: ErrorSchema<T>, fieldPath?: string[]): import("@rjsf/utils").RJSFValidationError[];
    /** Runs the pure validation of the `schema` and `formData` without any of the RJSF functionality. Provided for use
     * by the playground. Returns the `errors` from the validation
     *
     * @param schema - The schema against which to validate the form data   * @param schema
     * @param formData - The form data to validate
     */
    rawValidation<Result = any>(schema: S, formData?: T): RawValidationErrorsType<Result>;
    /** This function processes the `formData` with an optional user contributed `customValidate` function, which receives
     * the form data and a `errorHandler` function that will be used to add custom validation errors for each field. Also
     * supports a `transformErrors` function that will take the raw AJV validation errors, prior to custom validation and
     * transform them in what ever way it chooses.
     *
     * @param formData - The form data to validate
     * @param schema - The schema against which to validate the form data
     * @param [customValidate] - An optional function that is used to perform custom validation
     * @param [transformErrors] - An optional function that is used to transform errors after AJV validation
     * @param [uiSchema] - An optional uiSchema that is passed to `transformErrors` and `customValidate`
     */
    validateFormData(formData: T | undefined, schema: S, customValidate?: CustomValidator<T, S, F>, transformErrors?: ErrorTransformer<T, S, F>, uiSchema?: UiSchema<T, S, F>): ValidationData<T>;
    /**
     * This function is called when the root schema changes. It removes the old root schema from the ajv instance and adds the new one.
     * @param rootSchema - The root schema used to provide $ref resolutions
     */
    handleRootSchemaChange(rootSchema: S): void;
    /** Validates data against a schema, returning true if the data is valid, or
     * false otherwise. If the schema is invalid, then this function will return
     * false.
     *
     * @param schema - The schema against which to validate the form data
     * @param formData - The form data to validate
     * @param rootSchema - The root schema used to provide $ref resolutions
     */
    isValid(schema: S, formData: T | undefined, rootSchema: S): boolean;
}
