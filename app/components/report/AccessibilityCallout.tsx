// ============================================================================
// Accessibility Callout — Dedicated a11y issues box
// ============================================================================
// Not buried in scores — gets its own callout with "why this matters" context.

interface AccessibilityData {
  hasLangAttribute?: boolean;
  hasSkipNav?: boolean;
  landmarks?: { main: number; nav: number };
  formLabels?: { total: number; labeled: number; unlabeled: string[] };
  emptyInteractives?: string[];
  genericLinkText?: string[];
  positiveTabindex?: number;
  autoplayMedia?: number;
  missingAutocomplete?: string[];
  altTextIssues?: { emptyAlt: number; longAlt: number };
}

export default function AccessibilityCallout({ accessibility }: { accessibility: AccessibilityData }) {
  const issues: { issue: string; impact: string }[] = [];

  if (accessibility.hasLangAttribute === false) {
    issues.push({
      issue: 'Missing lang attribute on <html>',
      impact: 'Screen readers may not use the correct pronunciation rules',
    });
  }

  if (accessibility.hasSkipNav === false) {
    issues.push({
      issue: 'No skip navigation link',
      impact: 'Keyboard users must tab through every nav link on every page',
    });
  }

  if (accessibility.landmarks && !accessibility.landmarks.main) {
    issues.push({
      issue: 'No <main> landmark',
      impact: 'Screen reader users cannot jump directly to main content',
    });
  }

  if (accessibility.formLabels && accessibility.formLabels.unlabeled.length > 0) {
    issues.push({
      issue: `${accessibility.formLabels.unlabeled.length} form input(s) without labels`,
      impact: 'Screen readers cannot tell users what information to enter',
    });
  }

  if (accessibility.emptyInteractives && accessibility.emptyInteractives.length > 0) {
    issues.push({
      issue: `${accessibility.emptyInteractives.length} empty link(s)/button(s)`,
      impact: 'Screen readers announce these as unlabeled, confusing users',
    });
  }

  if (accessibility.genericLinkText && accessibility.genericLinkText.length > 0) {
    issues.push({
      issue: `${accessibility.genericLinkText.length} generic link text ("click here", "read more")`,
      impact: 'Screen reader users who navigate by links cannot tell where these go',
    });
  }

  if (accessibility.positiveTabindex && accessibility.positiveTabindex > 0) {
    issues.push({
      issue: `${accessibility.positiveTabindex} element(s) with positive tabindex`,
      impact: 'Disrupts the natural keyboard tab order, confusing keyboard users',
    });
  }

  if (accessibility.missingAutocomplete && accessibility.missingAutocomplete.length > 0) {
    issues.push({
      issue: `${accessibility.missingAutocomplete.length} personal data input(s) missing autocomplete`,
      impact: 'Users with motor disabilities cannot autofill personal information',
    });
  }

  if (accessibility.altTextIssues) {
    if (accessibility.altTextIssues.emptyAlt > 0) {
      issues.push({
        issue: `${accessibility.altTextIssues.emptyAlt} content image(s) with empty alt text`,
        impact: 'Screen readers skip these images entirely — users miss context',
      });
    }
    if (accessibility.altTextIssues.longAlt > 0) {
      issues.push({
        issue: `${accessibility.altTextIssues.longAlt} image(s) with overly long alt text`,
        impact: 'Excessively long descriptions are tedious for screen reader users',
      });
    }
  }

  const hasIssues = issues.length > 0;

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Accessibility & ADA Compliance</h2>

      <div className={`rounded-xl border p-6 ${
        hasIssues
          ? 'border-amber-200 bg-amber-50'
          : 'border-emerald-200 bg-emerald-50'
      }`}>
        {hasIssues ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-amber-500 text-xl mt-0.5" aria-hidden="true">&#9888;</span>
              <div>
                <p className="font-semibold text-amber-800">
                  {issues.length} accessibility issue{issues.length !== 1 ? 's' : ''} found
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  ADA lawsuits have increased 300% since 2018. These issues affect real users and
                  create legal risk for your business.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {issues.map((item, i) => (
                <div key={i} className="bg-white/60 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{item.issue}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.impact}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 text-xl" aria-hidden="true">&#10003;</span>
            <div>
              <p className="font-semibold text-emerald-800">No accessibility issues detected</p>
              <p className="text-sm text-emerald-700 mt-1">
                Your site passes all 10 of our static HTML accessibility checks. Great work!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
