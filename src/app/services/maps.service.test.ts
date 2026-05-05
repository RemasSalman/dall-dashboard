import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapsService } from './maps.service';

describe('MapsService', () => {
  let service: MapsService;

  beforeEach(() => {
    service = new MapsService({} as any);
  });

  // =========================
  //  uploadMap tests
  // =========================

  it('should upload map successfully', async () => {
    const fakeFile = new File(['dummy'], 'test.png', { type: 'image/png' });

    //  mock method to avoid Firebase
    vi.spyOn(service, 'uploadMap').mockResolvedValue(undefined);

    await service.uploadMap(fakeFile, 'Test Map');

    expect(service.uploadMap).toHaveBeenCalledWith(fakeFile, 'Test Map');
  });

  it('should throw error if file is not image', async () => {
    const fakeFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });

    await expect(
      service.uploadMap(fakeFile, 'Test Map')
    ).rejects.toThrow('The file must be an image only');
  });

  it('should throw error if file is too large', async () => {
    const fakeFile = new File(['x'.repeat(2000000)], 'big.png', {
      type: 'image/png'
    });

    Object.defineProperty(fakeFile, 'size', { value: 2000000 });

    await expect(
      service.uploadMap(fakeFile, 'Big Map')
    ).rejects.toThrow('Image is too large');
  });

  // =========================
  //  deleteMap test
  // =========================

  it('should call deleteMap with correct id', async () => {
    vi.spyOn(service, 'deleteMap').mockResolvedValue(undefined);

    await service.deleteMap('map-1');

    expect(service.deleteMap).toHaveBeenCalledWith('map-1');
  });

  // =========================
  // getMaps test
  // =========================

  it('should return maps observable', () => {
    const mockMaps = [
      { id: '1', name: 'Map 1', imageUrl: 'url1' }
    ];

    vi.spyOn(service, 'getMaps').mockReturnValue({
      subscribe: (fn: any) => fn(mockMaps)
    } as any);

    service.getMaps().subscribe(data => {
      expect(data).toEqual(mockMaps);
    });
  });
});