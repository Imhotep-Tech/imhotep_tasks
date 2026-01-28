import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

// PKCE helpers
async function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

const ImhotepFinanceConnect = () => {
  const { status, loading, error, getAuthorizeUrl } = useFinance();

  const handleConnect = async () => {
    try {
      const verifier = await generateCodeVerifier();
      const challenge = await createCodeChallenge(verifier);
      // Persist verifier for use in the callback
      window.sessionStorage.setItem('imhotep_finance_code_verifier', verifier);

      const url = await getAuthorizeUrl(challenge);
      window.location.href = url;
    } catch (e) {
      console.error('Failed to start Imhotep Finance connection', e);
    }
  };

  const connected = status.connected && status.token_valid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-indigo-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Imhotep Finance Connection
        </h1>
        <p className="text-gray-600 mb-6">
          Connect your Imhotep Tasks account with Imhotep Finance to automatically
          create and manage financial transactions for your priced tasks.
        </p>

        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-700">
              {connected
                ? 'Connected to Imhotep Finance'
                : 'Not connected to Imhotep Finance'}
            </span>
          </div>
          {status.scopes && (
            <p className="mt-2 text-xs text-gray-500">
              Granted scopes: {status.scopes}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {connected ? 'Reconnect to Imhotep Finance' : 'Connect to Imhotep Finance'}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          You will be redirected to Imhotep Finance to sign in and approve access.
          You can revoke access from the developer portal at any time.
        </p>
      </div>
    </div>
  );
};

export default ImhotepFinanceConnect;

