import { Schema, model } from "mongoose";
import {
  IStaff,
  StaffRole,
  StaffStatus,
  ShiftType,
} from "../types/staff.types";

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(StaffRole),
      required: true,
    },
    contactNumber: { type: String, required: true },
    assignedBusId: { type: String },
    assignedRouteId: { type: String },
    status: {
      type: String,
      enum: Object.values(StaffStatus),
      default: StaffStatus.ACTIVE,
    },
    shiftDuration: {
      type: Number,
    },
    shiftType: {
      type: String,
      enum: ShiftType,
      default: ShiftType.DAY,
    },
  },
  { timestamps: true }
);

StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ status: 1 });
StaffSchema.index({ assignedBusId: 1 });
StaffSchema.index({ assignedRouteId: 1 });

export const Staff = model<IStaff>("Staff", StaffSchema);
