import React from 'react';
import { render } from '@testing-library/react-native';
import CustomNavi from '../CustomNavi';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Soft: 'Soft' },
}));

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn().mockResolvedValue(false),
}));

const mockNavigation = { navigate: jest.fn(), emit: jest.fn() } as any;

const makeProps = (activeIndex = 0) => ({
  state: {
    index: activeIndex,
    routes: [
      { key: 'home', name: 'Home' },
      { key: 'fuel', name: 'FuelLog' },
      { key: 'stats', name: 'Stats' },
      { key: 'settings', name: 'Settings' },
    ],
  },
  navigation: mockNavigation,
  descriptors: {} as any,
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
});

describe('CustomNavi accessibility', () => {
  it('renders 4 elements with role tab', () => {
    const { getAllByRole } = render(<CustomNavi {...makeProps()} />);
    expect(getAllByRole('tab')).toHaveLength(4);
  });

  it('labels tabs with human-readable names', () => {
    const { getByLabelText } = render(<CustomNavi {...makeProps()} />);
    expect(getByLabelText('Home')).toBeTruthy();
    expect(getByLabelText('Fuel Log')).toBeTruthy();
    expect(getByLabelText('Stats')).toBeTruthy();
    expect(getByLabelText('Settings')).toBeTruthy();
  });

  it('marks only the active tab as selected', () => {
    const { getAllByRole } = render(<CustomNavi {...makeProps(1)} />);
    const tabs = getAllByRole('tab');
    expect(tabs[0]).not.toHaveAccessibilityState({ selected: true });
    expect(tabs[1]).toHaveAccessibilityState({ selected: true });
    expect(tabs[2]).not.toHaveAccessibilityState({ selected: true });
    expect(tabs[3]).not.toHaveAccessibilityState({ selected: true });
  });
});
