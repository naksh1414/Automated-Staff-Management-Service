export interface StaffEvent {
  staffId: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  data: any;
  timestamp: number;
}
