import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnchorsService, Anchor } from './anchors.service';

describe('AnchorsService', () => {
  let service: AnchorsService;

//Verifies that the service is created before each test with a fake Firestore object.
// Also mocks Firestore-related methods to avoid calling the real database.

  beforeEach(() => {
    service = new AnchorsService({} as any);

    vi.spyOn(service, 'addAnchor').mockResolvedValue({ id: 'anchor-1' } as any);
    vi.spyOn(service, 'deleteAnchor').mockResolvedValue(undefined);
    vi.spyOn(service, 'updateAnchor').mockResolvedValue(undefined);
    vi.spyOn(service, 'getAnchorsByMap').mockResolvedValue([
      {
        id: 'a1',
        mapId: 'map-1',
        name: 'Gate A',
        qrId: 'QR-001',
        type: 'Navigation',
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ]);
  });

// TC1: Checks that the last clicked map position is stored correctly.
// This is important when the admin clicks on the map to place an anchor.
  it('should set last click position', () => {
    const position = { x: 0.5, y: 0.7, pixelX: 250, pixelY: 350 };

    service.setLastClickPos(position);

    service.lastClickPos$.subscribe(value => {
      expect(value).toEqual(position);
    });
  });

// TC2: Checks that the selected anchor is stored correctly.
// This supports showing anchor details when the admin selects an anchor.
  it('should set selected anchor', () => {
    const anchor: Anchor = {
      qrId: 'QR-001',
      mapId: 'map-1',
      name: 'Gate A',
      type: 'Navigation',
      position: { x: 0.2, y: 0.3, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    service.setSelectedAnchor(anchor);

    service.selectedAnchor$.subscribe(value => {
      expect(value).toEqual(anchor);
    });
  });

// TC3: Checks that refreshAnchors() triggers the refresh event.
// This is used when the anchor list/map should reload after changes.
  it('should trigger anchor refresh', () => {
    let called = false;

    service.anchorRefresh$.subscribe(() => {
      called = true;
    });

    service.refreshAnchors();

    expect(called).toBe(true);
  });

 
// TC4: Checks that addAnchor() is called with the correct anchor data.
// The actual Firebase call is mocked, so no real database write happens.
it('should call addAnchor with correct data', async () => {
  const anchor: Anchor = {
    qrId: 'QR-001',
    mapId: 'map-1',
    name: 'Gate A',
    type: 'Navigation',
    position: { x: 0.2, y: 0.3, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const result = await service.addAnchor(anchor);

  expect(service.addAnchor).toHaveBeenCalledWith(anchor);
  expect(result).toEqual({ id: 'anchor-1' });
});

// TC5: Checks that deleteAnchor() is called with the correct anchor ID.
// The actual Firebase delete operation is mocked.
it('should call deleteAnchor with correct id', async () => {
  await service.deleteAnchor('anchor-1');

  expect(service.deleteAnchor).toHaveBeenCalledWith('anchor-1');
});

// TC6: Checks that updateAnchor() is called with the correct ID and updated data.
// The actual Firebase update operation is mocked.
it('should call updateAnchor with correct data', async () => {
  const updateData = { name: 'Updated Gate' };

  await service.updateAnchor('anchor-1', updateData);

  expect(service.updateAnchor).toHaveBeenCalledWith('anchor-1', updateData);
});

// TC7: Checks that getAnchorsByMap() is called with the correct mapId.
// It also verifies that the returned mocked anchor data is handled correctly.
it('should get anchors by mapId', async () => {
  const result = await service.getAnchorsByMap('map-1');

  expect(service.getAnchorsByMap).toHaveBeenCalledWith('map-1');
  expect(result[0].name).toBe('Gate A');
});

//TC8:Null / Empty values Selected anchor = null
it('should handle null selected anchor', () => {
  service.setSelectedAnchor(null);

  service.selectedAnchor$.subscribe(value => {
    expect(value).toBeNull();
  });
});


// TC9: Verifies that anchorRefresh$ emits an initial value upon subscription
// and emits again each time refreshAnchors() is called.
// This ensures that UI components listening to this observable
// will be notified and updated whenever anchor data changes.
it('should emit initial value and trigger refresh twice', () => {
  let count = 0;

  service.anchorRefresh$.subscribe(() => {
    count++;
  });

  service.refreshAnchors();
  service.refreshAnchors();

  expect(count).toBe(3);
});
});