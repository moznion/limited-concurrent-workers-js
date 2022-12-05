# limited-concurrency-worker-js [![.github/workflows/check.yml](https://github.com/moznion/limited-concurrency-worker-js/actions/workflows/check.yml/badge.svg)](https://github.com/moznion/limited-concurrency-worker-js/actions/workflows/check.yml) [![codecov](https://codecov.io/gh/moznion/limited-concurrency-worker-js/branch/main/graph/badge.svg?token=Y8IYCBWLNT)](https://codecov.io/gh/moznion/limited-concurrency-worker-js)

A library that provides a limited number of concurrent workers for JavaScript/Typescript.

## Motivation

In JavaScript, if it needs to run the async functions parallelly with a restriction of the number of concurrent workers, the code has to be a little idiomatic. This library provides some wrappers for that purpose by using the Generator, for easiness and simplicity.

## Synopsis

```ts
function* generator(): IterableIterator<string> {
  for (let i = 0; i < 100; i++) {
    yield i.toString();
  }
}

// do something by three workers for the [0..99] numbers that come from the `generator()`.
const result = await runConcurrent<string, number>(
  3,
  arg => (resolve, reject) => {
    // do something
    resolve(Number(arg));
  },
  generator,
);

// example of the `result`
//    result[0]: [
//       0,  3,  6,  9, 12, 15, 18, 21, 24,
//      27, 30, 33, 36, 39, 42, 45, 48, 51,
//      54, 57, 60, 63, 66, 69, 72, 75, 78,
//      81, 84, 87, 90, 93, 96, 99
//    ]
//
//    result[1]: [
//       1,  4,  7, 10, 13, 16, 19, 22, 25,
//      28, 31, 34, 37, 40, 43, 46, 49, 52,
//      55, 58, 61, 64, 67, 70, 73, 76, 79,
//      82, 85, 88, 91, 94, 97
//    ]
//
//    result[2]: [
//       2,  5,  8, 11, 14, 17, 20, 23, 26,
//      29, 32, 35, 38, 41, 44, 47, 50, 53,
//      56, 59, 62, 65, 68, 71, 74, 77, 80,
//      83, 86, 89, 92, 95, 98
//    ]
```

## Supported Functions

- `async function runConcurrent<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<Awaited<R[][]>>`
- `async function runConcurrentFlatten<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<Awaited<R[]>>`
- `async function runConcurrentSettled<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<PromiseSettledResult<R[]>[]>`

Please see also [typedoc](https://moznion.github.io/limited-concurrency-worker-js/).

## Author

moznion (<moznion@mail.moznion.net>)

