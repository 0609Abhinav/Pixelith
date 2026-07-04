import axios from 'axios';
import type { LoginResponse, SearchResults, SeoMeta, SiteData } from './types';

const client = axios.create({
  baseURL: '/api',
  timeout: 12000,
});

export async function fetchSite(): Promise<SiteData> {
  const { data } = await client.get<SiteData>('/site');
  return data;
}

export async function fetchSeo(pathname: string): Promise<SeoMeta> {
  const { data } = await client.get<SeoMeta>('/seo', { params: { path: pathname } });
  return data;
}

export async function searchContent(query: string): Promise<SearchResults> {
  const { data } = await client.get<SearchResults>('/search', { params: { q: query } });
  return data;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function submitBooking(payload: {
  name: string;
  email: string;
  phone?: string;
  package: string;
  preferredDate?: string;
  message?: string;
}) {
  const { data } = await client.post('/bookings', payload);
  return data;
}

export async function submitContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { data } = await client.post('/contact', payload);
  return data;
}

export async function fetchAdminSummary(token: string) {
  const { data } = await client.get('/admin/summary', { params: { token } });
  return data;
}
