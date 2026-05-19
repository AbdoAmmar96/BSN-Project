import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('<Modal />', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Modal open={false} onClose={() => {}} title="X">body</Modal>);
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes dialog semantics when open', () => {
    render(<Modal open onClose={() => {}} title="Confirm">body</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Confirm');
  });

  it('closes when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="X">body</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has an accessible close button labelled in Arabic', () => {
    render(<Modal open onClose={() => {}} title="X">body</Modal>);
    expect(screen.getByRole('button', { name: 'إغلاق' })).toBeInTheDocument();
  });
});
