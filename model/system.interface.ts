export interface SystemResponse {
    success: boolean
    message: string
    data: SystemResult[]
  }
  
  export interface SystemResult {
    system_id: number
    organization_id: number
    plant_id: number
    department_id: number
    system_name: string
    system_description: string
    status: string
    is_deleted: boolean
    created_at: string
    updated_at: string
    plant_name: string
    department_name: string
    organization_name: string
  }
  