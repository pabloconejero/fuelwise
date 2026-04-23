import { createMineturClient } from '../client';
import { MineturApiError, MineturNetworkError, MineturTimeoutError } from '../errors';

function makeFetch(response: Partial<Response> & { json?: () => Promise<unknown> }): typeof fetch {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(''),
    json: jest.fn().mockResolvedValue({}),
    ...response,
  } as unknown as Response);
}

describe('createMineturClient.getJson', () => {
  it('fetches and returns parsed JSON on success', async () => {
    const data = { foo: 'bar' };
    const client = createMineturClient({
      baseUrl: 'https://example.com',
      fetchImpl: makeFetch({ json: jest.fn().mockResolvedValue(data) }),
    });

    const result = await client.getJson('/test');
    expect(result).toEqual(data);
  });

  it('includes Accept: application/json header', async () => {
    const fetchMock = makeFetch({ json: jest.fn().mockResolvedValue({}) });
    const client = createMineturClient({ fetchImpl: fetchMock });
    await client.getJson('/test');

    const [, init] = (fetchMock as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Accept']).toBe('application/json');
  });

  it('prepends baseUrl to the path', async () => {
    const fetchMock = makeFetch({ json: jest.fn().mockResolvedValue({}) });
    const client = createMineturClient({ baseUrl: 'https://api.example.com', fetchImpl: fetchMock });
    await client.getJson('/some/path');

    const [url] = (fetchMock as jest.Mock).mock.calls[0] as [string];
    expect(url).toBe('https://api.example.com/some/path');
  });

  it('throws MineturApiError on non-2xx response', async () => {
    const client = createMineturClient({
      fetchImpl: makeFetch({ ok: false, status: 500, text: jest.fn().mockResolvedValue('Internal error') }),
    });

    await expect(client.getJson('/test')).rejects.toThrow(MineturApiError);
    await expect(client.getJson('/test')).rejects.toMatchObject({ status: 500 });
  });

  it('throws MineturNetworkError when fetch rejects', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('Network down'));
    const client = createMineturClient({ fetchImpl: fetchMock as unknown as typeof fetch });

    await expect(client.getJson('/test')).rejects.toThrow(MineturNetworkError);
  });

  it('throws MineturNetworkError when JSON parse fails', async () => {
    const client = createMineturClient({
      fetchImpl: makeFetch({ json: jest.fn().mockRejectedValue(new SyntaxError('bad json')) }),
    });

    await expect(client.getJson('/test')).rejects.toThrow(MineturNetworkError);
  });

  it('throws MineturTimeoutError when the request exceeds timeoutMs', async () => {
    // A fetch mock that rejects with AbortError when its signal fires.
    const abortAwareFetch = jest.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
          // No timeout: the signal is the only way this resolves.
        }),
    );

    const client = createMineturClient({
      timeoutMs: 50,
      fetchImpl: abortAwareFetch as unknown as typeof fetch,
    });

    await expect(client.getJson('/test')).rejects.toThrow(MineturTimeoutError);
  }, 10_000);
});
