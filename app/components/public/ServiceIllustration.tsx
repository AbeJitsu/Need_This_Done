import { ArrowDown, Check, MousePointer2 } from 'lucide-react';

/** Illustrative service examples, not screenshots or customer results. */
export default function ServiceIllustration({ kind }: { kind: 'website' | 'work' }) {
  return (
    <figure className={`service-illustration service-illustration--${kind}`}>
      <figcaption>What this could look like</figcaption>
      {kind === 'website' ? (
        <div className="service-illustration__browser">
          <div className="service-illustration__toolbar" aria-hidden="true"><i /><i /><i /><span>One clearer page</span></div>
          <div className="service-illustration__page">
            <span className="service-illustration__eyebrow">A visitor lands on your site</span>
            <p>They get it.<br />They know where to go.</p>
            <div className="service-illustration__lines" aria-hidden="true"><i /><i /></div>
            <span className="service-illustration__button">One clear next step <MousePointer2 aria-hidden="true" size={20} /></span>
          </div>
        </div>
      ) : (
        <ol className="service-illustration__flow">
          {['A request comes in', 'The next step is clear', 'You review the result'].map((step, index) => (
            <li key={step}>
              <div><span>{index === 2 ? <Check size={20} aria-hidden="true" /> : `0${index + 1}`}</span><p>{step}</p></div>
              {index < 2 && <ArrowDown className="service-illustration__arrow" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
