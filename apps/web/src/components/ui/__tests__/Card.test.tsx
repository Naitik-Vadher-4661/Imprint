import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

describe('Card Component', () => {
  it('renders card with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>My Content</p>
        </CardContent>
      </Card>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Content')).toBeInTheDocument();
  });
});
