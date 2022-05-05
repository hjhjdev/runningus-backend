export type PartialRequired<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;
