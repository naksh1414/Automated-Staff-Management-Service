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
}

export enum StaffRole {
  DRIVER = "DRIVER",
  CONDUCTOR = "CONDUCTOR",
  ADMIN = "ADMIN",
}

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export interface ICreateStaffDto {
  name: string;
  email: string;
  role: StaffRole;
  contactNumber: string;
}

export interface IUpdateStaffDto extends Partial<ICreateStaffDto> {
  assignedBusId?: string;
  assignedRouteId?: string;
  status?: StaffStatus;
}
