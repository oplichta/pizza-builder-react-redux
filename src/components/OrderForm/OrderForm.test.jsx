import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderForm from './OrderForm';

describe('OrderForm', () => {
    it('reports the pre-filled demo data as valid on mount', () => {
        const onFormChange = vi.fn();
        render(<OrderForm onFormChange={onFormChange} />);

        expect(onFormChange).toHaveBeenCalledWith(expect.objectContaining({ isValid: true }));
    });

    it('flags an invalid email and reports the form as invalid', () => {
        const onFormChange = vi.fn();
        render(<OrderForm onFormChange={onFormChange} />);

        const emailInput = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
        fireEvent.blur(emailInput);

        expect(screen.getByText('Type field in correct format')).toBeInTheDocument();
        expect(onFormChange).toHaveBeenLastCalledWith(expect.objectContaining({ isValid: false }));
    });
});
