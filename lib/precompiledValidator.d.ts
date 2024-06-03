import { CustomValidator, ErrorSchema, ErrorTransformer, FormContextType, RJSFSchema, StrictRJSFSchema, UiSchema, ValidationData, ValidatorType } from '@rjsf/utils';
import { CompiledValidateFunction, Localizer, ValidatorFunctions } from './types';
import { RawValidationErrorsType } from './processRawValidationErrors';
/** `ValidatorType` implementation that uses an AJV 8 precompiled validator as created by the
 * `compileSchemaValidators()` function provided by the `@rjsf/validator-ajv8` library.
 */
export default class AJV8PrecompiledValidator<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> implements ValidatorType<T, S, F> {
    /** The root schema object used to construct this validator
     *
     * @private
     */
    readonly rootSchema: S;
    /** The `ValidatorFunctions` map used to construct this validator
     *
     * @private
     */
    readonly validateFns: ValidatorFunctions;
    /** The main validator function associated with the base schema in the `precompiledValidator`
     *
     * @private
     */
    readonly mainValidator: CompiledValidateFunction;
    /** The Localizer function to use for localizing Ajv errors
     *
     * @private
     */
    readonly localizer?: Localizer;
    /** Constructs an `AJV8PrecompiledValidator` instance using the `validateFns` and `rootSchema`
     *
     * @param validateFns - The map of the validation functions that are generated by the `schemaCompile()` function
     * @param rootSchema - The root schema that was used with the `compileSchema()` function
     * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
     * @throws - Error when the base schema of the precompiled validator does not have a matching validator function
     */
    constructor(validateFns: ValidatorFunctions, rootSchema: S, localizer?: Localizer);
    /** Returns the precompiled validator associated with the given `schema` from the map of precompiled validator
     * functions.
     *
     * @param schema - The schema for which a precompiled validator function is desired
     * @returns - The precompiled validator function associated with this schema
     */
    getValidator(schema: S): CompiledValidateFunction;
    /** Ensures that the validator is using the same schema as the root schema used to construct the precompiled
     * validator. It first compares the given `schema` against the root schema and if they aren't the same, then it
     * checks against the resolved root schema, on the chance that a resolved version of the root schema was passed in
     * instead of the raw root schema.
     *
     * @param schema - The schema against which to validate the form data
     * @param [formData] - The form data to validate if any
     */
    ensureSameRootSchema(schema: S, formData?: T): boolean;
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
     * @param schema - The schema against which to validate the form data
     * @param [formData] - The form data to validate, if any
     * @throws - Error when the schema provided does not match the base schema of the precompiled validator
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
    /** Validates data against a schema, returning true if the data is valid, or false otherwise. If the schema is
     * invalid, then this function will return false.
     *
     * @param schema - The schema against which to validate the form data
     * @param formData - The form data to validate
     * @param rootSchema - The root schema used to provide $ref resolutions
     * @returns - true if the formData validates against the schema, false otherwise
     * @throws - Error when the schema provided does not match the base schema of the precompiled validator OR if there
     *        isn't a precompiled validator function associated with the schema
     */
    isValid(schema: S, formData: T | undefined, rootSchema: S): boolean;
}
