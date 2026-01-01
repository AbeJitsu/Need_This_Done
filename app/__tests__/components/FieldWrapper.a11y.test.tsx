// ============================================================================
// FieldWrapper Tests
// ============================================================================
// What: Tests for the FieldWrapper component
// Why: Ensure label, hint, and error patterns work correctly
// How: Unit tests for all wrapper functionality

import { render, screen } from '@testing-library/react';
import FieldWrapper from '@/components/content-editor/fields/FieldWrapper';

describe('FieldWrapper', () => {
  it('renders label and children', () => {
    render(
      <FieldWrapper label="Email" inputId="email-input">
        <input id="email-input" type="email" />
      </FieldWrapper>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <FieldWrapper label="Name" inputId="name-input" required>
        <input id="name-input" type="text" />
      </FieldWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows hint text when provided and no error', () => {
    render(
      <FieldWrapper label="Bio" inputId="bio-input" hint="Keep it short">
        <textarea id="bio-input" />
      </FieldWrapper>
    );

    expect(screen.getByText('Keep it short')).toBeInTheDocument();
  });

  it('shows error instead of hint when error provided', () => {
    render(
      <FieldWrapper
        label="Email"
        inputId="email-input"
        hint="Enter your email"
        error="Invalid email format"
      >
        <input id="email-input" type="email" />
      </FieldWrapper>
    );

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(
      <FieldWrapper label="Password" inputId="pass-input">
        <input id="pass-input" type="password" />
      </FieldWrapper>
    );

    const label = screen.getByText('Password');
    expect(label).toHaveAttribute('for', 'pass-input');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FieldWrapper label="Test" inputId="test-input" className="mt-4">
        <input id="test-input" />
      </FieldWrapper>
    );

    expect(container.firstChild).toHaveClass('mt-4');
  });
});
