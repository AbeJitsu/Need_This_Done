import { describe, expect, it } from 'vitest';
import { ProspectDossierValidationError, dossierDeduplicationKey, parseProspectDossierBatch } from '@/lib/prospect-dossier';

const providerCitations = [
  { url: 'https://example.com/about', title: 'Example About', excerpt: 'Example Studio serves local owners.' },
  { url: 'https://example.com/services', title: 'Example Services', excerpt: 'The company offers booking support.' },
];

function validBatch() {
  return {
    dossiers: [{
      companyName: 'Example Studio',
      officialWebsite: 'https://example.com',
      icpReason: 'Its public site fits the configured service-business market.',
      observedEvidence: [{ claim: 'The public site identifies a local owner service.', citationUrls: ['https://example.com/about'] }],
      citations: [{ url: 'https://example.com/about', title: 'Model title is replaced', excerpt: 'Model text is replaced' }],
      recommendedOfferAngle: 'Offer a focused booking-path review.',
      contactPath: { type: 'contact_form', value: 'https://example.com/contact' },
      suggestedOutreach: { subject: 'One booking-path idea', body: 'A human-reviewed draft only.' },
    }],
    shortfallReason: 'Only one distinct business met the evidence standard in the bounded search.',
  };
}

describe('strict prospect dossier parsing', () => {
  it('accepts only evidence tied to provider-returned public citations', () => {
    const parsed = parseProspectDossierBatch(JSON.stringify(validBatch()), providerCitations);
    expect(parsed.dossiers[0].citations[0]).toEqual(providerCitations[0]);
    expect(dossierDeduplicationKey(parsed.dossiers[0])).toBe('example.com');
  });

  it('rejects unsupported claims and malformed source citations', () => {
    const unsupported = validBatch();
    unsupported.dossiers[0].observedEvidence[0].citationUrls = ['https://unreturned.example/evidence'];
    expect(() => parseProspectDossierBatch(JSON.stringify(unsupported), providerCitations)).toThrow(ProspectDossierValidationError);

    const malformed = validBatch();
    malformed.dossiers[0].officialWebsite = 'http://example.com';
    expect(() => parseProspectDossierBatch(JSON.stringify(malformed), providerCitations)).toThrow('public HTTPS');
  });

  it('rejects duplicate businesses in a single model result', () => {
    const duplicate = validBatch();
    duplicate.dossiers.push({ ...duplicate.dossiers[0], companyName: 'Example Studio Duplicate' });
    delete duplicate.shortfallReason;
    expect(() => parseProspectDossierBatch(JSON.stringify(duplicate), providerCitations)).toThrow('duplicate businesses');
  });
});
