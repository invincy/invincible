const { z } = require('zod');

// Every preset stays at or below the tested 512 x 512 pixel budget.
const IMAGE_PRESETS = Object.freeze({ square: [512, 512], portrait: [384, 640], landscape: [640, 384] });
const imageSchema = z.object({
  prompt: z.string().trim().min(1).max(1500).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value), 'Prompt contains control characters.'),
  preset: z.enum(['square', 'portrait', 'landscape']),
  seed: z.number().int().min(0).max(4294967295).optional(),
}).strict();
const imageDefinition = Object.freeze({ type: 'function', name: 'generate_image', description: 'Generate a local SD 1.5 image. Returns verified output only after generation finishes.',
  parameters: { type: 'object', properties: { prompt: { type: 'string', maxLength: 1500 }, preset: { type: 'string', enum: Object.keys(IMAGE_PRESETS) }, seed: { type: 'integer', minimum: 0, maximum: 4294967295 } }, required: ['prompt', 'preset'], additionalProperties: false } });

function imageWorkflow({ prompt, preset, seed }, prefix, reference) {
  const [width, height] = IMAGE_PRESETS[preset];
  return {
    '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'v1-5-pruned-emaonly-fp16.safetensors' } },
    '2': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['1', 1] } },
    '3': { class_type: 'CLIPTextEncode', inputs: { text: 'text, letters, watermark, signature, logo, blurry, low quality, distorted', clip: ['1', 1] } },
    '4': reference ? { class_type: 'VAEEncode', inputs: { pixels: ['8', 0], vae: ['1', 2] } }
      : { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    '5': { class_type: 'KSampler', inputs: { model: ['1', 0], positive: ['2', 0], negative: ['3', 0], latent_image: ['4', 0], seed, steps: 20, cfg: 7, sampler_name: 'euler', scheduler: 'normal', denoise: reference ? 0.45 : 1 } },
    '6': { class_type: 'VAEDecode', inputs: { samples: ['5', 0], vae: ['1', 2] } },
    '7': { class_type: 'SaveImage', inputs: { images: ['6', 0], filename_prefix: prefix } },
    ...(reference && { '8': { class_type: 'LoadImage', inputs: { image: reference } } }),
  };
}

module.exports = { IMAGE_PRESETS, imageSchema, imageDefinition, imageWorkflow };
