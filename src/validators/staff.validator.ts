import Joi from "joi";
import {
  ICreateStaffDto,
  IUpdateStaffDto,
  StaffRole,
  StaffStatus,
} from "../types/staff.types";
import { CustomError } from "../utils/custom-error";

const staffSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().required().email(),
  role: Joi.string()
    .required()
    .valid(...Object.values(StaffRole)),
  contactNumber: Joi.string()
    .required()
    .pattern(/^\+?[\d\s-]+$/),
  assignedBusId: Joi.string().optional(),
  assignedRouteId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(StaffStatus))
    .optional(),
});

export const validateStaffData = async (
  data: ICreateStaffDto | IUpdateStaffDto
): Promise<void> => {
  try {
    await staffSchema.validateAsync(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      // Map validation errors to a more readable format
      const errorDetails = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new CustomError(`Validation error: ${errorDetails}`, 400);
    }
    throw error;
  }
};
