# Testing Guidelines for Sotaque Brasileiro

This document outlines our approach to testing React components in the Sotaque Brasileiro project.

## Core Principles

1. **Simplicity**: Keep tests simple and focused on behavior, not implementation details
2. **Isolation**: Each test should be independent and not rely on external state
3. **Maintainability**: Tests should be easy to understand and maintain

## Recommended Testing Pattern

### 1. Mock Dependencies First

Always mock dependencies at the top of the test file:

```typescript
// Mock dependencies before importing the component
jest.mock('@/components/some-component', () => ({
  SomeComponent: () => <div data-testid="mocked-component">Mocked Content</div>
}));

jest.mock('@/contexts/user-context', () => {
  const mockUserContext = {
    user: { id: 'user-123' },
    profile: { id: 'profile-123' },
    isLoading: false,
    hasAccess: true,
    error: null,
    refetchUserData: jest.fn(),
  };
  
  return {
    useUser: jest.fn().mockReturnValue(mockUserContext),
    UserContext: React.createContext(mockUserContext),
    UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    mockUserContext, // Export for use in tests
  };
});
```

### 2. Import Components After Mocking

```typescript
// Import after setting up mocks
const { ComponentToTest } = require('@/path/to/component');
const { useUser, mockUserContext } = require('@/contexts/user-context');
```

### 3. Create a Helper for Rendering

```typescript
describe('ComponentToTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (overrides = {}) => {
    // Override context for this specific test
    if (Object.keys(overrides).length > 0) {
      useUser.mockReturnValue({ ...mockUserContext, ...overrides });
    }
    
    return render(<ComponentToTest />);
  };
  
  // Tests go here...
});
```

### 4. Write Focused Tests

```typescript
it('shows loading state when data is loading', () => {
  renderComponent({ isLoading: true });
  expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
});

it('shows error state when there is an error', () => {
  renderComponent({ error: new Error('Test error') });
  expect(screen.getByTestId('error-state')).toBeInTheDocument();
});
```

## Example Test Files

For reference, see these example test files:
- `__tests__/components/profile-header.test.tsx`
- `__tests__/components/profile-page-client.test.tsx`

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's implemented
2. **Use Data-Testid Attributes**: Add `data-testid` attributes to elements you need to test
3. **Mock Complex Dependencies**: Mock API calls, contexts, and complex components
4. **Keep Tests Fast**: Tests should run quickly to encourage frequent testing
5. **Test Edge Cases**: Test loading states, error states, and empty states 