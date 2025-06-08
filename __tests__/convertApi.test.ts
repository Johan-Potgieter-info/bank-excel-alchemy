import { ConvertApiService, PasswordRequiredError } from '../src/services/convertApi';
import { describe, it, expect, jest, afterEach } from '@jest/globals';

const mockFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ConvertApiService', () => {
  it('returns download url on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Files: [{ Url: 'http://example.com/file.xlsx', FileName: 'file.xlsx' }] })
    }) as any;

    const result = await ConvertApiService.convertPdfToExcel(mockFile);
    expect(result).toEqual({ downloadUrl: 'http://example.com/file.xlsx', fileName: 'file.xlsx' });
  });

  it('throws PasswordRequiredError when api indicates password protection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ Code: 5003, Message: 'password protected' }),
      status: 400,
      statusText: 'Bad Request'
    }) as any;

    await expect(ConvertApiService.convertPdfToExcel(mockFile)).rejects.toBeInstanceOf(PasswordRequiredError);
  });
});
