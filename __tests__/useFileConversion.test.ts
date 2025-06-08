import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useFileConversion } from '../src/hooks/useFileConversion';
import { ConvertApiService } from '../src/services/convertApi';
import { GoogleDriveService } from '../src/services/googleDrive';

jest.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

jest.mock('../src/services/convertApi');
jest.mock('../src/services/googleDrive');

const mockConvert = ConvertApiService.convertPdfToExcel as jest.Mock;
const mockUpload = GoogleDriveService.uploadFile as jest.Mock;

const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });

describe('useFileConversion', () => {
  beforeEach(() => {
    mockConvert.mockResolvedValue({ downloadUrl: 'http://example.com/file.xlsx', fileName: 'file.xlsx' });
    mockUpload.mockResolvedValue('https://drive.google.com/file/d/id/view');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('converts file and sets download url', async () => {
    const { result } = renderHook(() => useFileConversion(false));
    act(() => {
      result.current.setFile(file);
      result.current.setGdprConsent(true);
    });

    await act(async () => {
      await result.current.handleConvert();
    });

    expect(mockConvert).toHaveBeenCalled();
    expect(result.current.downloadUrl).toBe('http://example.com/file.xlsx');
    expect(result.current.conversionComplete).toBe(true);
  });
});
