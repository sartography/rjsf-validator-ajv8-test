"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createPrecompiledValidator: () => createPrecompiledValidator,
  customizeValidator: () => customizeValidator,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/validator.ts
var import_utils3 = require("@rjsf/utils");

// src/createAjvInstance.ts
var import_ajv = __toESM(require("ajv"));
var import_ajv_formats = __toESM(require("ajv-formats"));
var import_isObject = __toESM(require("lodash/isObject"));
var import_utils = require("@rjsf/utils");
var AJV_CONFIG = {
  allErrors: true,
  multipleOfPrecision: 8,
  strict: false,
  verbose: true
};
var COLOR_FORMAT_REGEX = /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/;
var DATA_URL_FORMAT_REGEX = /^data:([a-z]+\/[a-z0-9-+.]+)?;(?:name=(.*);)?base64,(.*)$/;
function createAjvInstance(additionalMetaSchemas, customFormats, ajvOptionsOverrides = {}, ajvFormatOptions, AjvClass = import_ajv.default) {
  const ajv = new AjvClass({ ...AJV_CONFIG, ...ajvOptionsOverrides });
  if (ajvFormatOptions) {
    (0, import_ajv_formats.default)(ajv, ajvFormatOptions);
  } else if (ajvFormatOptions !== false) {
    (0, import_ajv_formats.default)(ajv);
  }
  ajv.addFormat("data-url", DATA_URL_FORMAT_REGEX);
  ajv.addFormat("color", COLOR_FORMAT_REGEX);
  ajv.addKeyword(import_utils.ADDITIONAL_PROPERTY_FLAG);
  ajv.addKeyword(import_utils.RJSF_ADDITIONAL_PROPERTIES_FLAG);
  if (Array.isArray(additionalMetaSchemas)) {
    ajv.addMetaSchema(additionalMetaSchemas);
  }
  if ((0, import_isObject.default)(customFormats)) {
    Object.keys(customFormats).forEach((formatName) => {
      ajv.addFormat(formatName, customFormats[formatName]);
    });
  }
  return ajv;
}

// src/processRawValidationErrors.ts
var import_get = __toESM(require("lodash/get"));
var import_utils2 = require("@rjsf/utils");
function transformRJSFValidationErrors(errors = [], uiSchema) {
  return errors.map((e) => {
    const { instancePath, keyword, params, schemaPath, parentSchema, ...rest } = e;
    let { message = "" } = rest;
    let property = instancePath.replace(/\//g, ".");
    let stack = `${property} ${message}`.trim();
    if ("missingProperty" in params) {
      property = property ? `${property}.${params.missingProperty}` : params.missingProperty;
      const currentProperty = params.missingProperty;
      const uiSchemaTitle = (0, import_utils2.getUiOptions)((0, import_get.default)(uiSchema, `${property.replace(/^\./, "")}`)).title;
      if (uiSchemaTitle) {
        message = message.replace(currentProperty, uiSchemaTitle);
      } else {
        const parentSchemaTitle = (0, import_get.default)(parentSchema, [import_utils2.PROPERTIES_KEY, currentProperty, "title"]);
        if (parentSchemaTitle) {
          message = message.replace(currentProperty, parentSchemaTitle);
        }
      }
      stack = message;
    } else {
      const uiSchemaTitle = (0, import_utils2.getUiOptions)((0, import_get.default)(uiSchema, `${property.replace(/^\./, "")}`)).title;
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
  let errorSchema = (0, import_utils2.toErrorSchema)(errors);
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
  const newFormData = (0, import_utils2.getDefaultFormState)(validator, schema, formData, schema, true);
  const errorHandler = customValidate(newFormData, (0, import_utils2.createErrorHandler)(newFormData), uiSchema);
  const userErrorSchema = (0, import_utils2.unwrapErrorHandler)(errorHandler);
  return (0, import_utils2.validationDataMerge)({ errors, errorSchema }, userErrorSchema);
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
    return (0, import_utils3.toErrorList)(errorSchema, fieldPath);
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
    if (schema[import_utils3.ID_KEY]) {
      compiledValidator = this.ajv.getSchema(schema[import_utils3.ID_KEY]);
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
  /** Validates data against a schema, returning true if the data is valid, or
   * false otherwise. If the schema is invalid, then this function will return
   * false.
   *
   * @param schema - The schema against which to validate the form data
   * @param formData - The form data to validate
   * @param rootSchema - The root schema used to provide $ref resolutions
   */
  isValid(schema, formData, rootSchema) {
    const rootSchemaId = rootSchema[import_utils3.ID_KEY] ?? import_utils3.ROOT_SCHEMA_PREFIX;
    try {
      this.ajv.addSchema(rootSchema, rootSchemaId);
      const schemaWithIdRefPrefix = (0, import_utils3.withIdRefPrefix)(schema);
      const schemaId = schemaWithIdRefPrefix[import_utils3.ID_KEY] ?? (0, import_utils3.hashForSchema)(schemaWithIdRefPrefix);
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
    } finally {
      this.ajv.removeSchema(rootSchemaId);
    }
  }
};

// src/customizeValidator.ts
function customizeValidator(options = {}, localizer) {
  return new AJV8Validator(options, localizer);
}

// src/precompiledValidator.ts
var import_get2 = __toESM(require("lodash/get"));
var import_isEqual = __toESM(require("lodash/isEqual"));
var import_utils4 = require("@rjsf/utils");
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
    const key = (0, import_get2.default)(schema, import_utils4.ID_KEY) || (0, import_utils4.hashForSchema)(schema);
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
    if (!(0, import_isEqual.default)(schema, this.rootSchema)) {
      const resolvedRootSchema = (0, import_utils4.retrieveSchema)(this, this.rootSchema, this.rootSchema, formData);
      if (!(0, import_isEqual.default)(schema, resolvedRootSchema)) {
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
    return (0, import_utils4.toErrorList)(errorSchema, fieldPath);
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
    if ((0, import_get2.default)(schema, import_utils4.ID_KEY) === import_utils4.JUNK_OPTION_ID) {
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
//# sourceMappingURL=index.js.map
