// src/types/route.types.ts

// Route Status Enum
export enum RouteStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  UNDER_MAINTENANCE = "under_maintenance",
  SCHEDULED = "scheduled",
}

// Route Type Enum
export enum RouteType {
  REGULAR = "regular",
  EXPRESS = "express",
  SHUTTLE = "shuttle",
  NIGHT = "night",
}

// Schedule Type
export interface ISchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  departureTime: string; // HH:mm format
  arrivalTime: string; // HH:mm format
  frequency?: number; // in minutes
}

// Stop/Waypoint Type
export interface IStop {
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  estimatedTime: number; // minutes from start
  stopNumber: number;
  isTimepoint: boolean; // whether this is a major timepoint stop
}

// Fare Structure
export interface IFare {
  passengerType: "adult" | "child" | "senior" | "student";
  basePrice: number;
  peakHourSurcharge?: number;
  discountPercentage?: number;
}

// Route Statistics
export interface IRouteStats {
  averageOccupancy: number;
  averageDelay: number;
  totalTrips: number;
  lastUpdated: Date;
}

// Main Route Interface
export interface IRoute {
  id: string;
  name: string;
  code: string; // unique route identifier
  type: RouteType;
  status: RouteStatus;
  description?: string;

  // Route Points
  startPoint: {
    name: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  endPoint: {
    name: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  stops: IStop[];

  // Route Details
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  schedules: ISchedule[];
  fares: IFare[];

  // Route Configuration
  isCircular: boolean; // whether the route returns to starting point
  isBidirectional: boolean; // whether the route operates in both directions
  allowsStanding: boolean;
  maxCapacity: number;

  // Route Statistics
  stats?: IRouteStats;

  // Metadata
  tags?: string[];
  notes?: string;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Route DTO
export interface ICreateRouteDto {
  name: string;
  code: string;
  type: RouteType;
  description?: string;
  startPoint: {
    name: string;
    location: {
      coordinates: [number, number];
    };
  };
  endPoint: {
    name: string;
    location: {
      coordinates: [number, number];
    };
  };
  stops: Omit<IStop, "stopNumber">[]; // stopNumber will be auto-assigned
  distance: number;
  estimatedTime: number;
  schedules: ISchedule[];
  fares: IFare[];
  isCircular: boolean;
  isBidirectional: boolean;
  allowsStanding: boolean;
  maxCapacity: number;
  tags?: string[];
  notes?: string;
}

// Update Route DTO
export interface IUpdateRouteDto
  extends Partial<Omit<ICreateRouteDto, "code">> {
  status?: RouteStatus;
}

// Route Query Parameters
export interface IRouteQueryParams {
  page?: number;
  limit?: number;
  type?: RouteType;
  status?: RouteStatus;
  isCircular?: boolean;
  isBidirectional?: boolean;
  startPointName?: string;
  endPointName?: string;
  minDistance?: number;
  maxDistance?: number;
  tags?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Route Statistics Update
export interface IRouteStatsUpdate {
  routeId: string;
  occupancy: number;
  delay: number;
  tripCompleted: boolean;
}

// Route Optimization Parameters
export interface IRouteOptimizationParams {
  routeId: string;
  optimizationCriteria: {
    minimizeDistance?: boolean;
    minimizeTime?: boolean;
    maximizeEfficiency?: boolean;
    balanceLoad?: boolean;
  };
  constraints?: {
    maxStops?: number;
    maxDistance?: number;
    maxDuration?: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  };
}

// Route Analysis Result
export interface IRouteAnalysis {
  routeId: string;
  analysisDate: Date;
  metrics: {
    averageLoad: number;
    peakHourUtilization: number;
    onTimePerformance: number;
    revenuePerKm: number;
    passengerSatisfaction?: number;
  };
  recommendations: {
    scheduleAdjustments?: string[];
    capacityChanges?: string[];
    fareOptimization?: string[];
    routeModifications?: string[];
  };
}

// Route Segment Data for Heat Maps
export interface IRouteSegment {
  startStop: string;
  endStop: string;
  distance: number;
  averageTime: number;
  congestionLevel: "low" | "medium" | "high";
  passengerLoad: number;
}

// Route Alert
export interface IRouteAlert {
  routeId: string;
  type: "delay" | "diversion" | "cancellation" | "weather" | "maintenance";
  severity: "low" | "medium" | "high";
  message: string;
  startTime: Date;
  endTime?: Date;
  affectedStops?: string[];
  alternateRoute?: string;
}
