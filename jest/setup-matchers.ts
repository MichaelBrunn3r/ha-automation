// Indicate that this file is a module
export {};

// @ts-ignore
const validate = globalThis.ajv.getSchema('automation_blueprint');

function toBeValidBlueprint(actual: boolean) {
  return {
    message: () => '',
    pass: validate(actual)
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
