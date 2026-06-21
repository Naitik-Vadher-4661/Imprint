import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label if provided', () => {
    render(<Input label="Username" id="username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows error message if error prop is provided', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });
});
