/**
 * Utilities for sharing org data via URL
 * 
 * Compresses org state to base64 and encodes in URL.
 * No server needed - data lives entirely in the link.
 */

import type { OrgState } from '../types';

// Compress and encode org state to a URL-safe string
export function encodeOrgToUrl(state: OrgState): string {
  try {
    const json = JSON.stringify(state);
    // Use base64 encoding (works in all browsers)
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return base64;
  } catch (e) {
    console.error('Failed to encode org:', e);
    throw new Error('Failed to create share link');
  }
}

// Decode org state from URL parameter
export function decodeOrgFromUrl(encoded: string): OrgState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const state = JSON.parse(json) as OrgState;
    
    // Validate structure
    if (state && state.teams && state.people) {
      return state;
    }
    return null;
  } catch (e) {
    console.error('Failed to decode org:', e);
    return null;
  }
}

// Generate a full shareable URL
export function generateShareUrl(state: OrgState, orgName: string): string {
  const encoded = encodeOrgToUrl(state);
  const name = encodeURIComponent(orgName);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?org=${encoded}&name=${name}`;
}

// Check if current URL has shared org data
export function getSharedOrgFromUrl(): { state: OrgState; name: string } | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('org');
  const name = params.get('name');
  
  if (!encoded) return null;
  
  const state = decodeOrgFromUrl(encoded);
  if (!state) return null;
  
  return {
    state,
    name: name ? decodeURIComponent(name) : 'Shared Org',
  };
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// Clear the URL parameters without reloading
export function clearUrlParams(): void {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, '', url);
}
