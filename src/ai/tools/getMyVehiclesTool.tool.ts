import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const getMyVehiclesTool: FunctionDeclaration = {
  name: 'getMyVehicles',
  description: 'Get the authenticated user’s registered vehicles.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};
