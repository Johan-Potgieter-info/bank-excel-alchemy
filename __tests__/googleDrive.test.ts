import { GoogleDriveService } from '../src/services/googleDrive';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('GoogleDriveService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  it('uploads file when initialized', async () => {
    localStorage.setItem('gdrive_initialized', 'true');
    const promise = GoogleDriveService.uploadFile('http://example.com/file.xlsx', 'file.xlsx');
    jest.runAllTimers();
    const url = await promise;
    expect(url).toMatch(/https:\/\/drive.google.com\/file\/d\/.*\/view/);
  });

  it('throws error if not initialized', async () => {
    await expect(GoogleDriveService.uploadFile('http://example.com/file.xlsx', 'file.xlsx')).rejects.toThrow('Google Drive service not initialized');
  });
});
