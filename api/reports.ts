import axiosInstance from "./axiosInstance"

export interface HospitalReport {
  totalDoctors: number
  totalPatients: number
  totalReceptionists: number
  totalAppointments: number
  totalEarnings: number
  appointmentsOverTime: Array<{ date: string; count: number }>
  earningsOverTime: Array<{ date: string; amount: number }>
}

export interface SystemReport {
  totalHospitals: number
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  totalReceptionists: number
  totalAppointments: number
  totalEarnings: number
  usersByRole: Array<{ role: string; count: number }>
  hospitalsOverTime: Array<{ date: string; count: number }>
}

export const getHospitalReport = async (hospitalId: string): Promise<HospitalReport> => {
  const response = await axiosInstance.get(`/reports/hospital/${hospitalId}`)
  return response.data
}

export const getSystemReport = async (): Promise<SystemReport> => {
  const response = await axiosInstance.get("/reports/system")
  return response.data
}
