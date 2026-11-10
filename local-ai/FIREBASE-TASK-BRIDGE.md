# Online-to-laptop local AI bridge

The online Invincible site never calls Ollama directly. It enqueues an authenticated task in Firebase. A laptop connector claims that task, invokes the loopback-only local agent, and writes the verified result back to Firebase.

## Pairing flow

1. A signed-in Invincible user calls `createInvincibleAgentPairing` with an agent ID such as `laptop-agent-1`.
2. Firebase returns a one-time bearer token. Store it only in the laptop connector environment.
3. Start `local-ai/firebase-task-connector.mjs` on the Windows laptop with `INVINCIBLE_FIREBASE_AGENT_TOKEN`.
4. The connector polls Firebase, claims only that user's tasks, and completes or fails them through the same registered-tool executor.

The token is stored hashed in `aiAgentTokens`; it is never written to logs or returned again. Tokens expire after 30 days and can be revoked by deleting/revoking the agent session document.

## Current limitations

- The Firebase functions must be deployed before the bridge is usable online.
- The connector still needs to be launched under the restricted `InvincibleAgent` identity.
- Ollama remains loopback-only; the connector talks to the local agent, not to Ollama directly.
- The provider selector is enabled for the online bridge with `?local-ai=1` while this rollout is being tested.
