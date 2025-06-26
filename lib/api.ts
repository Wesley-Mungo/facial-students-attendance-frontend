const API_BASE_URL = 'http://localhost:8000/api/v1'

interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, success: true }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false,
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    username: string
    email: string
    password: string
    role: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Student endpoints
  async getStudents() {
    return this.request('/students/')
  }

  async createStudent(studentData: {
    student_id: string
    name: string
    email: string
    department: string
    level: number
  }) {
    return this.request('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    })
  }

  async updateStudent(id: number, studentData: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    })
  }

  async deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    })
  }

  // Course endpoints
  async getCourses() {
    return this.request('/courses/')
  }

  async createCourse(courseData: {
    course_code: string
    name: string
    session: string
    lecturer_id?: number
  }) {
    return this.request('/courses/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    })
  }

  // Attendance endpoints
  async getAttendanceRecords() {
    return this.request('/attendance/')
  }

  async getAttendanceSummary() {
    return this.request('/attendance/summary')
  }

  // Lecturer endpoints
  async getLecturers() {
    return this.request('/auth/admin/lecturers')
  }
}

export const apiService = new ApiService() 