import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  // https://github.com/stoplightio/spectral/blob/develop/docs/guides/5-custom-functions.md#writing-functions
  function noRefInSimpleType(input, options, context) {
    if (Object.keys(input).length === 1 && input['$ref']) {
      const propertyName = context.path[[context.path.length - 1]];
      return [
        {
          message: propertyName + `: MUST not be defined using a $ref.`,
        },
      ];
    }
  }
);