export const config = {
  serviceName: 'crisis-os-functions',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
} as const

