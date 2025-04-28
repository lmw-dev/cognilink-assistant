import React from 'react';
import { render } from '@testing-library/react';

describe('Sanity React Test', () => {
  it('should render a div', () => {
    const { getByText } = render(<div>Hello</div>);
    expect(getByText('Hello')).toBeInTheDocument();
  });
}); 