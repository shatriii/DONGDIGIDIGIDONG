/**
 * Thin fetch wrapper for the ticket-backend API.
 *
 * All requests go through Vite's dev proxy at /api (see vite.config.ts),
 * so calls are same-origin and the httpOnly session cookie set by
 * /api/auth/login is sent automatically with `credentials: "include"`.
 */

export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. empty 204) — that's fine
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status, body?.detail);
  }

  return body as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export type Role = "admin" | "organizer" | "governor";

export interface Session {
  id: string;
  email: string;
  role: Role;
}

export function login(email: string, password: string) {
  return request<{ message: string; role: Role; id: string; email: string; name?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getSession() {
  return request<Session>("/auth/me");
}

// ─── Tickets ───────────────────────────────────────────────────────────────
export interface GenerateTicketResult {
  message: string;
  ticketid: string;
  tx_hash: string;
  qr_code: string; // data URL, for on-screen preview only
}

export function generateTicket(userid: string, eventname: string) {
  return request<GenerateTicketResult>("/tickets/generate", {
    method: "POST",
    body: JSON.stringify({ userid, eventname }),
  });
}

export interface BatchResult {
  message: string;
  results: Array<{ userid: string; ticketid: string; tx_hash: string; email: string; qr_code: string; status: string }>;
  errors: Array<{ userid: string; error: string }>;
}

export function generateBatchTickets(userids: string[], eventname: string) {
  return request<BatchResult>("/tickets/generate-batch", {
    method: "POST",
    body: JSON.stringify({ userids, eventname }),
  });
}

export interface ValidateResult {
  valid: boolean;
  ticketid?: string;
  tx_hash?: string;
  message?: string;
  reason?: string;
  details?: {
    studentname?: string;
    eventname?: string;
    course?: string;
  } | null;
}

// `qrcode` must be the raw text decoded from the QR (the encrypted
// payload) — not an image. See ticketController.js: tickets are looked
// up by that exact string.
export function validateTicket(qrcode: string, organizerid: string, scannerid?: string) {
  return request<ValidateResult>("/tickets/validate", {
    method: "POST",
    body: JSON.stringify({ qrcode, organizerid, scannerid }),
  });
}

export function getAllTickets() {
  return request<{ tickets: Array<{ ticketid: string; status: string; datecreated: string }> }>("/tickets");
}

export interface TicketDetail {
  ticketid: string;
  status: string;
  datecreated: string;
  details: { studentname?: string; eventname?: string; course?: string } | null;
  qr_code: string | null;
}

export function getTicketById(ticketid: string) {
  return request<TicketDetail>(`/tickets/${encodeURIComponent(ticketid)}`);
}

export function resendTicketEmail(userid: string) {
  return request<{ message: string }>("/tickets/resend", {
    method: "POST",
    body: JSON.stringify({ userid }),
  });
}

// ─── Students ──────────────────────────────────────────────────────────────
export interface Student {
  userid: string;
  name: string;
  email: string;
  course: string;
  hasTicket: boolean;
  ticketid: string | null;
}

export function getAllStudents() {
  return request<{ students: Student[] }>("/students");
}
