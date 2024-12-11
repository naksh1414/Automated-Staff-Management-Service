import { Staff } from "../models/staff.model";
import {
  IStaff,
  ICreateStaffDto,
  IUpdateStaffDto,
  StaffStatus,
} from "../types/staff.types";
import { CustomError } from "../utils/custom-error";
import { validateStaffData } from "../validators/staff.validator";
import { Logger } from "../utils/logger";
import { publishEvent } from "../config/rabbitmq";

export class StaffService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("StaffService");
  }

  async createStaff(staffData: ICreateStaffDto): Promise<IStaff> {
    try {
      // Validate input data
      await validateStaffData(staffData);

      // Check if staff with email already exists
      const existingStaff = await Staff.findOne({ email: staffData.email });
      if (existingStaff) {
        throw new CustomError("Staff with this email already exists", 409);
      }

      // Create new staff
      const staff = new Staff(staffData);
      await staff.save();

      // Publish staff created event
      await publishEvent("staff.created", {
        staffId: staff.id,
        role: staff.role,
      });

      this.logger.info(`Staff created successfully: ${staff.id}`);
      return staff;
    } catch (error) {
      this.logger.error("Error creating staff:", error);
      throw error;
    }
  }

  async getStaffById(id: string): Promise<IStaff> {
    try {
      const staff = await Staff.findById(id).lean();
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }
      return staff;
    } catch (error) {
      this.logger.error(`Error fetching staff with id ${id}:`, error);
      throw error;
    }
  }

  async getAllStaff(
    page: number = 1,
    limit: number = 10,
    filters: {
      role?: string;
      status?: StaffStatus;
      assignedBusId?: string;
      assignedRouteId?: string;
    } = {}
  ): Promise<{ staff: IStaff[]; total: number }> {
    try {
      const query = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      const skip = (page - 1) * limit;

      const [staff, total] = await Promise.all([
        Staff.find(query).skip(skip).limit(limit).lean(),
        Staff.countDocuments(query),
      ]);
      console.log("staff", staff);
      return { staff, total };
    } catch (error) {
      this.logger.error("Error fetching staff:", error);
      throw error;
    }
  }

  async updateStaff(id: string, updateData: IUpdateStaffDto): Promise<IStaff> {
    try {
      // Validate update data
      if (Object.keys(updateData).length === 0) {
        throw new CustomError("No update data provided", 400);
      }

      const staff = await Staff.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Publish staff updated event
      await publishEvent("staff.updated", {
        staffId: staff.id,
        updates: updateData,
      });

      this.logger.info(`Staff updated successfully: ${id}`);
      return staff;
    } catch (error) {
      this.logger.error(`Error updating staff ${id}:`, error);
      throw error;
    }
  }

  async deleteStaff(id: string): Promise<void> {
    try {
      const staff = await Staff.findByIdAndDelete(id);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Publish staff deleted event
      await publishEvent("staff.deleted", {
        staffId: id,
      });

      this.logger.info(`Staff deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting staff ${id}:`, error);
      throw error;
    }
  }

  async assignToBus(staffId: string, busId: string): Promise<IStaff> {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Check if staff is available
      if (staff.status !== StaffStatus.ACTIVE) {
        throw new CustomError("Staff is not active", 400);
      }

      staff.assignedBusId = busId;
      await staff.save();

      // Publish staff assigned event
      await publishEvent("staff.assigned.bus", {
        staffId,
        busId,
      });

      return staff;
    } catch (error) {
      this.logger.error(
        `Error assigning staff ${staffId} to bus ${busId}:`,
        error
      );
      throw error;
    }
  }

  async assignToRoute(staffId: string, routeId: string): Promise<IStaff> {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Check if staff is available
      if (staff.status !== StaffStatus.ACTIVE) {
        throw new CustomError("Staff is not active", 400);
      }

      staff.assignedRouteId = routeId;
      await staff.save();

      // Publish staff assigned event
      await publishEvent("staff.assigned.route", {
        staffId,
        routeId,
      });

      return staff;
    } catch (error) {
      this.logger.error(
        `Error assigning staff ${staffId} to route ${routeId}:`,
        error
      );
      throw error;
    }
  }

  async unassignBus(staffId: string): Promise<IStaff> {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Check if staff is actually assigned to a bus
      if (!staff.assignedBusId) {
        throw new CustomError("Staff is not assigned to any bus", 400);
      }

      const previousBusId = staff.assignedBusId;
      staff.assignedBusId = undefined;
      await staff.save();

      // Publish staff unassigned event
      await publishEvent("staff.assigned.bus", {
        staffId,
        previousBusId,
        action: "unassigned",
      });

      return staff;
    } catch (error) {
      this.logger.error(`Error unassigning staff ${staffId} from bus:`, error);
      throw error;
    }
  }

  async unassignRoute(staffId: string): Promise<IStaff> {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      // Check if staff is actually assigned to a route
      if (!staff.assignedRouteId) {
        throw new CustomError("Staff is not assigned to any route", 400);
      }

      const previousRouteId = staff.assignedRouteId;
      staff.assignedRouteId = undefined;
      await staff.save();

      // Publish staff unassigned event
      await publishEvent("staff.assigned.route", {
        staffId,
        previousRouteId,
        action: "unassigned",
      });

      return staff;
    } catch (error) {
      this.logger.error(
        `Error unassigning staff ${staffId} from route:`,
        error
      );
      throw error;
    }
  }

  async updateStaffStatus(
    staffId: string,
    status: StaffStatus
  ): Promise<IStaff> {
    try {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        throw new CustomError("Staff not found", 404);
      }

      staff.status = status;
      await staff.save();

      // Publish staff status updated event
      await publishEvent("staff.status.updated", {
        staffId,
        status,
      });

      return staff;
    } catch (error) {
      this.logger.error(`Error updating staff ${staffId} status:`, error);
      throw error;
    }
  }
}
