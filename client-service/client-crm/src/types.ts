export type Module =
  | 'Overview'
  | 'Users'
  | 'Blog'
  | 'SEO'
  | 'Language'
  | 'Orders'
  | 'Payments'
  | 'Products';
export type RecordItem = {
  id: string;
  name: string;
  detail: string;
  status: string;
  value: string;
  date: string;
};
