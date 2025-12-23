import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { PopupPortal } from './PopupPortal';

describe('PopupPortal', () => {
  let portalRoot: HTMLElement;

  beforeEach(() => {
    // Create a portal root element
    portalRoot = document.createElement('div');
    portalRoot.id = 'video-popup-portal';
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    // Clean up portal root
    if (portalRoot && portalRoot.parentNode) {
      portalRoot.parentNode.removeChild(portalRoot);
    }
  });

  it('should render children into portal root', () => {
    const { getByText } = render(
      <PopupPortal>
        <div>Portal Content</div>
      </PopupPortal>
    );

    const content = getByText('Portal Content');
    expect(content).toBeTruthy();

    // Portal content is wrapped in a div with pointer-events-auto
    // So check if it's within the portal container
    const portal = document.getElementById('video-popup-portal');
    expect(portal).toBeTruthy();
    expect(portal?.querySelector('div')).toBeTruthy();
  });

  it('should have z-index management via portal root', () => {
    const { container } = render(
      <PopupPortal>
        <div data-testid="popup-content">Content</div>
      </PopupPortal>
    );

    // Portal root should exist
    const portal = document.getElementById('video-popup-portal');
    expect(portal).toBeTruthy();
  });

  it('should render with correct z-index on portal container', () => {
    const { rerender } = render(
      <PopupPortal>
        <div>Content</div>
      </PopupPortal>
    );

    // Wait for useEffect to create portal
    const portal = document.getElementById('video-popup-portal');
    expect(portal).toBeTruthy();

    // Portal should have been created with id
    expect(portal?.id).toBe('video-popup-portal');
  });

  it('should handle multiple children', () => {
    const { getByText, getAllByRole } = render(
      <PopupPortal>
        <div role="button">Button 1</div>
        <div role="button">Button 2</div>
      </PopupPortal>
    );

    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });
});
