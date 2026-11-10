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

Registered capabilities are `create_project` and the fixed local SD 1.5 `generate_image` tool. Image execution is injected by the authenticated local worker; arbitrary rendering graphs, filesystem tools and shell execution remain unavailable. See [local image generation](../docs/local-image-generation.md) for the executor, interface, launch requirements and verification limits.
