import { SchemaType } from '@google/generative-ai';

export const TestSchema = {
  type: SchemaType.OBJECT,
  properties: {
    topic: {
      type: SchemaType.STRING,
    },
    difficulty: {
      type: SchemaType.STRING,
      enum: ['easy', 'medium', 'hard'],
    },
    explanation: {
      type: SchemaType.STRING,
    },
  },
  required: ['topic', 'difficulty', 'explanation'],
};
