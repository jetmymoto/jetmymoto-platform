const { z } = require('zod');

const PosterEngineJobSchema = z.object({
  mode: z.enum(['wave1', 'mission', 'batch']),
  missionIds: z.array(z.string()).max(30).optional(),
  limit: z.number().int().min(1).max(30).default(3),
  formats: z.array(z.enum(['landscape', 'portrait', 'story'])).default(['landscape', 'portrait', 'story']),
  styles: z.array(z.enum(['ultra_minimal', 'dark_cinematic', 'warm_sunset'])).default(['ultra_minimal', 'dark_cinematic', 'warm_sunset']),
  upload: z.boolean().default(false),
  allowAi: z.boolean().default(false),
  force: z.boolean().default(false),
  dryRun: z.boolean().default(true),
  payloadHash: z.string().optional(),
  retryCount: z.number().int().min(0).default(0),
});

module.exports = {
  PosterEngineJobSchema
};
