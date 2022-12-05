# limited-concurrent-workers-js [![.github/workflows/check.yml](https://github.com/moznion/limited-concurrent-workers-js/actions/workflows/check.yml/badge.svg)](https://github.com/moznion/limited-concurrent-workers-js/actions/workflows/check.yml) [![codecov](https://codecov.io/gh/moznion/limited-concurrent-workers-js/branch/main/graph/badge.svg?token=Y8IYCBWLNT)](https://codecov.io/gh/moznion/limited-concurrent-workers-js) [![npm version](https://badge.fury.io/js/@moznion%2Flimited-concurrent-workers.svg)](https://badge.fury.io/js/@moznion%2Flimited-concurrent-workers)

A library that provides a limited number of concurrent workers system for JavaScript/Typescript.

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
    setTimeout(() => {
      resolve(Number(arg));
    }, Math.floor(Math.random() * 50)) // jitter
  },
  generator,
);

// example of the `result`
//    result[0]: [
//       0,  5,  7, 10, 13, 14, 19, 25, 29, 30,
//      36, 38, 39, 41, 42, 45, 48, 49, 54, 56,
//      61, 62, 63, 66, 67, 69, 73, 74, 75, 80,
//      81, 84, 85, 87, 94, 96, 98
//    ]
//
//    result[1]: [
//       1,  3,  6,  8, 12, 15, 21, 23, 26,
//      27, 31, 35, 37, 43, 47, 50, 51, 53,
//      57, 59, 60, 65, 68, 71, 77, 79, 83,
//      89, 92, 93, 99
//    ]
//
//    result[2]: [
//       2,  4,  9, 11, 16, 17, 18, 20, 22,
//      24, 28, 32, 33, 34, 40, 44, 46, 52,
//      55, 58, 64, 70, 72, 76, 78, 82, 86,
//      88, 90, 91, 95, 97
//    ]
```

## Supported Functions

- `async function runConcurrent<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<Awaited<R[][]>>`
- `async function runConcurrentFlatten<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<Awaited<R[]>>`
- `async function runConcurrentSettled<T, R>(maxConcurrency: number, executorProvider: (arg: T) => (resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: unknown) => void) => void, generatorFunction: () => IterableIterator<T>): Promise<PromiseSettledResult<R[]>[]>`

Please see also [typedoc](https://moznion.github.io/limited-concurrent-workers-js/).

## Author

moznion (<moznion@mail.moznion.net>)

