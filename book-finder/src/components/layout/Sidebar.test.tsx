import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { AuthProvider } from '../../context/AuthContext';
import { BookshelfProvider } from '../../context/BookshelfContext';
import { ReadingProgressProvider } from '../../context/ReadingProgressContext';

describe('Sidebar Layout Component', () => {
  it('renders sidebar with navigation items and group headers', () => {
    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <Sidebar
              activeView="discover"
              onViewChange={jest.fn()}
              isCollapsed={false}
              onToggleCollapse={jest.fn()}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    expect(screen.getByText('DISCOVER')).toBeInTheDocument();
    expect(screen.getByText('LIBRARY')).toBeInTheDocument();
    expect(screen.getByText('READING')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Social Feed')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('My Bookshelf')).toBeInTheDocument();
    expect(screen.getByText('Currently Reading')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('triggers onViewChange when navigation button is clicked', () => {
    const handleViewChange = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <Sidebar
              activeView="discover"
              onViewChange={handleViewChange}
              isCollapsed={false}
              onToggleCollapse={jest.fn()}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    const discoverBtn = screen.getByText('Discover').closest('button');
    expect(discoverBtn).toBeInTheDocument();
    if (discoverBtn) {
      fireEvent.click(discoverBtn);
      expect(handleViewChange).toHaveBeenCalledWith('discover');
    }
  });

  it('triggers onToggleCollapse when collapse button is clicked', () => {
    const handleToggle = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <Sidebar
              activeView="discover"
              onViewChange={jest.fn()}
              isCollapsed={false}
              onToggleCollapse={handleToggle}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);

    expect(handleToggle).toHaveBeenCalled();
  });

  it('renders mobile sidebar with close button and triggers onMobileClose', () => {
    const handleClose = jest.fn();

    render(
      <AuthProvider>
        <BookshelfProvider>
          <ReadingProgressProvider>
            <Sidebar
              activeView="discover"
              onViewChange={jest.fn()}
              isCollapsed={false}
              onToggleCollapse={jest.fn()}
              isMobileOpen={true}
              onMobileClose={handleClose}
            />
          </ReadingProgressProvider>
        </BookshelfProvider>
      </AuthProvider>
    );

    // Mobile header text is visible
    expect(screen.getByText('BiblioTrack Menu')).toBeInTheDocument();

    // Close button works
    const closeBtn = screen.getByRole('button', { name: /close mobile menu/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Backdrop overlay click also triggers close
    const backdrop = screen.getByLabelText(/close sidebar overlay/i);
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
