export type EtfItem = {
  code: string;
  name: string;
  brand: string;
  index: string;
  group: string;
  aum: number;
  transaction: number;
  volume: number;
  fee: number;
  source: string;
  fetchedAt?: string;
};

export type RecentEtfItem = {
  code: string;
  name: string;
  brand: string;
  theme: string;
  listingDate: string;
  index: string;
  aum: number;
  transaction: number;
  volume: number;
  fee: number;
  source: string;
  fetchedAt?: string;
};
