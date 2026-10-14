import { useState, useEffect, useMemo } from 'react';
import './OrderForm.scss';
import type { OrderDetails } from '../../redux/types';

interface FormField { name: keyof OrderDetails; label: string; type: string; placeholder: string }

const fields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Jan Kowalski' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Street' },
  { name: 'postcode', label: 'Postcode', type: 'text', placeholder: '00-000' },
  { name: 'phone', label: 'Contact Number', type: 'text', placeholder: '+48 123 456 789' },
];

const initialValues: OrderDetails = {
  name: 'Jan Kowalski',
  email: 'jan.kowalski@kowalski-test.pl',
  phone: '+48 123 456 789',
  address: 'aleja Grunwaldzka 129, Gdańsk',
  postcode: '80-244',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+\d{1,3}(\s?\d{3}){3}$/;
const postcodePattern = /^\d{2}-\d{3}$/;

const validateField = (name: keyof OrderDetails, value: string | undefined | null): string => {
  const trimmed = (value ?? '').trim();
  switch (name) {
    case 'name':
      if (!trimmed) return 'Field is required';
      if (trimmed.length < 3) return 'Min of 3 characters';
      if (trimmed.length > 50) return 'Max of 50 characters';
      return '';
    case 'email':
      if (!trimmed) return 'Field is required';
      if (!emailPattern.test(trimmed)) return 'Type field in correct format';
      return '';
    case 'phone':
      if (!trimmed) return 'Field is required';
      if (!phonePattern.test(trimmed)) return 'Type field in correct format';
      return '';
    case 'address':
      if (!trimmed) return 'Field is required';
      if (trimmed.length < 3) return 'Min of 3 characters';
      return '';
    case 'postcode':
      if (!trimmed) return 'Field is required';
      if (!postcodePattern.test(trimmed)) return 'Type field in correct format';
      return '';
    default:
      return '';
  }
};

interface OrderFormProps {
  onFormChange?: (payload: { formData: OrderDetails; isValid: boolean }) => void;
}

const OrderForm = ({ onFormChange }: OrderFormProps) => {
  const [values, setValues] = useState<OrderDetails>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof OrderDetails, boolean>>>({});

  const errors = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, validateField(field.name, values[field.name])])) as Record<keyof OrderDetails, string>,
    [values],
  );
  const isValid = useMemo(() => Object.values(errors).every((error) => !error), [errors]);

  // Notify the parent (Continue button gate) about the current form data and validity,
  // including the pre-filled demo values emitted on mount.
  useEffect(() => {
    onFormChange?.({ formData: values, isValid });
  }, [values, isValid, onFormChange]);

  const handleChange = (name: keyof OrderDetails, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: keyof OrderDetails) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <form className="order-form" onSubmit={(event) => event.preventDefault()}>
      <h2>Enter your details</h2>
      <p className="demo-note">Fields are pre-filled with sample data for this demo.</p>
      <div className="section">
        {fields.map((field) => (
          <div className="input" key={field.name}>
            <label>
              {field.label} <span className="required">*</span>
              {touched[field.name] && errors[field.name] && (
                <span className="error">{errors[field.name]}</span>
              )}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(event) => handleChange(field.name, event.target.value)}
              onBlur={() => handleBlur(field.name)}
            />
          </div>
        ))}
      </div>
    </form>
  );
};

export default OrderForm;
