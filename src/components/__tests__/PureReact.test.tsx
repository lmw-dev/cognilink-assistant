import React from 'react';
import { render } from '@testing-library/react';

describe('Pure React Test', () => {
  it('should render a div', () => {
    const { getByText } = render(<div>Hello Pure</div>);
    expect(getByText('Hello Pure')).toBeInTheDocument();
  });
}); 