import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ElementRef,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, NavigationSession } from '../../../services/analytics.service';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-analytics-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './analytics-page.html',
    styleUrls: ['./analytics-page.scss']
})
export class AnalyticsPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

    sessions: NavigationSession[] = [];
    recentSessions: NavigationSession[] = [];

    avgDuration = 0;
    completionRate = 0;
    completedTripsCount = 0;

    dailyUsersLabels: string[] = [];
    dailyUsersData: number[] = [];

    busyAreasLabels: string[] = [];
    busyAreasData: number[] = [];

    lineChart: Chart | null = null;
    barChart: Chart | null = null;

    viewInitialized = false;

    constructor(private analyticsService: AnalyticsService) { }

    ngOnInit(): void {
        this.analyticsService.getSessions().subscribe(data => {
            this.sessions = [...data];

            this.calculateSummaryCards();
            this.prepareRecentSessions();
            this.prepareDailyUsersChartData();
            this.prepareBusyAreasChartData();

            if (this.viewInitialized) {
                this.renderCharts();
            }
        });
    }

    ngAfterViewInit(): void {
        this.viewInitialized = true;

        if (this.sessions.length > 0) {
            this.renderCharts();
        }
    }

    ngOnDestroy(): void {
        this.destroyCharts();
    }

    private calculateSummaryCards(): void {
        const completedSessions = this.sessions.filter(
            session => session.status?.toLowerCase() === 'completed'
        );

        this.completedTripsCount = completedSessions.length;

        const durations = completedSessions
            .map(session => Number(session.durationSeconds) || 0)
            .filter(duration => duration > 0);

        const avgSeconds = durations.length
            ? durations.reduce((sum, current) => sum + current, 0) / durations.length
            : 0;

        this.avgDuration = +(avgSeconds / 60).toFixed(1);

        this.completionRate = this.sessions.length
            ? Math.round((completedSessions.length / this.sessions.length) * 100)
            : 0;
    }

    private prepareRecentSessions(): void {
        this.recentSessions = [...this.sessions]
            .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
            .slice(0, 5);
    }

    private prepareDailyUsersChartData(): void {
        const grouped: Record<string, number> = {};

        this.sessions.forEach(session => {
            const timestamp = session.startedAt;
            if (!timestamp) return;

            const date = new Date(timestamp);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
            grouped[dayLabel] = (grouped[dayLabel] || 0) + 1;
        });

        const orderedWeek = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        this.dailyUsersLabels = orderedWeek;
        this.dailyUsersData = orderedWeek.map(day => grouped[day] || 0);
    }

    private prepareBusyAreasChartData(): void {
        const grouped: Record<string, number> = {};

        this.sessions.forEach(session => {
            const destination = session.destinationName || 'Unknown';
            grouped[destination] = (grouped[destination] || 0) + 1;
        });

        const sortedEntries = Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);

        this.busyAreasLabels = sortedEntries.map(([name]) => name);
        this.busyAreasData = sortedEntries.map(([, count]) => count);
    }

    private renderCharts(): void {
        this.destroyCharts();
        this.createLineChart();
        this.createBarChart();
    }

    private createLineChart(): void {
        if (!this.lineChartRef) return;

        this.lineChart = new Chart(this.lineChartRef.nativeElement, {
            type: 'line',
            data: {
                labels: this.dailyUsersLabels,
                datasets: [
                    {
                        label: 'Users Count',
                        data: this.dailyUsersData,
                        fill: true,
                        tension: 0.45,
                        borderColor: '#6a6cff',
                        backgroundColor: 'rgba(106, 108, 255, 0.12)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 4,
                        pointBackgroundColor: '#6a6cff',
                        pointBorderColor: '#6a6cff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            color: '#6b7280',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#7b8190'
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#7b8190'
                        },
                        grid: {
                            color: '#eef1f6'
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    private createBarChart(): void {
        if (!this.barChartRef) return;

        this.barChart = new Chart(this.barChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: this.busyAreasLabels,
                datasets: [
                    {
                        label: 'Visitors',
                        data: this.busyAreasData,
                        backgroundColor: '#5c8edc',
                        borderRadius: 8,
                        barThickness: 18
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#7b8190'
                        },
                        grid: {
                            color: '#eef1f6'
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: true,
                            color: '#7b8190',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    private destroyCharts(): void {
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }

        if (this.barChart) {
            this.barChart.destroy();
            this.barChart = null;
        }
    }

    formatDate(timestamp: number | undefined): string {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString();
    }

    exportCsv(): void {
        const headers = [
            'Start Gate',
            'Destination',
            'Duration (sec)',
            'Status',
            'Started At'
        ];

        const rows = this.sessions.map(session => [
            session.startAnchorName || 'Unknown',
            session.destinationName || 'Unknown',
            session.durationSeconds || 0,
            session.status || 'unknown',
            this.formatDate(session.startedAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row =>
                row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'analytics-data.csv';
        link.click();

        URL.revokeObjectURL(url);
    }

    exportReport(): void {
        const report = `
DALL Analytics Report
=====================

Average Time to Destination: ${this.avgDuration} min
Completed Navigations: ${this.completionRate}% (${this.completedTripsCount} trips)

Busy Areas:
${this.busyAreasLabels
                .map((label, index) => `${index + 1}. ${label} - ${this.busyAreasData[index]}`)
                .join('\n')}

Recent Sessions:
${this.recentSessions
                .map(session =>
                    `- ${session.startAnchorName || 'Unknown'} -> ${session.destinationName || 'Unknown'} | ${session.status || 'unknown'} | ${this.formatDate(session.startedAt)}`
                )
                .join('\n')}
`;

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'analytics-report.txt';
        link.click();

        URL.revokeObjectURL(url);
    }
}