"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ========== TYPES ==========

// Department
export interface Department {
  id: string;
  name: string;
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateDepartmentDto = Pick<Department, "name"> & { managerId?: string };

// Designation
export interface Designation {
  id: string;
  title: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateDesignationDto = Pick<Designation, "title"> & { level?: string };

// Employee
export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  cnicPassport: string;
  dateOfBirth: string;
  gender?: "Male" | "Female" | "Other";
  departmentId: string;
  designationId: string;
  joiningDate: string;
  employmentType?: "Permanent" | "Contract" | "Daily Wager";
  status?: "Active" | "On Leave" | "Terminated" | "Resigned";
  basicSalary: number;
  bankAccount?: string;
  socialSecurityNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmployeeDto = Omit<Employee, "id" | "createdAt" | "updatedAt">;

// Attendance
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: "Present" | "Absent" | "Late" | "Half-Day";
  overtimeHours?: number;
  remarks?: string;
  createdAt?: string;
}

export type CreateAttendanceDto = Omit<Attendance, "id" | "createdAt">;

// Leave Request
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: "Sick" | "Casual" | "Annual" | "Maternity";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status?: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLeaveRequestDto = Omit<LeaveRequest, "id" | "createdAt" | "updatedAt" | "status" | "approvedBy">;

// ========== API FUNCTIONS ==========

// Departments API
const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get("/hrm/departments");
    return response.data;
  },
  getById: async (id: string): Promise<Department> => {
    const response = await api.get(`/hrm/departments/${id}`);
    return response.data;
  },
  create: async (data: CreateDepartmentDto): Promise<Department> => {
    const response = await api.post("/hrm/departments", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateDepartmentDto>): Promise<Department> => {
    const response = await api.patch(`/hrm/departments/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hrm/departments/${id}`);
  },
};

// Designations API
const designationsApi = {
  getAll: async (): Promise<Designation[]> => {
    const response = await api.get("/hrm/designations");
    return response.data;
  },
  getById: async (id: string): Promise<Designation> => {
    const response = await api.get(`/hrm/designations/${id}`);
    return response.data;
  },
  create: async (data: CreateDesignationDto): Promise<Designation> => {
    const response = await api.post("/hrm/designations", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateDesignationDto>): Promise<Designation> => {
    const response = await api.patch(`/hrm/designations/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hrm/designations/${id}`);
  },
};

// Employees API
const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get("/hrm/employees");
    return response.data;
  },
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/hrm/employees/${id}`);
    return response.data;
  },
  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post("/hrm/employees", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateEmployeeDto>): Promise<Employee> => {
    const response = await api.patch(`/hrm/employees/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hrm/employees/${id}`);
  },
};

// Attendance API
const attendanceApi = {
  getAll: async (): Promise<Attendance[]> => {
    const response = await api.get("/hrm/attendance");
    return response.data;
  },
  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
    const response = await api.post("/hrm/attendance", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateAttendanceDto>): Promise<Attendance> => {
    const response = await api.patch(`/hrm/attendance/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hrm/attendance/${id}`);
  },
};

// Leave Requests API
const leavesApi = {
  getAll: async (): Promise<LeaveRequest[]> => {
    const response = await api.get("/hrm/leaves");
    return response.data;
  },
  create: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post("/hrm/leaves", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateLeaveRequestDto>): Promise<LeaveRequest> => {
    const response = await api.patch(`/hrm/leaves/${id}`, data);
    return response.data;
  },
  approve: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post(`/hrm/leaves/${id}/approve`);
    return response.data;
  },
  reject: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post(`/hrm/leaves/${id}/reject`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hrm/leaves/${id}`);
  },
};

// ========== QUERY KEYS ==========

export const hrmKeys = {
  departments: ["hrm", "departments"] as const,
  designations: ["hrm", "designations"] as const,
  employees: ["hrm", "employees"] as const,
  attendance: ["hrm", "attendance"] as const,
  leaves: ["hrm", "leaves"] as const,
};

// ========== DEPARTMENTS HOOKS ==========

export function useDepartments() {
  return useQuery({
    queryKey: hrmKeys.departments,
    queryFn: departmentsApi.getAll,
    staleTime: 30000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.departments });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDepartmentDto> }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.departments });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.departments });
    },
  });
}

// ========== DESIGNATIONS HOOKS ==========

export function useDesignations() {
  return useQuery({
    queryKey: hrmKeys.designations,
    queryFn: designationsApi.getAll,
    staleTime: 30000,
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDesignationDto) => designationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.designations });
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDesignationDto> }) =>
      designationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.designations });
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.designations });
    },
  });
}

// ========== EMPLOYEES HOOKS ==========

export function useEmployees() {
  return useQuery({
    queryKey: hrmKeys.employees,
    queryFn: employeesApi.getAll,
    staleTime: 30000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [...hrmKeys.employees, id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeDto> }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.employees });
    },
  });
}

// ========== ATTENDANCE HOOKS ==========

export function useAttendance() {
  return useQuery({
    queryKey: hrmKeys.attendance,
    queryFn: attendanceApi.getAll,
    staleTime: 30000,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.attendance });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAttendanceDto> }) =>
      attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.attendance });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.attendance });
    },
  });
}

// ========== LEAVE REQUESTS HOOKS ==========

export function useLeaveRequests() {
  return useQuery({
    queryKey: hrmKeys.leaves,
    queryFn: leavesApi.getAll,
    staleTime: 30000,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => leavesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.leaves });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leavesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.leaves });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leavesApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.leaves });
    },
  });
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leavesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.leaves });
    },
  });
}

// ========== PREFETCH HOOK ==========

export function usePrefetchHRM() {
  const queryClient = useQueryClient();
  return {
    prefetchAll: () => {
      queryClient.prefetchQuery({ queryKey: hrmKeys.departments, queryFn: departmentsApi.getAll });
      queryClient.prefetchQuery({ queryKey: hrmKeys.designations, queryFn: designationsApi.getAll });
      queryClient.prefetchQuery({ queryKey: hrmKeys.employees, queryFn: employeesApi.getAll });
      queryClient.prefetchQuery({ queryKey: hrmKeys.attendance, queryFn: attendanceApi.getAll });
      queryClient.prefetchQuery({ queryKey: hrmKeys.leaves, queryFn: leavesApi.getAll });
    },
  };
}
