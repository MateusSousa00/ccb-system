export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface UserResponse {
  user: User
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export enum RiskCategory {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  interestRate: string;
  creditScore: number;
  monthlyIncome: string;
  riskCategory: RiskCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  interestRate: number;
  creditScore: number;
  monthlyIncome: number;
  riskCategory: RiskCategory;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface CustomersListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Simulation types
export enum SimulationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED = 'CONVERTED',
}

export interface InstallmentSchedule {
  id: string;
  simulationId: string;
  installmentNumber: number;
  dueDate: string;
  principal: string;
  interest: string;
  total: string;
  balance: string;
  createdAt: string;
}

export interface Simulation {
  id: string;
  customerId: string;
  createdById: string;
  requestedAmount: string;
  installments: number;
  interestRate: string;
  installmentValue: string;
  totalAmount: string;
  totalInterest: string;
  status: SimulationStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: User;
  schedule?: InstallmentSchedule[];
}

export interface CreateSimulationRequest {
  customerId: string;
  requestedAmount: number;
  installments: number;
}

export interface UpdateSimulationRequest {
  status: SimulationStatus;
}

export interface SimulationsListResponse {
  simulations: Simulation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CustomerFilters extends PaginationParams {
  name?: string;
  cpf?: string;
  riskCategory?: RiskCategory;
}

export interface SimulationFilters extends PaginationParams {
  customerId?: string;
  status?: SimulationStatus;
}
