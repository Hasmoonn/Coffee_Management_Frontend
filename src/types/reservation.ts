// src/types/reservation.ts
export interface BackendTable {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  position?: Record<string, unknown> | null;
}

export interface BackendReservation {
  id: string;
  userId: string;
  tableId: string;
  table: BackendTable;
  date: string;
  time: string;
  guests: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  occasion: string | null;
  specialRequests: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationPayload {
  tableId: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  specialRequests?: string;
}

export interface AvailabilityQuery {
  date?: string;
  time?: string;    
  guests?: number;
}