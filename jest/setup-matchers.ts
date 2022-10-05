import { matcherHint } from 'jest-matcher-utils';
import { ErrorObject } from 'ajv';

// Indicate that this file is a module
export {};

// @ts-ignore
const validate = globalThis.ajv.getSchema('automation_blueprint');
// @ts-ignore
const { verbose } = globalThis.ajv.opts;

// Keywords where the `Received: ...` output is shown
const ERROR_KEYWORDS_SHOW_RECEIVED = ['if', 'not'];

// Keywords where the `Expected: ...` output is hidden
const ERROR_KEYWORDS_HIDE_EXPECTED = [
  'type',
  // String
  'pattern',
  'format',
  'minLength',
  'maxLength',
  // Number
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  // Object
  'minProperties',
  'maxProperties',
  'required',
  // Array
  'minItems',
  'maxItems'
];

const isObject = (input: unknown) => Object.prototype.toString.call(input) === '[object Object]';

const formatForPrint = (input: unknown, displayType = true) => {
  // Undefined and null are both a type and a value
  if (input === undefined || input === null) {
    return `<${input}>`;
  }

  // Empty string should be explicitly marked
  if (input === '') {
    return '<empty string>';
  }

  // Array or object are stringified
  if (Array.isArray(input) || isObject(input)) {
    return (displayType ? (Array.isArray(input) ? '<array> ' : '<object> ') : '') + JSON.stringify(input);
  }

  // String, number or boolean always output their type.
  // This helps distinguish values that might look the same,
  // e.g. `<number> 1` and `<string> 1`
  return `${`<${typeof input}>`} ${input}`;
};

function toBeValidBlueprint(actual: boolean) {
  const pass = validate(actual);
  let message: string;

  if (pass) {
    let message = `${matcherHint(
      `.not.${toBeValidBlueprint.name}`,
      undefined,
      'schema'
    )}\n\nExpected value not to be a valid blueprint\n\n`;

    if (verbose) {
      message += `received\n${formatForPrint(actual)}\n`;
    }
  } else {
    message = `received\n`;

    validate.errors?.forEach((error: ErrorObject) => {
      let line = error.message;

      if (error.keyword === 'additionalProperties') {
        line = `${error.message}, but found '${error.params.additionalProperty}'`;
      } else if (error.instancePath) {
        line = `${error.instancePath} ${error.message}`;
      }

      if (verbose && error.schemaPath) {
        // Only output expected value if it is not already described in the error.message
        if (!ERROR_KEYWORDS_HIDE_EXPECTED.includes(error.keyword)) {
          switch (error.keyword) {
            // Display the then/else schema which triggered the error
            case 'if':
              // @ts-ignore
              line += `\n    Expected: ${formatForPrint(error.parentSchema[error.params.failingKeyword], false)}`;
              break;

            default:
              line += `\n    Expected: ${formatForPrint(error.schema, false)}`;
              break;
          }
        }

        // Show received value if there is a instancePath
        if (error.instancePath) {
          line += `\n    Received: ${formatForPrint(error.data)}`;

          // Otherwise show received output only for specific keywords
        } else if (ERROR_KEYWORDS_SHOW_RECEIVED.includes(error.keyword)) {
          line += `\n    Received: ${formatForPrint(error.data, false)}`;
        }

        line += `\n    Path:     ${validate.schema.$id || ''}${error.schemaPath}`;
      }

      message += `  ${line}\n`;
    });

    message = `${matcherHint('.toMatchSchema', undefined, 'schema')}\n\n${message}`;
  }

  return {
    actual,
    message: () => message,
    name: toBeValidBlueprint.name,
    pass
  };
}

// Declare custom matchers for typescript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidBlueprint(): R;
    }
  }
}

// Add the custom matcher to jest
expect.extend({ toBeValidBlueprint });
