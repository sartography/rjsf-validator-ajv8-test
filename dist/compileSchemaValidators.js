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

// src/compileSchemaValidators.ts
var compileSchemaValidators_exports = {};
__export(compileSchemaValidators_exports, {
  compileSchemaValidatorsCode: () => compileSchemaValidatorsCode,
  default: () => compileSchemaValidators
});
module.exports = __toCommonJS(compileSchemaValidators_exports);
var import_fs = __toESM(require("fs"));

// src/compileSchemaValidatorsCode.ts
var import_standalone = __toESM(require("ajv/dist/standalone"));
var import_utils2 = require("@rjsf/utils");

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

// src/compileSchemaValidatorsCode.ts
function compileSchemaValidatorsCode(schema, options = {}) {
  const schemaMaps = (0, import_utils2.schemaParser)(schema);
  const schemas = Object.values(schemaMaps);
  const { additionalMetaSchemas, customFormats, ajvOptionsOverrides = {}, ajvFormatOptions, AjvClass } = options;
  const compileOptions = {
    ...ajvOptionsOverrides,
    code: { lines: true, ...ajvOptionsOverrides.code, source: true },
    schemas
  };
  const ajv = createAjvInstance(additionalMetaSchemas, customFormats, compileOptions, ajvFormatOptions, AjvClass);
  return (0, import_standalone.default)(ajv);
}

// src/compileSchemaValidators.ts
function compileSchemaValidators(schema, output, options = {}) {
  console.log("parsing the schema");
  const moduleCode = compileSchemaValidatorsCode(schema, options);
  console.log(`writing ${output}`);
  import_fs.default.writeFileSync(output, moduleCode);
}
//# sourceMappingURL=compileSchemaValidators.js.map
