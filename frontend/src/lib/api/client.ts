// API client for Neo4j-based Public and Admin APIs

import { 
  type Usuario, 
  type Artista, 
  type Cancion, 
  type Fabrica, 
  type Tematica, 
  type Jingle, 
  type SchemaInfo, 
  type Relationship, 
  type EntityRelationships
} from '../../types';
import { retryWithBackoff } from '../utils/retry';

const API_BASE = '/api';

/**
 * Standardized API error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

/**
 * Parse API error from various formats (backend response, fetch error, etc.)
 * Returns a standardized error structure
 */
export function parseApiError(error: unknown, response?: Response): ApiError {
  // Handle objects with error property (common backend format)
  // This is the primary format from our backend: { error: string, code?: string, details?: unknown }
  if (error && typeof error === 'object' && 'error' in error) {
    const err = error as { error: string; code?: string; details?: unknown };
    return {
      message: err.error,
      code: err.code,
      details: err.details,
      status: response?.status,
    };
  }

  // Handle Response object - try to extract error from response
  if (response) {
    // If error is already parsed JSON, use it
    if (error && typeof error === 'object' && 'error' in error) {
      const err = error as { error: string; code?: string; details?: unknown };
      return {
        message: err.error,
        code: err.code,
        details: err.details,
        status: response.status,
      };
    }
    // Fallback to status text
    return {
      message: `API Error: ${response.status} ${response.statusText}`,
      status: response.status,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Try to parse JSON error message if it looks like JSON
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error) {
        return {
          message: parsed.error,
          code: parsed.code,
          details: parsed.details,
        };
      }
    } catch {
      // Not JSON, use error message as-is
    }

    return {
      message: error.message || 'Unknown error',
      code: error.name,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Fallback
  return {
    message: 'Unknown error occurred',
  };
}

// Public API client (read-only)
export class PublicApiClient {
  private baseUrl = `${API_BASE}/public`;

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      // Try to extract error message from response body
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'error' in errorData) {
          errorMessage = errorData.error;
        }
      } catch {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Entity endpoints
  async getUsuarios(): Promise<Usuario[]> {
    return this.get<Usuario[]>('/usuarios');
  }

  async getUsuario(id: string): Promise<Usuario> {
    return this.get<Usuario>(`/usuarios/${id}`);
  }

  async getArtistas(): Promise<Artista[]> {
    return this.get<Artista[]>('/artistas');
  }

  async getArtista(id: string): Promise<Artista> {
    return this.get<Artista>(`/artistas/${id}`);
  }

  async getCanciones(): Promise<Cancion[]> {
    return this.get<Cancion[]>('/canciones');
  }

  async getCancion(id: string): Promise<Cancion> {
    return this.get<Cancion>(`/canciones/${id}`);
  }

  async getFabricas(): Promise<Fabrica[]> {
    return this.get<Fabrica[]>('/fabricas');
  }

  async getFabrica(id: string): Promise<Fabrica> {
    return this.get<Fabrica>(`/fabricas/${id}`);
  }

  async getLatestFabrica(): Promise<Fabrica> {
    return this.get<Fabrica>('/fabricas/latest');
  }

  async getFabricaJingles(id: string): Promise<Jingle[]> {
    const response = await this.get<Jingle[] | { jingles?: Jingle[]; data?: Jingle[] }>(`/fabricas/${id}/jingles`);
    // Handle different response formats
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object' && 'jingles' in response && Array.isArray(response.jingles)) {
      return response.jingles;
    }
    if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  async getTematicas(): Promise<Tematica[]> {
    return this.get<Tematica[]>('/tematicas');
  }

  async getTematica(id: string): Promise<Tematica> {
    return this.get<Tematica>(`/tematicas/${id}`);
  }

  async getJingles(): Promise<Jingle[]> {
    return this.get<Jingle[]>('/jingles');
  }

  async getJingle(id: string): Promise<Jingle> {
    return this.get<Jingle>(`/jingles/${id}`);
  }

  // Relationship endpoints
  async getRelationships(): Promise<Relationship[]> {
    return this.get<Relationship[]>('/relationships');
  }

  async getRelationshipsByType(relType: string): Promise<Relationship[]> {
    return this.get<Relationship[]>(`/relationships/${relType}`);
  }

  async getEntityRelationships(type: string, id: string): Promise<EntityRelationships> {
    return this.get<EntityRelationships>(`/entities/${type}/${id}/relationships`);
  }

  // Related entities endpoints
  async getJingleRelated(
    id: string,
    limit?: number,
    types?: string[]
  ): Promise<{
    sameJinglero?: Jingle[];
    sameCancion?: Jingle[];
    sameTematica?: Array<{ jingle: Jingle; sharedTematicas?: string[] }>;
    meta?: { limit: number; types: string[] };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (types && types.length > 0) params.append('types', types.join(','));
    const query = params.toString();
    return this.get<{
      sameJinglero?: Jingle[];
      sameCancion?: Jingle[];
      sameTematica?: Array<{ jingle: Jingle; sharedTematicas?: string[] }>;
      meta?: { limit: number; types: string[] };
    }>(`/entities/jingles/${id}/related${query ? `?${query}` : ''}`);
  }

  async getCancionRelated(
    id: string,
    limit?: number
  ): Promise<{
    jinglesUsingCancion?: Jingle[];
    otherCancionesByAutor?: Cancion[];
    jinglesByAutorIfJinglero?: Jingle[];
    meta?: { limit: number };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    const query = params.toString();
    return this.get<{
      jinglesUsingCancion?: Jingle[];
      otherCancionesByAutor?: Cancion[];
      jinglesByAutorIfJinglero?: Jingle[];
      meta?: { limit: number };
    }>(`/entities/canciones/${id}/related${query ? `?${query}` : ''}`);
  }

  async getArtistaRelated(
    id: string,
    limit?: number
  ): Promise<{
    cancionesByAutor?: Cancion[];
    jinglesByJinglero?: Jingle[];
    meta?: { limit: number };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    const query = params.toString();
    return this.get<{
      cancionesByAutor?: Cancion[];
      jinglesByJinglero?: Jingle[];
      meta?: { limit: number };
    }>(`/entities/artistas/${id}/related${query ? `?${query}` : ''}`);
  }

  async getTematicaRelated(
    id: string,
    limit?: number
  ): Promise<{
    jingles?: Jingle[];
    meta?: { limit: number };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    const query = params.toString();
    return this.get<{
      jingles?: Jingle[];
      meta?: { limit: number };
    }>(`/entities/tematicas/${id}/related${query ? `?${query}` : ''}`);
  }

  // Schema introspection
  async getSchema(): Promise<SchemaInfo> {
    return this.get<SchemaInfo>('/schema');
  }
}

// Admin API client (read-write)
export class AdminApiClient extends PublicApiClient {
  private adminBaseUrl = `${API_BASE}/admin`;
  private tokenKey = 'adminToken';

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store authentication token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Remove authentication token from localStorage
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Get headers with authentication token if available
   */
  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    // Check online status before making request
    if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
      const offlineError = new Error('Sin conexión a internet. Verifica tu conexión.');
      (offlineError as any).code = 'OFFLINE';
      throw offlineError;
    }

    return retryWithBackoff(async () => {
      const token = this.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        const response = await fetch(`${this.adminBaseUrl}${endpoint}`, {
          headers,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          const apiError = parseApiError(errorData, response);
          const error = new Error(apiError.message);
          (error as any).code = apiError.code;
          (error as any).details = apiError.details;
          (error as any).status = apiError.status;
          throw error;
        }
        return response.json();
      } catch (error) {
        // Re-throw if already an Error with our format
        if (error instanceof Error && (error as any).code !== undefined) {
          throw error;
        }
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
        // Re-throw other errors
        throw error;
      }
    });
  }

  async post<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    // Check online status before making request
    if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
      const offlineError = new Error('Sin conexión a internet. Verifica tu conexión.');
      (offlineError as any).code = 'OFFLINE';
      throw offlineError;
    }

    return retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.adminBaseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(includeAuth),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          const apiError = parseApiError(errorData, response);
          const error = new Error(apiError.message);
          (error as any).code = apiError.code;
          (error as any).details = apiError.details;
          (error as any).status = apiError.status;
          throw error;
        }
        return response.json();
      } catch (error) {
        // Re-throw if already an Error with our format
        if (error instanceof Error && (error as any).code !== undefined) {
          throw error;
        }
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
        // Re-throw other errors
        throw error;
      }
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    // Check online status before making request
    if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
      const offlineError = new Error('Sin conexión a internet. Verifica tu conexión.');
      (offlineError as any).code = 'OFFLINE';
      throw offlineError;
    }

    // Detect NaN values before sending
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && isNaN(value)) {
          console.error(`NaN detected in field: ${key}`, data);
          throw new Error(`Invalid data: field "${key}" has NaN value`);
        }
      }
    }

    return retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.adminBaseUrl}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          const apiError = parseApiError(errorData, response);
          const error = new Error(apiError.message);
          (error as any).code = apiError.code;
          (error as any).details = apiError.details;
          (error as any).status = apiError.status;
          throw error;
        }
        return response.json();
      } catch (error) {
        // Re-throw if already an Error with our format
        if (error instanceof Error && (error as any).code !== undefined) {
          throw error;
        }
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
        // Re-throw other errors
        throw error;
      }
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    // Check online status before making request
    if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
      const offlineError = new Error('Sin conexión a internet. Verifica tu conexión.');
      (offlineError as any).code = 'OFFLINE';
      throw offlineError;
    }

    // Detect NaN values before sending
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && isNaN(value)) {
          console.error(`NaN detected in field: ${key}`, data);
          throw new Error(`Invalid data: field "${key}" has NaN value`);
        }
      }
    }

    return retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.adminBaseUrl}${endpoint}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          const apiError = parseApiError(errorData, response);
          const error = new Error(apiError.message);
          (error as any).code = apiError.code;
          (error as any).details = apiError.details;
          (error as any).status = apiError.status;
          throw error;
        }
        return response.json();
      } catch (error) {
        // Re-throw if already an Error with our format
        if (error instanceof Error && (error as any).code !== undefined) {
          throw error;
        }
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
        // Re-throw other errors
        throw error;
      }
    });
  }

  async delete<T>(endpoint: string, body?: any): Promise<T> {
    // Check online status before making request
    if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
      const offlineError = new Error('Sin conexión a internet. Verifica tu conexión.');
      (offlineError as any).code = 'OFFLINE';
      throw offlineError;
    }

    return retryWithBackoff(async () => {
      const token = this.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (body) {
        headers['Content-Type'] = 'application/json';
      }
      
      try {
        const response = await fetch(`${this.adminBaseUrl}${endpoint}`, {
          method: 'DELETE',
          headers,
          ...(body && { body: JSON.stringify(body) }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          const apiError = parseApiError(errorData, response);
          const error = new Error(apiError.message);
          (error as any).code = apiError.code;
          (error as any).details = apiError.details;
          (error as any).status = apiError.status;
          throw error;
        }
        return response.json();
      } catch (error) {
        // Re-throw if already an Error with our format
        if (error instanceof Error && (error as any).code !== undefined) {
          throw error;
        }
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
        // Re-throw other errors
        throw error;
      }
    });
  }

  // Authentication methods
  async login(password: string): Promise<{ success: boolean; token: string; expiresIn: string }> {
    const result = await this.post<{ success: boolean; token: string; expiresIn: string }>(
      '/login',
      { password },
      false // Don't include auth token for login
    );
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.post<{ success: boolean; message: string }>('/logout', {});
      this.clearToken();
      return result;
    } catch (error) {
      // Clear token even if logout request fails
      this.clearToken();
      throw error;
    }
  }

  async getAuthStatus(): Promise<{ authenticated: boolean }> {
    return this.get<{ authenticated: boolean }>('/status');
  }

  // Entity CRUD operations
  async createUsuario(data: Partial<Usuario>): Promise<Usuario> {
    return this.post<Usuario>('/usuarios', data);
  }

  async updateUsuario(id: string, data: Partial<Usuario>): Promise<Usuario> {
    return this.put<Usuario>(`/usuarios/${id}`, data);
  }

  async patchUsuario(id: string, data: Partial<Usuario>): Promise<Usuario> {
    return this.patch<Usuario>(`/usuarios/${id}`, data);
  }

  async deleteUsuario(id: string): Promise<void> {
    return this.delete<void>(`/usuarios/${id}`);
  }

  async createArtista(data: Partial<Artista>): Promise<Artista> {
    return this.post<Artista>('/artistas', data);
  }

  async updateArtista(id: string, data: Partial<Artista>): Promise<Artista> {
    return this.put<Artista>(`/artistas/${id}`, data);
  }

  async patchArtista(id: string, data: Partial<Artista>): Promise<Artista> {
    return this.patch<Artista>(`/artistas/${id}`, data);
  }

  async deleteArtista(id: string): Promise<void> {
    return this.delete<void>(`/artistas/${id}`);
  }

  async createCancion(data: Partial<Cancion>): Promise<Cancion> {
    return this.post<Cancion>('/canciones', data);
  }

  async updateCancion(id: string, data: Partial<Cancion>): Promise<Cancion> {
    return this.put<Cancion>(`/canciones/${id}`, data);
  }

  async patchCancion(id: string, data: Partial<Cancion>): Promise<Cancion> {
    return this.patch<Cancion>(`/canciones/${id}`, data);
  }

  async deleteCancion(id: string): Promise<void> {
    return this.delete<void>(`/canciones/${id}`);
  }

  async createFabrica(data: Partial<Fabrica>): Promise<Fabrica> {
    return this.post<Fabrica>('/fabricas', data);
  }

  async updateFabrica(id: string, data: Partial<Fabrica>): Promise<Fabrica> {
    return this.put<Fabrica>(`/fabricas/${id}`, data);
  }

  async patchFabrica(id: string, data: Partial<Fabrica>): Promise<Fabrica> {
    return this.patch<Fabrica>(`/fabricas/${id}`, data);
  }

  async deleteFabrica(id: string): Promise<void> {
    return this.delete<void>(`/fabricas/${id}`);
  }

  async createTematica(data: Partial<Tematica>): Promise<Tematica> {
    return this.post<Tematica>('/tematicas', data);
  }

  async updateTematica(id: string, data: Partial<Tematica>): Promise<Tematica> {
    return this.put<Tematica>(`/tematicas/${id}`, data);
  }

  async patchTematica(id: string, data: Partial<Tematica>): Promise<Tematica> {
    return this.patch<Tematica>(`/tematicas/${id}`, data);
  }

  async deleteTematica(id: string): Promise<void> {
    return this.delete<void>(`/tematicas/${id}`);
  }

  async createJingle(data: Partial<Jingle>): Promise<Jingle> {
    return this.post<Jingle>('/jingles', data);
  }

  async updateJingle(id: string, data: Partial<Jingle>): Promise<Jingle> {
    return this.put<Jingle>(`/jingles/${id}`, data);
  }

  async patchJingle(id: string, data: Partial<Jingle>): Promise<Jingle> {
    return this.patch<Jingle>(`/jingles/${id}`, data);
  }

  async deleteJingle(id: string): Promise<void> {
    return this.delete<void>(`/jingles/${id}`);
  }

  // Relationship CRUD operations
  async createRelationship(data: {
    start: string;
    end: string;
    type: string;
    properties?: Record<string, any>;
  }): Promise<Relationship> {
    return this.post<Relationship>('/relationships', data);
  }

  async updateRelationship(relType: string, start: string, end: string, properties: Record<string, any>): Promise<any> {
    return this.put<any>(`/relationships/${relType}`, {
      start,
      end,
      ...properties,
    });
  }

  async deleteRelationship(relType: string, start: string, end: string): Promise<void> {
    return this.delete<void>(`/relationships/${relType}`, { start, end });
  }

  // Schema management
  async addPropertyToEntity(entityType: string, propertyName: string, propertyType: string = 'string'): Promise<void> {
    return this.post<void>('/schema/properties', { entityType, propertyName, propertyType });
  }

  async createRelationshipType(relType: string, startLabel: string, endLabel: string): Promise<void> {
    return this.post<void>('/schema/relationships', { relType, startLabel, endLabel });
  }

  async createConstraint(constraintName: string, constraintType: 'unique' | 'not_null' | 'exists', entityType: string, propertyName: string): Promise<void> {
    return this.post<void>('/schema/constraints', { constraintName, constraintType, entityType, propertyName });
  }

  async dropConstraint(constraintName: string): Promise<void> {
    return this.delete<void>(`/schema/constraints/${constraintName}`);
  }

  // Validation methods
  async validateEntity(type: string, id: string): Promise<{
    entityType: string;
    entityId: string;
    issues: Array<{
      type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
      severity: 'error' | 'warning';
      entityType: string;
      entityId: string;
      relationshipType?: string;
      targetEntityId?: string;
      message: string;
      fixable: boolean;
      fixAction?: {
        type: 'update_redundant_property' | 'delete_duplicate_relationship';
        description: string;
      };
    }>;
    isValid: boolean;
  }> {
    return this.post<{
      entityType: string;
      entityId: string;
      issues: Array<{
        type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
        severity: 'error' | 'warning';
        entityType: string;
        entityId: string;
        relationshipType?: string;
        targetEntityId?: string;
        message: string;
        fixable: boolean;
        fixAction?: {
          type: 'update_redundant_property' | 'delete_duplicate_relationship';
          description: string;
        };
      }>;
      isValid: boolean;
    }>(`/validate/entity/${type}/${id}`, {});
  }

  async validateAllEntities(type: string): Promise<{
    entityType: string;
    results: Array<{
      entityType: string;
      entityId: string;
      issues: Array<{
        type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
        severity: 'error' | 'warning';
        entityType: string;
        entityId: string;
        relationshipType?: string;
        targetEntityId?: string;
        message: string;
        fixable: boolean;
        fixAction?: {
          type: 'update_redundant_property' | 'delete_duplicate_relationship';
          description: string;
        };
      }>;
      isValid: boolean;
    }>;
    totalEntities: number;
    entitiesWithIssues: number;
    totalIssues: number;
  }> {
    return this.post<{
      entityType: string;
      results: Array<{
        entityType: string;
        entityId: string;
        issues: Array<{
          type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
          severity: 'error' | 'warning';
          entityType: string;
          entityId: string;
          relationshipType?: string;
          targetEntityId?: string;
          message: string;
          fixable: boolean;
          fixAction?: {
            type: 'update_redundant_property' | 'delete_duplicate_relationship';
            description: string;
          };
        }>;
        isValid: boolean;
      }>;
      totalEntities: number;
      entitiesWithIssues: number;
      totalIssues: number;
    }>(`/validate/entity/${type}`, {});
  }

  async validateRelationship(relType: string, start: string, end: string): Promise<{
    relationshipType: string;
    startEntityId: string;
    endEntityId: string;
    issues: Array<{
      type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
      severity: 'error' | 'warning';
      entityType: string;
      entityId: string;
      relationshipType?: string;
      targetEntityId?: string;
      message: string;
      fixable: boolean;
      fixAction?: {
        type: 'update_redundant_property' | 'delete_duplicate_relationship';
        description: string;
      };
    }>;
    isValid: boolean;
  }> {
    return this.post<{
      relationshipType: string;
      startEntityId: string;
      endEntityId: string;
      issues: Array<{
        type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
        severity: 'error' | 'warning';
        entityType: string;
        entityId: string;
        relationshipType?: string;
        targetEntityId?: string;
        message: string;
        fixable: boolean;
        fixAction?: {
          type: 'update_redundant_property' | 'delete_duplicate_relationship';
          description: string;
        };
      }>;
      isValid: boolean;
    }>(`/validate/relationship/${relType}`, { start, end });
  }

  async fixValidationIssue(issue: {
    type: 'duplicate_relationship' | 'invalid_target' | 'redundant_field_mismatch';
    severity: 'error' | 'warning';
    entityType: string;
    entityId: string;
    relationshipType?: string;
    targetEntityId?: string;
    message: string;
    fixable: boolean;
    fixAction?: {
      type: 'update_redundant_property' | 'delete_duplicate_relationship';
      description: string;
    };
  }): Promise<{ success: boolean; message: string; issue: typeof issue }> {
    return this.post<{ success: boolean; message: string; issue: typeof issue }>('/validate/fix', { issue });
  }
}

// Export singleton instances
export const publicApi = new PublicApiClient();
export const adminApi = new AdminApiClient();

// Legacy API compatibility (for gradual migration)
export const api = {
  get: async (endpoint: string, options?: any) => {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};