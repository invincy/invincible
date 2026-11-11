# Online-to-laptop local AI bridge

The online Invincible site never calls Ollama directly. It enqueues an authenticated task in Firebase. A laptop connector claims that task, invokes the loopback-only local agent, and writes the verified result back to Firebase.

## Pairing flow

1. From Invincible AI on the desktop, open **Laptop settings**. Confirm **Replace remote key** only for setup or when the saved key needs replacing.
2. Save the issued key with `save-agent-token.ps1`. Windows encrypts the saved key for the current user.
3. Start the paired Image Studio or Video Studio launcher with the relay enabled. It starts `firebase-paired-task-connector.mjs` alongside the image relay.
4. The connector verifies that the Firebase account matches the restricted worker, then claims that account's tasks. Image prompt drafts go to the prompt-only route. App actions still use the registered-tool executor.

The token is stored hashed in `aiAgentTokens`; it is never written to logs or returned again. Tokens expire after 30 days and can be revoked by deleting/revoking the agent session document.

## Current limitations

- The Firebase functions must be deployed before the bridge is usable online.
- The paired relay uses the saved Windows credential and talks to the restricted worker over loopback.
- Ollama remains loopback-only; the connector talks to the local agent, not to Ollama directly.
- The public Invincible site offers **Local · Qwen3 4B** for remote chat. Image Studio can draft a prompt through the same laptop connection.
