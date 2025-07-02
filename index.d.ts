export default function lockify<
  Params extends any[],
  R
>(
  f: (...params: Params) => R,
  max?: number
): (...params: Params) => Promise<R>;
