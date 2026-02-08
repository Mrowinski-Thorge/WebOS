/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useEffect } from 'react';
import { Desktop } from './Desktop';
import * as OSContext from '../context/OSContext';

// Hoist spies so they can be used in mocks
const { clockMountSpy, clockUnmountSpy } = vi.hoisted(() => {
  return { clockMountSpy: vi.fn(), clockUnmountSpy: vi.fn() };
});

// Mock the OS context
vi.mock('../context/OSContext', () => ({
  useOS: vi.fn(),
  OSProvider: ({ children }: any) => <div>{children}</div>
}));

vi.mock('./apps/ClockApp', () => ({
  ClockApp: (props: any) => {
    useEffect(() => {
      clockMountSpy();
      return () => {
        clockUnmountSpy();
      };
    }, []);
    return (
      <div data-testid="clock-app" data-timer={props.initialTimer}>
        Clock App Content
      </div>
    );
  }
}));

// Mock AssistantSidebar to trigger timer
vi.mock('./AssistantSidebar', () => ({
  AssistantSidebar: ({ onSetTimer }: any) => (
    <button onClick={() => onSetTimer(120)}>Set Timer Mock</button>
  )
}));

describe('Desktop Component Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (OSContext.useOS as any).mockReturnValue({
      isLocked: false,
      theme: 'dark',
      glassStyle: 'frosted',
      setTheme: vi.fn(),
      setGlassStyle: vi.fn(),
      apiKey: 'test-api-key',
      language: 'en',
    });
  });

  it('ClockApp should mount only once and receive props correctly', () => {
    render(<Desktop />);

    // 1. Open Clock App (initially active via onSetTimer logic? No, initially closed)
    // Wait, let's open it manually first.
    // But finding button by role might be tricky if mock for Taskbar isn't perfect?
    // Taskbar uses APPS_CONFIG.

    // Let's use getByText. The Taskbar renders app names in tooltips.
    // Or just trigger it via Assistant.

    // Click 'Set Timer Mock' -> sets timer 120 -> opens clock app.
    const setTimerButton = screen.getByText('Set Timer Mock');
    fireEvent.click(setTimerButton);

    const clockApp = screen.getByTestId('clock-app');
    expect(clockApp).toBeInTheDocument();
    expect(clockMountSpy).toHaveBeenCalledTimes(1);
    expect(clockApp).toHaveAttribute('data-timer', '120');

    // Now trigger another update that re-renders Desktop but keeps clock open.
    // e.g. Open Settings.
    // But wait, Taskbar might not be rendering correct buttons if APPS_CONFIG is mocked?
    // No, APPS_CONFIG uses imported components. Imports are mocked.
    // SettingsApp is NOT mocked in this file. It uses real implementation.
    // But it imports useOS which is mocked. So it should be fine.

    // Find Settings button in taskbar.
    // Taskbar iterates APPS_CONFIG.
    // SettingsApp is in APPS_CONFIG.
    // Taskbar renders button with tooltip 'Settings'.
    // Tooltip is inside button.
    const settingsButton = screen.getByText('Settings').closest('button');
    fireEvent.click(settingsButton!);

    // Desktop re-renders.
    // ClockApp should still be mounted (1 call total).
    expect(clockMountSpy).toHaveBeenCalledTimes(1);
    expect(clockUnmountSpy).not.toHaveBeenCalled();

    // And props should persist (or update if needed, but here they stay 120).
    expect(clockApp).toHaveAttribute('data-timer', '120');
  });
});
