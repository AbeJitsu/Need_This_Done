export const CONSULTATION_TYPES = ['quick', 'strategy', 'deep-dive'] as const;

export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export interface ConsultationRequestDetails {
  consultationType: ConsultationType | null;
  preferredConsultationAt: string | null;
  alternateConsultationAt: string | null;
}

function parseOptionalDateTime(value: string | null, label: string): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || value.length > 100) {
    throw new Error(`${label} must be a valid date and time.`);
  }

  return parsed.toISOString();
}

/**
 * Validates consultation preferences submitted with a project inquiry.
 * These are lead context only; appointment creation remains a separate flow.
 */
export function parseConsultationRequestDetails(input: {
  consultationType: string | null;
  preferredTime: string | null;
  alternateTime: string | null;
}): ConsultationRequestDetails {
  const consultationType = input.consultationType || null;
  if (consultationType && !CONSULTATION_TYPES.includes(consultationType as ConsultationType)) {
    throw new Error('Select a valid consultation type.');
  }

  const preferredConsultationAt = parseOptionalDateTime(input.preferredTime, 'Preferred consultation time');
  const alternateConsultationAt = parseOptionalDateTime(input.alternateTime, 'Alternate consultation time');

  if ((preferredConsultationAt || alternateConsultationAt) && !consultationType) {
    throw new Error('Select a consultation type before providing a time.');
  }

  if (alternateConsultationAt && !preferredConsultationAt) {
    throw new Error('Provide a preferred consultation time before an alternate time.');
  }

  return {
    consultationType: consultationType as ConsultationType | null,
    preferredConsultationAt,
    alternateConsultationAt,
  };
}
