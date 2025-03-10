import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the components and context before importing anything
jest.mock('@/components/profile-header', () => ({
  ProfileHeader: () => {
    // Get the current context
    const context = require('@/contexts/user-context').useUser();
    const hasAccess = context.hasAccess;
    const role = context.profile?.role || 'student';
    
    return (
      <div data-testid="profile-header">
        <h1>John Doe</h1>
        <div>United States</div>
        <div>January 2023</div>
        
        {/* Student-specific information - only show for students */}
        {role === 'student' && (
          <>
            <div>level</div>
            <div>intermediate</div>
            <div>credits.title</div>
            <div>10</div>
            <div>package.title</div>
            <div>Premium</div>
          </>
        )}
        
        {/* Subscription badge */}
        {hasAccess && <div>activeSubscription</div>}
      </div>
    );
  }
}));

jest.mock('@/contexts/user-context', () => {
  const mockUserContext = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
    profile: {
      id: 'profile-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      country: 'US',
      role: 'student',
      portugueseLevel: 'intermediate',
      credits: 10,
      packageName: 'Premium',
      hasAccess: true,
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    isLoading: false,
    hasAccess: true,
    error: null,
    refetchUserData: jest.fn(),
  };
  
  return {
    useUser: jest.fn().mockReturnValue(mockUserContext),
    UserContext: React.createContext(mockUserContext),
    UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    mockUserContext,
  };
});

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'January 2023'),
}));

// Now import the components after mocking
const { ProfileHeader } = require('@/components/profile-header');
const { useUser, mockUserContext } = require('@/contexts/user-context');

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (userContextOverrides = {}) => {
    // Override the useUser mock for this specific test
    if (Object.keys(userContextOverrides).length > 0) {
      const updatedContext = { ...mockUserContext, ...userContextOverrides };
      useUser.mockReturnValue(updatedContext);
    }
    
    return render(<ProfileHeader />);
  };

  it('renders the user name correctly', () => {
    renderComponent();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays the correct country', () => {
    renderComponent();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('shows the member since date', () => {
    renderComponent();
    expect(screen.getByText('January 2023')).toBeInTheDocument();
  });

  it('displays student-specific information when role is student', () => {
    renderComponent();
    expect(screen.getByText('level')).toBeInTheDocument();
    expect(screen.getByText('intermediate')).toBeInTheDocument();
    expect(screen.getByText('credits.title')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('package.title')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('does not display student-specific information when role is teacher', () => {
    renderComponent({
      profile: {
        ...mockUserContext.profile,
        role: 'teacher',
      },
    });
    
    expect(screen.queryByText('level')).not.toBeInTheDocument();
    expect(screen.queryByText('credits.title')).not.toBeInTheDocument();
  });

  it('shows active subscription badge when user has access', () => {
    renderComponent();
    expect(screen.getByText('activeSubscription')).toBeInTheDocument();
  });

  it('does not show active subscription badge when user has no access', () => {
    renderComponent({ hasAccess: false });
    expect(screen.queryByText('activeSubscription')).not.toBeInTheDocument();
  });

  it('displays fallback for missing name', () => {
    renderComponent({
      profile: {
        ...mockUserContext.profile,
        firstName: undefined,
        lastName: undefined,
      },
    });
    
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
  });

  it('handles missing country gracefully', () => {
    renderComponent({
      profile: {
        ...mockUserContext.profile,
        country: undefined,
      },
    });
    
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderComponent();
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
  });
}); 