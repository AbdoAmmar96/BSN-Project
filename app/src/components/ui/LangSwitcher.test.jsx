import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LangSwitcher from './LangSwitcher';
import '../../lib/i18n';
import i18n from '../../lib/i18n';

describe('<LangSwitcher />', () => {
  beforeEach(() => {
    // Always start each test in Arabic
    i18n.changeLanguage('ar');
  });

  it('renders both language buttons', () => {
    render(<LangSwitcher />);
    expect(screen.getByRole('button', { name: 'AR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('marks the current language with aria-pressed=true', () => {
    render(<LangSwitcher />);
    expect(screen.getByRole('button', { name: 'AR' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('flips the document direction when switching to English', () => {
    render(<LangSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });
});
