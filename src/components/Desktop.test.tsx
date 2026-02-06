import { render, act, within, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';
import React from 'react';

// Mock the context
vi.mock('../context/OSContext', () => ({
  useOS: () => ({
    isLocked: false,
    theme: 'dark',
    glassStyle: 'liquid',
  }),
}));

// Mock Taskbar to track renders and props
vi.mock('./Taskbar', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TaskbarMock = vi.fn(({ onAppClick, apps }: any) => (
    <div data-testid="taskbar">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {apps.map((app: any) => (
            <button key={app.id} onClick={() => onAppClick(app.id)}>
                {app.name}
            </button>
        ))}
    </div>
  ));
  return {
    Taskbar: TaskbarMock
  };
});

describe('Desktop Performance Optimization', () => {
  it('prevents unnecessary Taskbar re-renders and prop changes', async () => {
    render(<Desktop />);

    // clear initial renders
    vi.clearAllMocks();

    // 1. Open 'Settings'
    const taskbar = screen.getByTestId('taskbar');
    await act(async () => {
        within(taskbar).getByText('Settings').click();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsOpenCallCount = (Taskbar as any).mock.calls.length;
    // We expect a re-render
    expect(settingsOpenCallCount).toBeGreaterThan(0);

    // 2. Open 'Browser'
    await act(async () => {
        within(taskbar).getByText('Browser').click();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const browserOpenCallCount = (Taskbar as any).mock.calls.length;
    expect(browserOpenCallCount).toBeGreaterThan(settingsOpenCallCount);

    // 3. Click 'Settings' again - should not trigger prop changes
    await act(async () => {
        within(taskbar).getByText('Settings').click();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalCallCount = (Taskbar as any).mock.calls.length;

    // Check prop stability
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevApps = (Taskbar as any).mock.calls[browserOpenCallCount - 1][0].apps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currApps = (Taskbar as any).mock.calls[finalCallCount - 1][0].apps;

    expect(currApps).toBe(prevApps);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevOnClick = (Taskbar as any).mock.calls[browserOpenCallCount - 1][0].onAppClick;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currOnClick = (Taskbar as any).mock.calls[finalCallCount - 1][0].onAppClick;

    expect(currOnClick).toBe(prevOnClick);
  });
});
