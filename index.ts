/**
 * runConcurrent runs executors that come from `executorProvider` by at most `maxConcurrency` workers.
 * The workers continue to run the executors until the generator that is supplied by `generatorFunction` notifies `done`, i.e. once the generator has become `done`.
 *
 * @typeParam T - The argument type of the executor. That argument must be provided by the generator.
 * @typeParam R - The result type of the executor, and propagates that result to this function's Promise.
 * @param maxConcurrency - the number of the maximum concurrent workers.
 * @param executorProvider - a provider function that returns an executor for a worker according to the `T` typed value that comes from the generator.
 * @param generatorFunction - a generator function that returns an argument for `executorProvider`. If this generator returns `done` value, this function finishes the workers' executions and returns the result.
 * @returns a promise that returns the arrays of `R` for each worker.
 */
export async function runConcurrent<T, R>(
  maxConcurrency: number,
  executorProvider: (
    arg: T,
  ) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void,
  generatorFunction: () => IterableIterator<T>,
): Promise<Awaited<R[][]>> {
  const promises = doRunConcurrent(maxConcurrency, executorProvider, generatorFunction);
  return Promise.all(promises);
}

/**
 * runConcurrentFlatten runs executors that come from `executorProvider` by at most `maxConcurrency` workers.
 * The workers continue to run the executors until the generator that is supplied by `generatorFunction` notifies `done`, i.e. once the generator has become `done`.
 *
 * @typeParam T - The argument type of the executor. That argument must be provided by the generator.
 * @typeParam R - The result type of the executor, and propagates that result to this function's Promise.
 * @param maxConcurrency - the number of the maximum concurrent workers.
 * @param executorProvider - a provider function that returns an executor for a worker according to the `T` typed value that comes from the generator.
 * @param generatorFunction - a generator function that returns an argument for `executorProvider`. If this generator returns `done` value, this function finishes the workers' executions and returns the result.
 * @returns a promise that returns an array of `R` that is flattened of all worker's results.
 */
export async function runConcurrentFlatten<T, R>(
  maxConcurrency: number,
  executorProvider: (
    arg: T,
  ) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void,
  generatorFunction: () => IterableIterator<T>,
): Promise<Awaited<R[]>> {
  const promises = doRunConcurrent(maxConcurrency, executorProvider, generatorFunction);
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(results => {
        resolve(results.flat());
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * runConcurrentSettled runs executors that come from `executorProvider` by at most `maxConcurrency` workers.
 * The workers continue to run the executors until the generator that is supplied by `generatorFunction` notifies `done`, i.e. once the generator has become `done`.
 *
 * @typeParam T - The argument type of the executor. That argument must be provided by the generator.
 * @typeParam R - The result type of the executor, and propagates that result to this function's Promise.
 * @param maxConcurrency - the number of the maximum concurrent workers.
 * @param executorProvider - a provider function that returns an executor for a worker according to the `T` typed value that comes from the generator.
 * @param generatorFunction - a generator function that returns an argument for `executorProvider`. If this generator returns `done` value, this function finishes the workers' executions and returns the result.
 * @returns a promise of the `Promise.allSettled()` that returns `R[]` result.
 */
export async function runConcurrentSettled<T, R>(
  maxConcurrency: number,
  executorProvider: (
    arg: T,
  ) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void,
  generatorFunction: () => IterableIterator<T>,
): Promise<PromiseSettledResult<R[]>[]> {
  const promises = doRunConcurrent(maxConcurrency, executorProvider, generatorFunction);
  return Promise.allSettled(promises);
}

function doRunConcurrent<T, R>(
  maxConcurrency: number,
  executorProvider: (
    arg: T,
  ) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void,
  generatorFunction: () => IterableIterator<T>,
): Promise<R[]>[] {
  const promises: Promise<R[]>[] = [];
  const generator = generatorFunction();

  for (let i = 0; i < maxConcurrency; i++) {
    // eslint-disable-next-line no-async-promise-executor
    const p = new Promise<R[]>(async (resolve, reject) => {
      const results: R[] = [];

      let gen = generator.next();
      while (!gen.done) {
        try {
          results.push(await new Promise(executorProvider(gen.value)));
        } catch (e) {
          reject(e);
          return;
        }
        gen = generator.next();
      }

      resolve(results);
    });
    promises.push(p);
  }

  return promises;
}
