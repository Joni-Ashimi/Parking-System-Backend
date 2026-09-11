import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { ParkingSpotTypeCode } from '../../def/enums/ParkingSpotType';

export const getAvailableSpotsTool: FunctionDeclaration = {
  name: 'getAvailableSpots',
  description:
    'Get currently available parking spots, optionally filtered by parking lot and/or vehicle type.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      lotId: {
        type: SchemaType.STRING,
        description:
          'UUID of a specific parking lot to filter by. Omit to search all lots.',
      },
      typeCode: {
        type: SchemaType.STRING,
        format: 'enum',
        enum: Object.values(ParkingSpotTypeCode) as string[],
        description:
          'Vehicle/spot type to filter by, e.g. truck, car, motorcycle.',
      },
    },
  },
};
