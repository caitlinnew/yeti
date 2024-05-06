import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      required: ["value"],

      properties: {
        value: {
          type: ["string", "integer"]
        }
      }
    },
  },
  // https://github.com/stoplightio/spectral/blob/develop/docs/guides/5-custom-functions.md#writing-functions
  function equals(input, options, context) {
    const { value } = options;

    const propertyName = context.path[[context.path.length - 2]];
    const propertyProperty = context.path[[context.path.length - 1]];
    if (input !== undefined) {
      if (input !== value) {
      return [
        {
          message: propertyName + `.` + propertyProperty + `: value must equal "${value}", value provided: "${input}".`,
        },
      ];
      }
    } else {
      return [
        {
          message: propertyName + `.` + propertyProperty + `: value must equal "${value}" no value provided!`,
        },
      ];
    }
  },
);