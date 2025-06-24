// Interfaces para respuestas de la API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filtros específicos para servicios
  activo?: boolean;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tanda?: string;
  turnoId?: number;
  incluirDias?: boolean;
  incluirExcepciones?: boolean;
}

export interface PaginationResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Clase helper para crear respuestas consistentes
export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string): ApiResponse {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    totalElements: number,
    message?: string,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalElements / limit);

    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        totalElements,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}
