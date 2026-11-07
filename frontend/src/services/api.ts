import {
  Incident, User, InvestigationResponse, CompareMemoryResponse,
  BankHealth, MemoryExplorerItem, AnalyticsOverview, Severity, IncidentStatus
} from '../types';

const API_BASE = 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('recallx_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('recallx_token', token);
    } else {
      localStorage.removeItem('recallx_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errMessage = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          errMessage = errData.detail || errData.message || errMessage;
        } catch {
          // ignore parsing error
        }
        throw new Error(errMessage);
      }
      return (await response.json()) as T;
    } catch (err: any) {
      console.error(`API Request Failed: ${endpoint}`, err);
      throw err;
    }
  }

  // --- Auth ---
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(payload: { email: string; full_name: string; password: string; role?: string }) {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Incidents ---
  async getIncidents(params: {
    status?: string;
    severity?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<{ total: number; items: Incident[] }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.severity && params.severity !== 'all') query.set('severity', params.severity);
    if (params.search) query.set('search', params.search);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    const qs = query.toString();
    return this.request<{ total: number; items: Incident[] }>(`/incidents/${qs ? `?${qs}` : ''}`);
  }

  async getIncident(id: string): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}`);
  }

  async createIncident(incident: Partial<Incident>): Promise<Incident> {
    return this.request<Incident>('/incidents/', {
      method: 'POST',
      body: JSON.stringify(incident)
    });
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteIncident(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/incidents/${id}`, {
      method: 'DELETE'
    });
  }

  async verifyResolution(id: string, payload: {
    verified_resolution: string;
    root_cause?: string;
    resolution_steps?: string;
    retain_to_hindsight?: boolean;
  }): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async addTimelineNote(id: string, message: string, type: string = 'note'): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}/timeline`, {
      method: 'POST',
      body: JSON.stringify({ timestamp: new Date().toISOString(), author: 'User', message, type })
    });
  }

  async uploadLogFile(incidentId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/incidents/${incidentId}/upload-logs`, {
      method: 'POST',
      body: formData
    });
  }

  // --- Investigation ---
  async startInvestigation(incidentId: string, withMemory: boolean = true, customQuery?: string): Promise<InvestigationResponse> {
    return this.request<InvestigationResponse>('/investigation/start', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, with_memory: withMemory, custom_query: customQuery })
    });
  }

  async sendInvestigationMessage(incidentId: string, message: string, withMemory: boolean = true): Promise<InvestigationResponse> {
    return this.request<InvestigationResponse>('/investigation/message', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, message, with_memory: withMemory })
    });
  }

  async compareMemory(incidentId: string): Promise<CompareMemoryResponse> {
    return this.request<CompareMemoryResponse>('/investigation/compare', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId })
    });
  }

  async generatePostmortem(incidentId: string): Promise<{ incident_id: string; title: string; postmortem_markdown: string }> {
    return this.request<{ incident_id: string; title: string; postmortem_markdown: string }>(`/investigation/${incidentId}/postmortem`, {
      method: 'POST'
    });
  }

  // --- Hindsight Memory ---
  async getHindsightHealth(): Promise<BankHealth> {
    return this.request<BankHealth>('/hindsight/health');
  }

  async retainMemory(content: string, tags?: string[], bankId?: string): Promise<any> {
    return this.request('/hindsight/retain', {
      method: 'POST',
      body: JSON.stringify({ content, tags, bank_id: bankId })
    });
  }

  async recallMemory(query: string, budget: string = 'mid', tags?: string[]): Promise<any> {
    return this.request('/hindsight/recall', {
      method: 'POST',
      body: JSON.stringify({ query, budget, tags })
    });
  }

  async reflectMemory(query: string, budget: string = 'low'): Promise<any> {
    return this.request('/hindsight/reflect', {
      method: 'POST',
      body: JSON.stringify({ query, budget })
    });
  }

  async getMemoryLogs(limit: number = 25): Promise<any[]> {
    return this.request<any[]>(`/hindsight/logs?limit=${limit}`);
  }

  async exploreMemoryBank(search?: string, filterType?: string): Promise<{ bank_id: string; total: number; memories: MemoryExplorerItem[] }> {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (filterType && filterType !== 'all') query.set('filter_type', filterType);
    const qs = query.toString();
    return this.request<{ bank_id: string; total: number; memories: MemoryExplorerItem[] }>(`/hindsight/explorer${qs ? `?${qs}` : ''}`);
  }

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/analytics/overview');
  }

  // --- Workspace & Team ---
  async getSettings(): Promise<any> {
    return this.request('/workspace/settings');
  }

  async updateSettings(payload: any): Promise<any> {
    return this.request('/workspace/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getTeam(): Promise<User[]> {
    return this.request<User[]>('/workspace/team');
  }

  // --- Export ---
  getPdfDownloadUrl(incidentId: string): string {
    return `${API_BASE}/export/incident/${incidentId}/pdf`;
  }
}

export const api = new ApiService();
