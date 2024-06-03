// src/validator.ts
import {
  deepEquals,
  ID_KEY,
  ROOT_SCHEMA_PREFIX,
  toErrorList,
  withIdRefPrefix,
  hashForSchema
} from "@rjsf/utils";

// src/createAjvInstance.ts
import Ajv from "ajv";
import addFormats from "ajv-formats";
import isObject from "lodash/isObject";
import { ADDITIONAL_PROPERTY_FLAG, RJSF_ADDITIONAL_PROPERTIES_FLAG } from "@rjsf/utils";
var AJV_CONFIG = {
  allErrors: true,
  multipleOfPrecision: 8,
  strict: false,
  verbose: true
};
var COLOR_FORMAT_REGEX = /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/;
var DATA_URL_FORMAT_REGEX = /^data:([a-z]+\/[a-z0-9-+.]+)?;(?:name=(.*);)?base64,(.*)$/;
function createAjvInstance(additionalMetaSchemas, customFormats, ajvOptionsOverrides = {}, ajvFormatOptions, AjvClass = Ajv) {
  const ajv = new AjvClass({ ...AJV_CONFIG, ...ajvOptionsOverrides });
  if (ajvFormatOptions) {
    addFormats(ajv, ajvFormatOptions);
  } else if (ajvFormatOptions !== false) {
    addFormats(ajv);
  }
  ajv.addFormat("data-url", DATA_URL_FORMAT_REGEX);
  ajv.addFormat("color", COLOR_FORMAT_REGEX);
  ajv.addKeyword(ADDITIONAL_PROPERTY_FLAG);
  ajv.addKeyword(RJSF_ADDITIONAL_PROPERTIES_FLAG);
  if (Array.isArray(additionalMetaSchemas)) {
    ajv.addMetaSchema(additionalMetaSchemas);
  }
  if (isObject(customFormats)) {
    Object.keys(customFormats).forEach((formatName) => {
      ajv.addFormat(formatName, customFormats[formatName]);
    });
  }
  return ajv;
}

// src/processRawValidationErrors.ts
import get from "lodash/get";
import {
  createErrorHandler,
  getDefaultFormState,
  getUiOptions,
  PROPERTIES_KEY,
  toErrorSchema,
  unwrapErrorHandler,
  validationDataMerge
} from "@rjsf/utils";
function transformRJSFValidationErrors(errors = [], uiSchema) {
  return errors.map((e) => {
    const { instancePath, keyword, params, schemaPath, parentSchema, ...rest } = e;
    let { message = "" } = rest;
    let property = instancePath.replace(/\//g, ".");
    let stack = `${property} ${message}`.trim();
    if ("missingProperty" in params) {
      property = property ? `${property}.${params.missingProperty}` : params.missingProperty;
      const currentProperty = params.missingProperty;
      const uiSchemaTitle = getUiOptions(get(uiSchema, `${property.replace(/^\./, "")}`)).title;
      if (uiSchemaTitle) {
        message = message.replace(currentProperty, uiSchemaTitle);
      } else {
        const parentSchemaTitle = get(parentSchema, [PROPERTIES_KEY, currentProperty, "title"]);
        if (parentSchemaTitle) {
          message = message.replace(currentProperty, parentSchemaTitle);
        }
      }
      stack = message;
    } else {
      const uiSchemaTitle = getUiOptions(get(uiSchema, `${property.replace(/^\./, "")}`)).title;
      if (uiSchemaTitle) {
        stack = `'${uiSchemaTitle}' ${message}`.trim();
      } else {
        const parentSchemaTitle = parentSchema?.title;
        if (parentSchemaTitle) {
          stack = `'${parentSchemaTitle}' ${message}`.trim();
        }
      }
    }
    return {
      name: keyword,
      property,
      message,
      params,
      // specific to ajv
      stack,
      schemaPath
    };
  });
}
function processRawValidationErrors(validator, rawErrors, formData, schema, customValidate, transformErrors, uiSchema) {
  const { validationError: invalidSchemaError } = rawErrors;
  let errors = transformRJSFValidationErrors(rawErrors.errors, uiSchema);
  if (invalidSchemaError) {
    errors = [...errors, { stack: invalidSchemaError.message }];
  }
  if (typeof transformErrors === "function") {
    errors = transformErrors(errors, uiSchema);
  }
  let errorSchema = toErrorSchema(errors);
  if (invalidSchemaError) {
    errorSchema = {
      ...errorSchema,
      $schema: {
        __errors: [invalidSchemaError.message]
      }
    };
  }
  if (typeof customValidate !== "function") {
    return { errors, errorSchema };
  }
  const newFormData = getDefaultFormState(validator, schema, formData, schema, true);
  const errorHandler = customValidate(newFormData, createErrorHandler(newFormData), uiSchema);
  const userErrorSchema = unwrapErrorHandler(errorHandler);
  return validationDataMerge({ errors, errorSchema }, userErrorSchema);
}

// src/validator.ts
var AJV8Validator = class {
  /** Constructs an `AJV8Validator` instance using the `options`
   *
   * @param options - The `CustomValidatorOptionsType` options that are used to create the AJV instance
   * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
   */
  constructor(options, localizer) {
    const { additionalMetaSchemas, customFormats, ajvOptionsOverrides, ajvFormatOptions, AjvClass } = options;
    this.ajv = createAjvInstance(additionalMetaSchemas, customFormats, ajvOptionsOverrides, ajvFormatOptions, AjvClass);
    this.localizer = localizer;
  }
  /** Converts an `errorSchema` into a list of `RJSFValidationErrors`
   *
   * @param errorSchema - The `ErrorSchema` instance to convert
   * @param [fieldPath=[]] - The current field path, defaults to [] if not specified
   * @deprecated - Use the `toErrorList()` function provided by `@rjsf/utils` instead. This function will be removed in
   *        the next major release.
   */
  toErrorList(errorSchema, fieldPath = []) {
    return toErrorList(errorSchema, fieldPath);
  }
  /** Runs the pure validation of the `schema` and `formData` without any of the RJSF functionality. Provided for use
   * by the playground. Returns the `errors` from the validation
   *
   * @param schema - The schema against which to validate the form data   * @param schema
   * @param formData - The form data to validate
   */
  rawValidation(schema, formData) {
    let compilationError = void 0;
    let compiledValidator;
    if (schema[ID_KEY]) {
      compiledValidator = this.ajv.getSchema(schema[ID_KEY]);
    }
    try {
      if (compiledValidator === void 0) {
        compiledValidator = this.ajv.compile(schema);
      }
      compiledValidator(formData);
    } catch (err) {
      compilationError = err;
    }
    let errors;
    if (compiledValidator) {
      if (typeof this.localizer === "function") {
        this.localizer(compiledValidator.errors);
      }
      errors = compiledValidator.errors || void 0;
      compiledValidator.errors = null;
    }
    return {
      errors,
      validationError: compilationError
    };
  }
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
  validateFormData(formData, schema, customValidate, transformErrors, uiSchema) {
    const rawErrors = this.rawValidation(schema, formData);
    return processRawValidationErrors(this, rawErrors, formData, schema, customValidate, transformErrors, uiSchema);
  }
  /**
   * This function is called when the root schema changes. It removes the old root schema from the ajv instance and adds the new one.
   * @param rootSchema - The root schema used to provide $ref resolutions
   */
  handleRootSchemaChange(rootSchema) {
    const rootSchemaId = rootSchema[ID_KEY] ?? ROOT_SCHEMA_PREFIX;
    this.ajv.removeSchema(rootSchemaId);
    this.ajv.addSchema(rootSchema, rootSchemaId);
  }
  /** Validates data against a schema, returning true if the data is valid, or
   * false otherwise. If the schema is invalid, then this function will return
   * false.
   *
   * @param schema - The schema against which to validate the form data
   * @param formData - The form data to validate
   * @param rootSchema - The root schema used to provide $ref resolutions
   */
  isValid(schema, formData, rootSchema) {
    const rootSchemaId = rootSchema[ID_KEY] ?? ROOT_SCHEMA_PREFIX;
    try {
      if (this.ajv.getSchema(rootSchemaId) === void 0) {
        this.ajv.addSchema(rootSchema, rootSchemaId);
      } else if (!deepEquals(rootSchema, this.ajv.getSchema(rootSchemaId)?.schema)) {
        this.handleRootSchemaChange(rootSchema);
      }
      const schemaWithIdRefPrefix = withIdRefPrefix(schema);
      const schemaId = schemaWithIdRefPrefix[ID_KEY] ?? hashForSchema(schemaWithIdRefPrefix);
      let compiledValidator;
      compiledValidator = this.ajv.getSchema(schemaId);
      if (compiledValidator === void 0) {
        compiledValidator = this.ajv.addSchema(schemaWithIdRefPrefix, schemaId).getSchema(schemaId) || this.ajv.compile(schemaWithIdRefPrefix);
      }
      const result = compiledValidator(formData);
      return result;
    } catch (e) {
      console.warn("Error encountered compiling schema:", e);
      return false;
    }
  }
};

// src/customizeValidator.ts
function customizeValidator(options = {}, localizer) {
  return new AJV8Validator(options, localizer);
}

// src/precompiledValidator.ts
import get2 from "lodash/get";
import isEqual from "lodash/isEqual";
import {
  hashForSchema as hashForSchema2,
  ID_KEY as ID_KEY2,
  JUNK_OPTION_ID,
  toErrorList as toErrorList2,
  retrieveSchema
} from "@rjsf/utils";
var AJV8PrecompiledValidator = class {
  /** Constructs an `AJV8PrecompiledValidator` instance using the `validateFns` and `rootSchema`
   *
   * @param validateFns - The map of the validation functions that are generated by the `schemaCompile()` function
   * @param rootSchema - The root schema that was used with the `compileSchema()` function
   * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
   * @throws - Error when the base schema of the precompiled validator does not have a matching validator function
   */
  constructor(validateFns, rootSchema, localizer) {
    this.rootSchema = rootSchema;
    this.validateFns = validateFns;
    this.localizer = localizer;
    this.mainValidator = this.getValidator(rootSchema);
  }
  /** Returns the precompiled validator associated with the given `schema` from the map of precompiled validator
   * functions.
   *
   * @param schema - The schema for which a precompiled validator function is desired
   * @returns - The precompiled validator function associated with this schema
   */
  getValidator(schema) {
    const key = get2(schema, ID_KEY2) || hashForSchema2(schema);
    const validator = this.validateFns[key];
    if (!validator) {
      throw new Error(`No precompiled validator function was found for the given schema for "${key}"`);
    }
    return validator;
  }
  /** Ensures that the validator is using the same schema as the root schema used to construct the precompiled
   * validator. It first compares the given `schema` against the root schema and if they aren't the same, then it
   * checks against the resolved root schema, on the chance that a resolved version of the root schema was passed in
   * instead of the raw root schema.
   *
   * @param schema - The schema against which to validate the form data
   * @param [formData] - The form data to validate if any
   */
  ensureSameRootSchema(schema, formData) {
    if (!isEqual(schema, this.rootSchema)) {
      const resolvedRootSchema = retrieveSchema(this, this.rootSchema, this.rootSchema, formData);
      if (!isEqual(schema, resolvedRootSchema)) {
        throw new Error(
          "The schema associated with the precompiled validator differs from the rootSchema provided for validation"
        );
      }
    }
    return true;
  }
  /** Converts an `errorSchema` into a list of `RJSFValidationErrors`
   *
   * @param errorSchema - The `ErrorSchema` instance to convert
   * @param [fieldPath=[]] - The current field path, defaults to [] if not specified
   * @deprecated - Use the `toErrorList()` function provided by `@rjsf/utils` instead. This function will be removed in
   *        the next major release.
   */
  toErrorList(errorSchema, fieldPath = []) {
    return toErrorList2(errorSchema, fieldPath);
  }
  /** Runs the pure validation of the `schema` and `formData` without any of the RJSF functionality. Provided for use
   * by the playground. Returns the `errors` from the validation
   *
   * @param schema - The schema against which to validate the form data
   * @param [formData] - The form data to validate, if any
   * @throws - Error when the schema provided does not match the base schema of the precompiled validator
   */
  rawValidation(schema, formData) {
    this.ensureSameRootSchema(schema, formData);
    this.mainValidator(formData);
    if (typeof this.localizer === "function") {
      this.localizer(this.mainValidator.errors);
    }
    const errors = this.mainValidator.errors || void 0;
    this.mainValidator.errors = null;
    return { errors };
  }
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
  validateFormData(formData, schema, customValidate, transformErrors, uiSchema) {
    const rawErrors = this.rawValidation(schema, formData);
    return processRawValidationErrors(this, rawErrors, formData, schema, customValidate, transformErrors, uiSchema);
  }
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
  isValid(schema, formData, rootSchema) {
    this.ensureSameRootSchema(rootSchema, formData);
    if (get2(schema, ID_KEY2) === JUNK_OPTION_ID) {
      return false;
    }
    const validator = this.getValidator(schema);
    return validator(formData);
  }
};

// src/createPrecompiledValidator.ts
function createPrecompiledValidator(validateFns, rootSchema, localizer) {
  return new AJV8PrecompiledValidator(validateFns, rootSchema, localizer);
}

// src/index.ts
var src_default = customizeValidator();
export {
  createPrecompiledValidator,
  customizeValidator,
  src_default as default
};
//# sourceMappingURL=validator-ajv8.esm.js.map
