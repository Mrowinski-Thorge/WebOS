/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, fireEvent } from '@testing-library/react';
import { WelcomeScene } from './WelcomeScene';
import { OSProvider, useOS } from '../../context/OSContext';
import * as THREE from 'three';
import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react';

// Mock Three.js Color
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof THREE>('three');
  // Create a spyable class
  const SpyColor = vi.fn(function(this: any, ...args: any[]) {
      const instance = new actual.Color(...args);
      Object.assign(this, instance);
      return instance; // For when called as a function (if applicable) or to ensure return value
  });
  // Copy prototype to ensure instanceof checks work if needed
  SpyColor.prototype = actual.Color.prototype;

  return {
    ...actual,
    Color: SpyColor,
  };
});

// Mock fiber and drei
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Center: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Float: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Environment: () => null,
  MeshTransmissionMaterial: () => null,
}));

// Helper component
function ThemeToggler() {
    const { setTheme, theme } = useOS();
    return (
        <button
            data-testid="toggle-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            Toggle Theme
        </button>
    );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
        <OSProvider>
            {children}
            <ThemeToggler />
        </OSProvider>
    );
}

describe('WelcomeScene Performance', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('instantiates THREE.Color("#000000") only once, even on re-render', () => {
    // Render the component
    const { getByTestId } = render(
      <TestWrapper>
        <WelcomeScene />
      </TestWrapper>
    );

    // Filter calls for the specific color we are interested in
    const getBlackColorCalls = () => {
        return (THREE.Color as any).mock.calls.filter((args: any[]) => args[0] === '#000000').length;
    };

    const initialCalls = getBlackColorCalls();
    // We expect at least one call initially (from module scope or first render if inside component)
    console.log(`Initial THREE.Color('#000000') calls: ${initialCalls}`);

    // Force re-render by changing theme
    const button = getByTestId('toggle-theme');
    fireEvent.click(button);

    const callsAfterRender = getBlackColorCalls();
    console.log(`Total THREE.Color('#000000') calls after re-render: ${callsAfterRender}`);

    // With optimization, calls should NOT increase
    expect(callsAfterRender).toBe(initialCalls);
  });
});
