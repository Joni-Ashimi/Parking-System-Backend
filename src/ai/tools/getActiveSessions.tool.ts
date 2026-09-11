import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const getActiveSessionTool: FunctionDeclaration = {
  name: 'getActiveSession',
  description:
    'Get the authenticated user’s currently active parking session. Returns null if the user has no active session.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};
