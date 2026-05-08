import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { AnalyticsPageComponent } from './analytics-page';
import { NavigationSession } from '../../../services/analytics.service';

describe('AnalyticsPageComponent', () => {
  let component: AnalyticsPageComponent;
  let analyticsServiceMock: any;

  const mockSessions: NavigationSession[] = [
    {
      mapId: 'map-1',
      startAnchorName: 'Gate A',
      destinationName: 'Seat 101',
      durationSeconds: 120,
      status: 'completed',
      startedAt: new Date('2026-05-01').getTime()
    },
    {
      mapId: 'map-1',
      startAnchorName: 'Gate B',
      destinationName: 'Cafeteria',
      durationSeconds: 180,
      status: 'completed',
      startedAt: new Date('2026-05-02').getTime()
    },
    {
      mapId: 'map-1',
      startAnchorName: 'Gate C',
      destinationName: 'Seat 101',
      durationSeconds: 0,
      status: 'cancelled',
      startedAt: new Date('2026-05-03').getTime()
    }
  ];

  beforeEach(() => {
    analyticsServiceMock = {
      getSessions: vi.fn().mockReturnValue(of(mockSessions))
    };

    component = new AnalyticsPageComponent(analyticsServiceMock);
  });

  // TC1: Checks that analytics sessions are loaded when the component initializes.
  it('should load sessions on init', () => {
    component.ngOnInit();

    expect(analyticsServiceMock.getSessions).toHaveBeenCalled();
    expect(component.sessions.length).toBe(3);
  });

  // TC2: Checks summary card calculations such as completed trips, average duration, and completion rate.
  it('should calculate summary cards correctly', () => {
    component.ngOnInit();

    expect(component.completedTripsCount).toBe(2);
    expect(component.avgDuration).toBe(2.5);
    expect(component.completionRate).toBe(67);
  });

  // TC3: Checks that recent sessions are sorted by latest startedAt date.
  it('should prepare recent sessions sorted by newest first', () => {
    component.ngOnInit();

    expect(component.recentSessions[0].destinationName).toBe('Seat 101');
    expect(component.recentSessions.length).toBe(3);
  });

  // TC4: Checks that daily users chart labels and data are prepared.
  it('should prepare daily users chart data', () => {
    component.ngOnInit();

    expect(component.dailyUsersLabels).toEqual([
      'Sat',
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri'
    ]);

    expect(component.dailyUsersData.reduce((sum, value) => sum + value, 0)).toBe(3);
  });

  // TC5: Checks that busy areas are grouped and counted correctly.
  it('should prepare busy areas chart data', () => {
    component.ngOnInit();

    expect(component.busyAreasLabels[0]).toBe('Seat 101');
    expect(component.busyAreasData[0]).toBe(2);
  });

  // TC6: Checks date formatting when timestamp exists.
  it('should format timestamp correctly', () => {
    const timestamp = new Date('2026-05-01').getTime();

    const result = component.formatDate(timestamp);

    expect(result).not.toBe('-');
  });

  // TC7: Checks date formatting when timestamp is missing.
  it('should return dash when timestamp is missing', () => {
    expect(component.formatDate(undefined)).toBe('-');
  });

  // TC8: Checks that chart objects are destroyed when component is destroyed.
  it('should destroy charts on destroy', () => {
    const lineDestroyMock = vi.fn();
    const barDestroyMock = vi.fn();

    component.lineChart = { destroy: lineDestroyMock } as any;
    component.barChart = { destroy: barDestroyMock } as any;

    component.ngOnDestroy();

    expect(lineDestroyMock).toHaveBeenCalled();
    expect(barDestroyMock).toHaveBeenCalled();
    expect(component.lineChart).toBeNull();
    expect(component.barChart).toBeNull();
  });

  // TC9: Checks CSV export logic without downloading a real file.
  it('should export CSV report', () => {
    component.ngOnInit();

    const createObjectURLMock = vi.fn().mockReturnValue('blob:url');
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock
    });

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickMock
    } as any);

    component.exportCsv();

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:url');
  });

});