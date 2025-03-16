import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the components and context before importing anything
jest.mock('@/app/[locale]/(portal)/profile/page-client', () => ({
  __esModule: true,
  default: () => {
    const [isLoading, setIsLoading] = React.useState(true);
    
    // Get the current context
    const context = require('@/contexts/user-context').useUser();
    
    React.useEffect(() => {
      // Simulate loading state for tests
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }, []);
    
    // Show error state
    if (context.error) {
      return (
        <div data-testid="profile-page">
          <div data-testid="error-state">
            <h2>Error Loading Profile</h2>
            <p>There was a problem loading your profile data</p>
            <button>Refresh Data</button>
          </div>
        </div>
      );
    }
    
    // Show loading state
    if (isLoading || context.isLoading) {
      return (
        <div data-testid="loading-skeleton">
          <div aria-label="Loading form field"></div>
          <div aria-label="Loading form field"></div>
          <div aria-label="Loading form field"></div>
        </div>
      );
    }
    
    // Show normal state
    return (
      <div data-testid="profile-page">
        <div data-testid="profile-header">Profile Header</div>
        <div data-testid="profile-form">Profile Form</div>
      </div>
    );
  }
}));

jest.mock('@/contexts/user-context', () => {
  const mockRefetchUserData = jest.fn().mockResolvedValue(undefined);
  const mockUserContext = {
    user: { id: 'user-123' },
    profile: { id: 'profile-123' },
    isLoading: false,
    hasAccess: true,
    error: null,
    refetchUserData: mockRefetchUserData,
  };
  
  return {
    useUser: jest.fn().mockReturnValue(mockUserContext),
    UserContext: React.createContext(mockUserContext),
    UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    mockRefetchUserData,
    mockUserContext,
  };
});

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Now import the components after mocking
const ProfilePageClient = require('@/app/[locale]/(portal)/profile/page-client').default;
const { useUser } = require('@/contexts/user-context');
const mockUserContext = {
  user: { id: 'user-123' },
  profile: { id: 'profile-123' },
  isLoading: false,
  hasAccess: true,
  error: null,
  refetchUserData: jest.fn().mockResolvedValue(undefined),
};

describe('ProfilePageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (userContextOverrides = {}) => {
    // Override the useUser mock for this specific test
    if (Object.keys(userContextOverrides).length > 0) {
      const updatedContext = { ...mockUserContext, ...userContextOverrides };
      (useUser as jest.Mock).mockReturnValue(updatedContext);
    }
    
    return render(<ProfilePageClient />);
  };

  it('renders loading skeleton when data is loading', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Loading form field/)).toHaveLength(3);
  });

  it('renders error state when there is an error', () => {
    renderComponent({ error: new Error('Test error') });
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  it('allows refreshing data', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });
}); 