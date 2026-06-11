export interface IMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  prevPage: number | null;
  nextPage: number | null;
}

export class IPaginate<T> {
  data: T;
  meta: IMeta;
}
