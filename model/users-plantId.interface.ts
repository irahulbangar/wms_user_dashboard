export interface UsersPlantIdResponse {
  success: boolean;
  message: string;
  data: UsersPlantIdResult[];
}

export interface UsersPlantIdResult {
  client_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_password: string;
  status: string;
  created_at: string;
  updated_at: string;
  organization_name: string;
}
