export interface ClientUsersResponse {
  success: boolean;
  message: string;
  data: ClientUserResult[];
}

export interface ClientUserResult {
  client_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
  plantsList: PlantsList[];
  iat: number;
  exp: number;
}

export interface PlantsList {
  plant_id: number;
  role: string;
}
