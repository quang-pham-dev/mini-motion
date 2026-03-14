'use client';

import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

export const getQueryClient = cache(() => new QueryClient());
export default getQueryClient;
