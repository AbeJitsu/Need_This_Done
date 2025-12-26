// ============================================================================
// Google Calendar API Client
// ============================================================================
// What: OAuth flow and calendar management for Google Calendar
// Why: Admin needs to schedule appointments on their Google Calendar
// How: OAuth 2.0 for auth, REST API for calendar operations

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  token_type: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string; displayName?: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: 'email' | 'popup'; minutes: number }[];
  };
  htmlLink?: string;
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  startDateTime: Date;
  durationMinutes: number;
  attendeeEmail: string;
  attendeeName?: string;
  timeZone?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ||
  (process.env.NODE_ENV === 'production'
    ? 'https://needthisdone.com/api/google/callback'
    : 'http://localhost:3000/api/google/callback');

// OAuth scopes needed for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Google OAuth endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// ============================================================================
// OAuth Flow Functions
// ============================================================================

/**
 * Generate OAuth authorization URL
 * Redirects admin to Google to authorize calendar access
 */
export function getAuthUrl(state?: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',  // Get refresh token
    prompt: 'consent',       // Always show consent screen to get refresh token
    ...(state && { state }),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * Called after user authorizes on Google
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
    token_type: data.token_type,
  };
}

/**
 * Refresh expired access token
 * Uses refresh token to get new access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Refresh token stays the same
    expires_at: new Date(Date.now() + data.expires_in * 1000),
    token_type: data.token_type,
  };
}

/**
 * Get user's Google email
 * Used to identify which Google account is connected
 */
export async function getGoogleEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Google user info');
  }

  const data = await response.json();
  return data.email;
}

// ============================================================================
// Token Management (Supabase)
// ============================================================================

/**
 * Get valid access token for a user
 * Refreshes if expired, throws if no tokens stored
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get stored tokens
  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error('No Google Calendar connection found. Please connect your Google account.');
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = new Date(tokenData.expires_at);
  const isExpired = expiresAt.getTime() - 5 * 60 * 1000 < Date.now();

  if (!isExpired) {
    return tokenData.access_token;
  }

  // Refresh the token
  const newTokens = await refreshAccessToken(tokenData.refresh_token);

  // Update stored tokens
  await supabase
    .from('google_calendar_tokens')
    .update({
      access_token: newTokens.access_token,
      expires_at: newTokens.expires_at.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return newTokens.access_token;
}

/**
 * Store OAuth tokens for a user
 * Called after successful OAuth flow
 */
export async function storeTokens(
  userId: string,
  tokens: GoogleTokens,
  googleEmail: string
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('google_calendar_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_at: tokens.expires_at.toISOString(),
      google_email: googleEmail,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

/**
 * Check if user has Google Calendar connected
 */
export async function isCalendarConnected(userId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('google_calendar_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !!data;
}

/**
 * Disconnect Google Calendar (remove tokens)
 */
export async function disconnectCalendar(userId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('google_calendar_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to disconnect calendar: ${error.message}`);
  }
}

// ============================================================================
// Calendar Event Functions
// ============================================================================

/**
 * Create a calendar event
 * Used when admin approves an appointment
 */
export async function createCalendarEvent(
  accessToken: string,
  input: CalendarEventInput,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  const timeZone = input.timeZone || 'America/New_York';

  const startDateTime = input.startDateTime.toISOString();
  const endDateTime = new Date(
    input.startDateTime.getTime() + input.durationMinutes * 60 * 1000
  ).toISOString();

  const event: CalendarEvent = {
    summary: input.summary,
    description: input.description,
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
    attendees: [
      {
        email: input.attendeeEmail,
        displayName: input.attendeeName,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 },      // 30 min before
      ],
    },
  };

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create event: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Update a calendar event
 * Used when admin modifies appointment time
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<CalendarEventInput>,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  const eventUpdates: Partial<CalendarEvent> = {};

  if (updates.summary) {
    eventUpdates.summary = updates.summary;
  }

  if (updates.description) {
    eventUpdates.description = updates.description;
  }

  if (updates.startDateTime && updates.durationMinutes) {
    const timeZone = updates.timeZone || 'America/New_York';
    eventUpdates.start = {
      dateTime: updates.startDateTime.toISOString(),
      timeZone,
    };
    eventUpdates.end = {
      dateTime: new Date(
        updates.startDateTime.getTime() + updates.durationMinutes * 60 * 1000
      ).toISOString(),
      timeZone,
    };
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventUpdates),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update event: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Delete a calendar event
 * Used when appointment is cancelled
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new Error(`Failed to delete event: ${error.error?.message || 'Unknown error'}`);
  }
}

/**
 * Get free/busy times for a calendar
 * Used to show available slots to customers
 */
export async function getFreeBusy(
  accessToken: string,
  startDate: Date,
  endDate: Date,
  calendarId: string = 'primary'
): Promise<{ start: Date; end: Date }[]> {
  const response = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get free/busy: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const busyTimes = data.calendars?.[calendarId]?.busy || [];

  return busyTimes.map((slot: { start: string; end: string }) => ({
    start: new Date(slot.start),
    end: new Date(slot.end),
  }));
}

// ============================================================================
// ICS File Generation
// ============================================================================

/**
 * Generate ICS file content for email attachments
 * Used to send .ics file with confirmation email
 */
export function generateIcsContent(
  summary: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date,
  location?: string,
  organizerEmail?: string,
  attendeeEmail?: string
): string {
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@needthisdone.com`;
  const now = formatDate(new Date());

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NeedThisDone//Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDate(startDateTime)}`,
    `DTEND:${formatDate(endDateTime)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
  ];

  if (location) {
    ics.push(`LOCATION:${location}`);
  }

  if (organizerEmail) {
    ics.push(`ORGANIZER;CN=NeedThisDone:mailto:${organizerEmail}`);
  }

  if (attendeeEmail) {
    ics.push(`ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendeeEmail}`);
  }

  ics.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return ics.join('\r\n');
}
