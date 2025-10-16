const API_BASE_URL = 'https://finanzas-personales-backend.clvrt.workers.dev';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    context?: any[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    email: string;
    nombre_completo: string;
    tipo_permiso: 'lectura' | 'escritura';
    cuenta_maestra: {
      id: string;
      nombre: string;
    };
  };
}

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  fotoUrl?: string;
  tipoPermiso: 'lectura' | 'escritura';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: string;
  cuentaMaestraId: string;
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  icono: string;
  color: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cuenta {
  id: string;
  cuentaMaestraId: string;
  nombre: string;
  saldo: number;
  tipo: string;
  color: string;
  icono: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  fecha: string;
  notas?: string;
  fotoComprobanteUrl?: string;
  createdAt: string;
  categoria: {
    id: string;
    nombre: string;
    tipo: 'ingreso' | 'gasto';
    icono: string;
    color: string;
  };
  cuenta: {
    id: string;
    nombre: string;
    tipo: string;
    color: string;
    icono: string;
  };
}

export interface TransaccionesResponse {
  transacciones: Transaccion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ResumenFinanciero {
  periodo: string;
  total_ingresos: number;
  total_gastos: number;
  saldo_neto: number;
  promedio_mensual: number;
  meses_analizados: number;
  saldo_total_cuentas: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Recuperar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Función para probar la conectividad
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
      });
      return response.ok;
    } catch (error) {
      console.error('🔴 Prueba de conectividad falló:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        ...options,
        headers,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      // Verificar si la respuesta es válida
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
          // Token inválido, limpiar localStorage
          this.logout();
          throw new Error('Sesión expirada');
        }

        if (response.status === 0 || response.status >= 500) {
          throw new Error('Error de conexión con el servidor');
        }

        // Intentar obtener el error del servidor
        try {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Error HTTP ${response.status}`);
        } catch {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;

    } catch (error) {
      console.error('💥 Request failed:', {
        url,
        method: options.method || 'GET',
        error: error.message,
        stack: error.stack
      });

      // Proporcionar mensajes de error más descriptivos
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('No se puede conectar al servidor. Verifica tu conexión a internet o contacta al administrador.');
      }

      if (error.message.includes('CORS')) {
        throw new Error('Error de configuración del servidor (CORS). Contacta al administrador.');
      }

      throw error;
    }
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.usuario));
      }
      return response.data;
    } else {
      throw new Error(response.error?.message || 'Error en login');
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): LoginResponse['usuario'] | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Usuarios
  async getUsuarios(): Promise<Usuario[]> {
    const response = await this.request<Usuario[]>('/usuarios');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener usuarios');
  }

  // Categorías
  async getCategorias(tipo?: 'ingreso' | 'gasto'): Promise<Categoria[]> {
    const queryParam = tipo ? `?tipo=${tipo}` : '';
    const response = await this.request<Categoria[]>(`/categorias${queryParam}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener categorías');
  }

  async createCategoria(categoria: {
    nombre: string;
    tipo: 'ingreso' | 'gasto';
    icono: string;
    color: string;
  }): Promise<Categoria> {
    const response = await this.request<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al crear categoría');
  }

  async updateCategoria(id: string, categoria: {
    nombre: string;
    tipo: 'ingreso' | 'gasto';
    icono: string;
    color: string;
  }): Promise<Categoria> {
    const response = await this.request<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoria),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al actualizar categoría');
  }

  async deleteCategoria(id: string): Promise<void> {
    const response = await this.request<void>(`/categorias/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Error al eliminar categoría');
    }
  }

  // Cuentas
  async getCuentas(): Promise<Cuenta[]> {
    const response = await this.request<Cuenta[]>('/cuentas');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener cuentas');
  }

  // Transacciones
  async getTransacciones(params?: {
    page?: number;
    limit?: number;
    tipo?: 'ingreso' | 'gasto';
    categoria_id?: string;
    cuenta_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<TransaccionesResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transacciones?${queryString}` : '/transacciones';

    const response = await this.request<TransaccionesResponse>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener transacciones');
  }

  async createTransaccion(transaccion: {
    tipo: 'ingreso' | 'gasto';
    monto: number;
    categoria_id: string;
    cuenta_id: string;
    fecha: string;
    notas?: string;
    foto_comprobante_url?: string;
  }): Promise<Transaccion> {
    const response = await this.request<Transaccion>('/transacciones', {
      method: 'POST',
      body: JSON.stringify(transaccion),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al crear transacción');
  }

  async updateTransaccion(id: string, transaccion: {
    tipo: 'ingreso' | 'gasto';
    monto: number;
    categoria_id: string;
    cuenta_id: string;
    fecha: string;
    notas?: string;
    foto_comprobante_url?: string;
  }): Promise<Transaccion> {
    const response = await this.request<Transaccion>(`/transacciones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(transaccion),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al actualizar transacción');
  }

  async deleteTransaccion(id: string): Promise<void> {
    const response = await this.request<void>(`/transacciones/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Error al eliminar transacción');
    }
  }

  // Reportes
  async getResumenFinanciero(anio?: number, mes?: number): Promise<ResumenFinanciero> {
    const queryParams = new URLSearchParams();
    if (anio) queryParams.append('anio', anio.toString());
    if (mes) queryParams.append('mes', mes.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reportes/resumen?${queryString}` : '/reportes/resumen';

    const response = await this.request<ResumenFinanciero>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener resumen financiero');
  }

  async getGastosPorCategoria(anio?: number, mes?: number): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (anio) queryParams.append('anio', anio.toString());
    if (mes) queryParams.append('mes', mes.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reportes/gastos-categoria?${queryString}` : '/reportes/gastos-categoria';

    const response = await this.request<any[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener gastos por categoría');
  }

  async getIngresosPorCategoria(anio?: number, mes?: number): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (anio) queryParams.append('anio', anio.toString());
    if (mes) queryParams.append('mes', mes.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reportes/ingresos-categoria?${queryString}` : '/reportes/ingresos-categoria';

    const response = await this.request<any[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener ingresos por categoría');
  }

  async getSaldoCuentas(): Promise<any[]> {
    const response = await this.request<any[]>('/reportes/saldo-cuentas');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener saldo por cuentas');
  }

  async getEvolucionMensual(anio?: number): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (anio) queryParams.append('anio', anio.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reportes/evolucion-mensual?${queryString}` : '/reportes/evolucion-mensual';

    const response = await this.request<any[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Error al obtener evolución mensual');
  }
}

export const apiClient = new ApiClient();