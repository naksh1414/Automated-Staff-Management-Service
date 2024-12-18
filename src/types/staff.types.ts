export interface IStaff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  contactNumber: string;
  assignedBusId?: string;
  assignedRouteId?: string;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  shiftDuration: number;
  shiftType: ShiftType;
}

export interface LoginDTO {
  email: string;
  password: string;
}
export interface CreateStaffDTO {
  name: string;
  email: string;
  password: string;
  role?: StaffRole;
  contactNumber?: string;
  gender?: string;
  status: StaffStatus;
}

export enum StaffRole {
  DRIVER = "DRIVER",
  CONDUCTOR = "CONDUCTOR",
  ADMIN = "ADMIN",
}
export enum ShiftType {
  NIGHT = "NIGHT",
  DAY = "DAY",
}

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface ICreateStaffDto {
  name: string;
  email: string;
  role: StaffRole;
  contactNumber: string;
  password: string;
}

export interface IUpdateStaffDto extends Partial<ICreateStaffDto> {
  assignedBusId?: string;
  assignedRouteId?: string;
  status?: StaffStatus;
}

export interface AuthTokenPayload {
  userId: string;
}
