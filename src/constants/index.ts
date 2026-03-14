export * from './errors';
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ProjectStatusType = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const ASSET_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type AssetStatusType = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];
