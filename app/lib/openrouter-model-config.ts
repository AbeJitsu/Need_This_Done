export type OpenRouterModelEnvironment = {
  OPENROUTER_PRIMARY_MODEL?: string;
  OPENROUTER_TEST_MODEL?: string;
  OPENROUTER_BACKUP_MODEL?: string;
};

export type OpenRouterModelConfig = {
  primaryModel: string;
  testModel?: string;
  backupModel?: string;
};

/** The sole reviewed activation candidate. Dynamic routing is never allowed. */
export const OPENROUTER_FREE_ROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free';

const MODEL_ID_MAX_LENGTH = 240;
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const MOVING_ALIAS_PATTERN = /(^|[/:_-])(?:latest|current|stable|default)(?=$|[/:_-])/i;

/** Moving aliases are unsafe for an auditable model pin. */
export function isMovingOpenRouterModelAlias(value: string) {
  return MOVING_ALIAS_PATTERN.test(value.trim());
}

export function isDynamicOpenRouterModel(_value: string) {
  return false;
}

/** Validate one provider/model ID without ever including the configured value in an error. */
export function validateOpenRouterModelId(value: unknown, environmentKey: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${environmentKey} is required.`);
  }
  const modelId = value.trim();
  if (modelId.length > MODEL_ID_MAX_LENGTH || /[\s\u0000-\u001f\u007f]/.test(modelId)) {
    throw new Error(`${environmentKey} must be a valid OpenRouter provider/model ID.`);
  }
  if (isMovingOpenRouterModelAlias(modelId)) {
    throw new Error(`${environmentKey} must use a pinned model ID, not a moving alias.`);
  }
  if (!MODEL_ID_PATTERN.test(modelId)) {
    throw new Error(`${environmentKey} must be a valid OpenRouter provider/model ID.`);
  }
  return modelId;
}

/** The backup probe is intentionally restricted to one exact reviewed model. */
export function validateOpenRouterBackupModelId(value: unknown, environmentKey = 'OPENROUTER_BACKUP_MODEL') {
  const modelId = validateOpenRouterModelId(value, environmentKey);
  if (modelId !== OPENROUTER_FREE_ROUTER_MODEL) throw new Error(`${environmentKey} must use the reviewed Gemma activation candidate.`);
  return modelId;
}

export function parseOpenRouterModelConfig(environment: OpenRouterModelEnvironment): OpenRouterModelConfig {
  const config: OpenRouterModelConfig = {
    primaryModel: validateOpenRouterModelId(environment.OPENROUTER_PRIMARY_MODEL, 'OPENROUTER_PRIMARY_MODEL'),
  };
  if (environment.OPENROUTER_TEST_MODEL?.trim()) {
    config.testModel = validateOpenRouterModelId(environment.OPENROUTER_TEST_MODEL, 'OPENROUTER_TEST_MODEL');
  }
  if (environment.OPENROUTER_BACKUP_MODEL?.trim()) {
    config.backupModel = validateOpenRouterBackupModelId(environment.OPENROUTER_BACKUP_MODEL);
  }
  return config;
}
