import { queryOptions, useQuery } from '@tanstack/react-query';
import { listCustomers, type Customer } from '../generated/api';

export const customersQueryOptions = queryOptions({
  queryKey: ['customers'],
  queryFn: async (): Promise<Customer[]> => {
    const response = await listCustomers({ throwOnError: true });
    return (response.data ?? []) as Customer[];
  },
});

export function useCustomers() {
  return useQuery(customersQueryOptions);
}
