import Joi from "joi";
import { ICreateRouteDto, IUpdateRouteDto } from "../types/route.types";
import { CustomError } from "../utils/custom-error";

const routeSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  startPoint: Joi.string().required(),
  endPoint: Joi.string().required(),
  waypoints: Joi.array().items(Joi.string()),
  distance: Joi.number().required().min(0),
  estimatedTime: Joi.number().required().min(0),
});

export const validateRouteData = async (
  data: ICreateRouteDto | IUpdateRouteDto
): Promise<void> => {
  try {
    await routeSchema.validateAsync(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      throw new CustomError("Validation error: ", 400);
    }
    throw error;
  }
};
