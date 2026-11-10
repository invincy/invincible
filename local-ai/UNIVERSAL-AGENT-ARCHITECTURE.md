# Invincible Universal Agent API

```text
Qwen / OpenAI / Desktop / Mobile / MCP
              │ candidate tool request
              ▼
      Universal Agent API
  auth → workspace → allow-list
  schema → idempotency → timeout
              │
              ▼
   Existing Invincible tool executor
              │
              ▼
      Verified structured result
```

The provider is deliberately outside the execution layer. A local model may interpret “Create a new Panipat project” and a cloud model may produce the same request, but only the shared API can authorize and execute it.

Task Bridge requests use the same ownership and idempotency concepts. Firebase callable wrappers enqueue, claim, complete, fail and recover tasks; the laptop agent must still submit its claimed command to the universal executor rather than calling a provider-specific function.

The current registered capability is only `create_project`. Navigation, JSON import, rendering and media operations are represented as future extension points but are not registered and cannot execute.
