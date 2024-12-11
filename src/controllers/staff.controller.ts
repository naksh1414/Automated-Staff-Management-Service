import { Request, Response } from "express";
import { StaffService } from "../services/staff.service";
import { handleError } from "../utils/error-handler";
import { StaffStatus } from "../types/staff.types";
export class StaffController {
  private readonly staffService: StaffService;

  constructor() {
    this.staffService = new StaffService();
  }

  async createStaff(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.createStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getStaffById(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.getStaffById(req.params.id);
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getAllStaff(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        role: req.query.role as string,
        status: req.query.status as StaffStatus,
        assignedBusId: req.query.busId as string,
        assignedRouteId: req.query.routeId as string,
      };

      const result = await this.staffService.getAllStaff(page, limit, filters);
      console.log("result", result);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async updateStaff(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.updateStaff(
        req.params.id,
        req.body
      );
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async deleteStaff(req: Request, res: Response): Promise<void> {
    try {
      await this.staffService.deleteStaff(req.params.id);
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }

  async assignToBus(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.assignToBus(
        req.params.id,
        req.body.busId
      );
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async assignToRoute(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.assignToRoute(
        req.params.id,
        req.body.routeId
      );
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }
  async unassignBus(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.unassignBus(req.params.id);
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async unassignRoute(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.unassignRoute(req.params.id);
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const staff = await this.staffService.updateStaffStatus(
        req.params.id,
        req.body.status
      );
      res.json(staff);
    } catch (error) {
      handleError(error, res);
    }
  }
}
