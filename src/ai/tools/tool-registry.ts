import { ParkingSpotService } from '../../parkingSpot/ParkingSpot.service';
import { VehicleService } from '../../vehicles/vehicles.service';
import { ParkingSpotTypeCode } from '../../def/enums/ParkingSpotType';
import { ParkingSessionService } from '../../parkingSession/parkingSession.service';

export type ToolHandler = (args: any) => Promise<unknown>;

export const buildToolRegistry = (
  parkingSpotService: ParkingSpotService,
  vehicleService: VehicleService,
  parkingSessionService: ParkingSessionService,
  userId: string,
): Record<string, ToolHandler> => ({
  getAvailableSpots: (args: {
    lotId?: string;
    typeCode?: ParkingSpotTypeCode;
  }) => parkingSpotService.findAllAvailable(args.lotId, args.typeCode),

  getMyVehicles: async () => {
    const vehicles = await vehicleService.findMyVehicles(userId);
    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      isDefault: vehicle.isDefault,
    }));
  },

  getActiveSession: async () => {
    const session = await parkingSessionService.getActiveSession(userId);

    if (!session) {
      return null;
    }

    const vehicles = session.vehicle
      ? {
          plateNumber: session.vehicle.plateNumber,
          type: session.vehicle.type,
        }
      : null;

    return {
      id: session.id,
      entryTime: session.entryTime,
      spotNumber: session.spot?.spotNumber,
      parkingLot: session.spot?.lot?.name,
      vehicles,
      hourlyRate: session.spot?.type?.effectiveHourlyRate,
      isDiscounted: session.spot?.type?.isDiscounted,
      activeRuleName: session.spot?.type?.activeRuleName,
    };
  },
});
