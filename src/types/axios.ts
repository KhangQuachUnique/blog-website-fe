declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  export interface AxiosResponse<T = any> extends Promise<T> {}
}
