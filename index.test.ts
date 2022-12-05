import { describe, expect, test } from '@jest/globals';
import { runConcurrent, runConcurrentFlatten, runConcurrentSettled } from './index';

describe('runConcurrent', () => {
  test('it executes successfully by three workers', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    const result = await runConcurrent<string, number>(
      3,
      arg => (resolve) => {
        resolve(Number(arg));
      },
      generator,
    );
    expect(result.length).toBe(3);
    expect(result[0]?.length).toBeGreaterThan(0);
    expect(result[1]?.length).toBeGreaterThan(0);
    expect(result[2]?.length).toBeGreaterThan(0);
    expect(result.flat().reduce((acc, i) => acc + i, 0)).toBe(4950); // sum of all numbers from 0 to 99
  });

  test('a worker rejects', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    try {
      await runConcurrent<string, number>(
        3,
        () => (resolve, reject) => {
          reject('reject!');
        },
        generator,
      );
      expect(true).toBe(false); // must not reach here
    } catch (err) {
      expect(err).toBe('reject!');
    }
  });
});

describe('runConcurrentFlatten', () => {
  test('it executes successfully by three workers', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    const result = await runConcurrentFlatten<string, number>(
      3,
      arg => (resolve) => {
        resolve(Number(arg));
      },
      generator,
    );
    expect(result.length).toBe(100);
    expect(result.reduce((acc, i) => acc + i, 0)).toBe(4950); // sum of all numbers from 0 to 99
  });

  test('a worker rejects', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    try {
      await runConcurrentFlatten<string, number>(
        3,
        () => (resolve, reject) => {
          reject('reject!');
        },
        generator,
      );
      expect(true).toBe(false); // must not reach here
    } catch (err) {
      expect(err).toBe('reject!');
    }
  });
});

describe('runConcurrentSettled', () => {
  test('it executes successfully by three workers', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    const result = await runConcurrentSettled<string, number>(
      3,
      arg => (resolve) => {
        resolve(Number(arg));
      },
      generator,
    );
    expect(result.length).toBe(3);
    expect(result[0]?.status).toBe('fulfilled');
    expect(result[1]?.status).toBe('fulfilled');
    expect(result[2]?.status).toBe('fulfilled');
    expect(result.flatMap(r => (r as PromiseFulfilledResult<number[]>).value).reduce((acc, i) => acc + i, 0)).toBe(
      4950,
    ); // sum of all numbers from 0 to 99
  });

  test('a worker rejects', async () => {
    const generator = function* (): IterableIterator<string> {
      for (let i = 0; i < 100; i++) {
        yield i.toString();
      }
    };

    const result = await runConcurrentSettled<string, number>(
      3,
      arg => (resolve, reject) => {
        if (arg === '0') {
          reject('reject!');
          return;
        }
        resolve(Number(arg));
      },
      generator,
    );
    expect(result.length).toBe(3);

    const fulfilledResults: PromiseFulfilledResult<number[]>[] = [];
    let numOfRejected = 0;
    let rejectedResult;
    for (const r of result) {
      if (r.status === 'fulfilled') {
        fulfilledResults.push(r);
        continue;
      }
      numOfRejected++;
      rejectedResult = r;
    }

    expect(numOfRejected).toBe(1);
    expect(rejectedResult?.reason).toBe('reject!');
    expect(fulfilledResults.length).toBe(2);
    expect(fulfilledResults.flatMap(r => r.value).reduce((acc, i) => acc + i, 0)).toBe(4950); // sum of all numbers from 1 to 99
  });
});
