/**
 * Generate a blockchain-style ticket ID using SHA-256 hash
 * Format: TKT-[first 12 chars of hash]
 */
export async function generateBlockchainTicketId(eventId: string): Promise<string> {
  const timestamp = Date.now().toString();
  const randomSalt = Math.random().toString(36).substring(2, 15);
  const data = `${eventId}-${timestamp}-${randomSalt}`;

  // Generate SHA-256 hash
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Return first 12 characters as ticket ID
  return `TKT-${hashHex.substring(0, 12).toUpperCase()}`;
}

/**
 * Ticket status types
 */
export type TicketStatus = 'valid' | 'used' | 'invalid';

/**
 * Ticket interface
 */
export interface Ticket {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  status: TicketStatus;
  generatedAt: number;
  scannedAt?: number;
  qrData: string;

  // ✅ ADD THESE
  ticketType: string;
  college: string;
}

/**
 * Generate QR data for a ticket (without student name for privacy)
 */
export function generateQRData(ticket: Ticket): string {
  return JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    eventName: ticket.eventName,
    status: ticket.status,
    timestamp: ticket.generatedAt,

    // ✅ ADD THESE
    ticketType: ticket.ticketType,
    college: ticket.college,
  });
}

/**
 * Validate scanned QR data
 */
export function validateQRData(qrData: string): {
  valid: boolean;
  data?: any;
  error?: string;
} {
  try {
    const data = JSON.parse(qrData);

    if (!data.ticketId || !data.eventId || !data.status) {
      return { valid: false, error: 'Invalid ticket format' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Unable to parse QR code' };
  }
}

/**
 * Check if ticket can be used (mock implementation)
 * In production, this would check against a database/blockchain
 */
export function checkTicketStatus(ticketId: string): {
  status: TicketStatus;
  message: string;
} {
  // This is a mock - in production, query your database/blockchain
  // For demo purposes, simulate some logic
  const mockUsedTickets = new Set(['TKT-ABC123456789']); // Example used ticket

  if (mockUsedTickets.has(ticketId)) {
    return {
      status: 'used',
      message: 'This ticket has already been scanned',
    };
  }

  return {
    status: 'valid',
    message: 'Ticket is valid - Entry granted',
  };
}

/**
 * Mark ticket as used (mock implementation)
 */
export function markTicketAsUsed(ticketId: string): {
  success: boolean;
  timestamp: number;
} {
  // In production, update your database/blockchain here
  return {
    success: true,
    timestamp: Date.now(),
  };
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
