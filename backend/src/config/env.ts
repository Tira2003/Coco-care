import 'dotenv/config'

const defaultFrontendOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]

function parseOrigins(value?: string) {
  if (!value) return defaultFrontendOrigins

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return origins.length > 0 ? origins : defaultFrontendOrigins
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGINS ?? process.env.FRONTEND_ORIGIN),
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? '',
  azureCvEndpoint: process.env.AZURE_CV_ENDPOINT ?? '',
  azureCvKey: process.env.AZURE_CV_KEY ?? '',
  azureCvPredictionUrl: process.env.AZURE_CV_PREDICTION_URL ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
  geminiEmbeddingEnabled: process.env.GEMINI_EMBEDDING_ENABLED !== 'false',
  /** 0 = use model default dimensionality; 768 recommended for storage/search. */
  geminiEmbeddingDimensions: Number(process.env.GEMINI_EMBEDDING_DIMENSIONS) || 768,
  ragTopK: Number(process.env.RAG_TOP_K) || 8,
  ragMinScore: Number(process.env.RAG_MIN_SCORE) || 0.5,
  knowledgeDataDir: process.env.KNOWLEDGE_DATA_DIR ?? './data/cri-manuals',
  fusionConfidenceThreshold: Number(process.env.FUSION_CONFIDENCE_THRESHOLD) || 0.75,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? '',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  /** When false, skip Groq even if key is set. Default: enabled when key present. */
  groqEnabled: process.env.GROQ_ENABLED !== 'false',
  diseaseAlertRadiusKm: Number(process.env.DISEASE_ALERT_RADIUS_KM) || 25,
}
