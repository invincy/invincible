import {firebaseApp, observeAuth} from '../shared/firebase-client.js';
import {getFunctions, httpsCallable} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const $ = id => document.getElementById(id);
const functions = getFunctions(firebaseApp, 'asia-south1');
const authorize = httpsCallable(functions, 'creatorPluginAuthorize');
const params = new URLSearchParams(location.search);
let currentUser = null;
let requestInvalid = false;

function decodeRequest() {
  const packed = params.get('oauth');
  if (!packed) return null;
  try {
    const normalized = packed.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - normalized.length % 4) % 4);
    const request = JSON.parse(decodeURIComponent(escape(atob(normalized + padding))));
    if (!request || typeof request !== 'object' || Array.isArray(request)) throw Error('Invalid request');
    return request;
  } catch {
    requestInvalid = true;
    return null;
  }
}
const oauthRequest = decodeRequest();
if (params.has('oauth') && !oauthRequest) requestInvalid = true;

function setMessage(message, error = false) {
  $('message').textContent = message;
  $('message').classList.toggle('error', error);
}

function render() {
  $('connectionSetup').hidden = Boolean(oauthRequest) && !requestInvalid;
  $('manualSetup').hidden = Boolean(oauthRequest) && !requestInvalid;
  $('accountPanel').hidden = !currentUser;
  $('signInLink').hidden = Boolean(currentUser);
  $('connectButton').hidden = !currentUser || !oauthRequest || requestInvalid;
  if (currentUser) $('accountEmail').textContent = currentUser.email || 'Signed-in Invincible account';
  if (requestInvalid) {
    setMessage('This sign-in request is invalid. Start a fresh connection from ChatGPT settings.', true);
  } else if (!currentUser) {
    setMessage('Sign in on the Invincible Dashboard, then return here.');
  } else if (oauthRequest) {
    setMessage('Review the permissions above, then allow the connection.');
  } else {
    setMessage('Your Invincible account is ready. Complete account linking in ChatGPT settings.');
  }
}

$('copyAddress').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('connectionAddress').textContent.trim());
    $('copyAddress').textContent = 'Address copied';
  } catch {
    $('manualSetup').open = true;
    $('connectionAddress').focus();
    setMessage('Clipboard access is unavailable. Select and copy the connection address below.', true);
  }
});

$('connectButton').addEventListener('click', async () => {
  if (!currentUser || !oauthRequest || requestInvalid) return;
  const button = $('connectButton');
  const authorizingUid = currentUser.uid;
  button.disabled = true;
  setMessage('Creating your private connection…');
  try {
    const result = await authorize({oauth: oauthRequest});
    if (currentUser?.uid !== authorizingUid) throw Error('Your account changed. Start sign-in again.');
    if (!result.data?.redirectUrl) throw Error('No return address was provided.');
    location.assign(result.data.redirectUrl);
  } catch (error) {
    setMessage(error?.message || 'Could not authorize the connection. Please try again.', true);
  } finally {
    button.disabled = false;
  }
});

observeAuth(user => {
  currentUser = user;
  render();
});
