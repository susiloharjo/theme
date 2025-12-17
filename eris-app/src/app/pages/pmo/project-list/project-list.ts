import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../project.service';
import { Project, GanttTask } from '../pmo.types';
import { SearchService } from '../../../services/search.service';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './project-list.html',
})
export class ProjectListComponent implements OnInit {

    constructor(
        private cdr: ChangeDetectorRef,
        private projectService: ProjectService,
        private searchService: SearchService
    ) { }

    selectedProject: Project | null = null;
    searchTerm: string = '';
    activeTab: 'org-chart' | 'procurement' | 'cash-advance' | 'gantt' | 's-curve' | 'financial' | 'kyc' | 'risk' | 'documents' = 'gantt';
    expandedFinancialCategory: string | null = null;

    // AI Simulation State
    showSimulationModal = false;
    simulationLoading = false;
    simulationResult: any = null;


    projects: Project[] = [];
    searchResults: Set<string> | null = null;

    filterStatus: string = 'All';
    filterProgressMax: number = 100;

    get filteredProjects() {
        return this.projects.filter(p => {
            // Priority 1: Search Filter (if active)
            if (this.searchResults && !this.searchResults.has(p.id)) {
                return false;
            }

            // Fallback: Local search if no API search results yet (or as backup)
            if (!this.searchResults && this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                if (!p.name.toLowerCase().includes(term) && !p.id.toLowerCase().includes(term)) {
                    return false;
                }
            }

            const matchesStatus = this.filterStatus === 'All' || p.status === this.filterStatus;
            const matchesProgress = p.progress <= this.filterProgressMax;

            return matchesStatus && matchesProgress;
        });
    }

    ngOnInit() {
        this.projectService.getProjects().subscribe({
            next: (data) => {
                this.projects = data;
                if (this.projects.length > 0) {
                    this.selectedProject = this.projects[0];
                }
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load projects', err)
        });
    }

    onSearch() {
        if (!this.searchTerm.trim()) {
            this.searchResults = null;
            return;
        }

        this.searchService.search(this.searchTerm, { objectType: 'PMO' }).subscribe({
            next: (response) => {
                this.searchResults = new Set(response.results.map(r => r.objectId));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Search failed', err);
                // Fallback to local search implicitly by clearing searchResults but keeping searchTerm
                this.searchResults = null;
                this.cdr.detectChanges();
            }
        });
    }

    selectProject(project: Project) {
        this.selectedProject = project;
        this.activeTab = 'org-chart'; // Reset tab on selection
    }

    getTaskStyle(task: GanttTask): { [key: string]: string } {
        if (!this.selectedProject) return {};

        const projectStart = new Date(this.selectedProject.startDate).getTime();
        const projectEnd = new Date(this.selectedProject.endDate).getTime();
        const totalDuration = projectEnd - projectStart;

        const taskStart = new Date(task.startDate).getTime();
        const taskEnd = new Date(task.endDate).getTime();

        if (totalDuration <= 0) return { left: '0%', width: '0%' };

        let leftPercent = ((taskStart - projectStart) / totalDuration) * 100;
        let widthPercent = ((taskEnd - taskStart) / totalDuration) * 100;

        // Clamp values
        if (leftPercent < 0) leftPercent = 0;
        if (widthPercent + leftPercent > 100) widthPercent = 100 - leftPercent;

        return {
            'left': `${leftPercent}%`,
            'width': `${widthPercent}%`
        };
    }

    getSCurvePath(type: 'planned' | 'actual'): string {
        if (!this.selectedProject || !this.selectedProject.sCurve || this.selectedProject.sCurve.length === 0) return '';

        const data = this.selectedProject.sCurve;
        const width = 100; // units
        const height = 100; // units

        const stepX = width / (data.length - 1);

        let path = '';
        data.forEach((point, index) => {
            const x = index * stepX;
            // Invert Y because SVG coordinates top-left is 0,0
            const val = type === 'planned' ? point.planned : point.actual;
            if (val === undefined || val === null && type === 'actual') return; // handle missing actuals for future

            const y = height - val;

            if (index === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });

        return path;
    }

    toggleFinancialCategory(category: string) {
        if (this.expandedFinancialCategory === category) {
            this.expandedFinancialCategory = null;
        } else {
            this.expandedFinancialCategory = category;
        }
    }

    // --- AI SIMULATION LOGIC ---
    runSimulation() {
        console.log('Run simulation clicked');
        this.showSimulationModal = true;
        this.simulationLoading = true;
        this.simulationResult = null;

        // Simulate API delay
        setTimeout(() => {
            try {
                if (this.selectedProject) {
                    this.calculateSimulation(this.selectedProject);
                } else {
                    console.warn('No project selected for simulation');
                    this.simulationLoading = false;
                }
            } catch (error) {
                console.error('Simulation failed:', error);
                this.simulationLoading = false;
            } finally {
                this.cdr.detectChanges();
            }
        }, 5000); // 5 second delay to simulate AI processing
    }

    calculateSimulation(project: Project) {
        console.log('Calculating simulation for', project.name);

        // SAFEGUARD: Ensure budgetStats exists
        if (!project.budgetStats) {
            console.warn('Missing budgetStats for project');
            // Create default stats if missing to prevent crash
            project.budgetStats = { timelineProgress: 0, forecastCompletion: 0, burnRateMessage: 'N/A', status: 'On Track' };
        }

        // 1. Calculate Schedule Deviation
        // Simple logic: If progress < timelineProgress, assume delay
        const deviation = (project.budgetStats?.timelineProgress || 0) - (project.progress || 0);
        let delayDays = 0;

        const today = new Date();
        const endDate = project.endDate ? new Date(project.endDate) : new Date();

        if (deviation > 5) {
            // Significant delay: Add 1.5 days for every 1% deviation
            delayDays = Math.ceil(deviation * 1.5);
        } else if (deviation < -5) {
            // Ahead of schedule
            delayDays = -Math.floor(Math.abs(deviation) * 0.5);
        }

        const predictedDate = new Date(endDate);
        predictedDate.setDate(predictedDate.getDate() + delayDays);

        // 2. Budget Forecast
        // Parse budget string to number (removing "Rp" and ",")
        const budgetStr = project.budget || '0';
        const budgetTotal = parseInt(budgetStr.replace(/[^0-9]/g, ''), 10) || 0;

        // Forecast based on current burn rate: (Budget / Progress) * 100
        // If progress is 0, avoid divide by zero
        const effectiveProgress = project.progress || 1;
        const predictedBudget = ((project.budgetStats?.forecastCompletion || 100) / 100) * budgetTotal;

        const isOverrun = predictedBudget > budgetTotal;


        // 3. Risks & Recommendations
        const newRisks = [];
        const recommendations = [];

        if (delayDays > 10) {
            newRisks.push({ task: 'Overall Schedule', risk: 'High' });
            recommendations.push('Consider fast-tracking critical path tasks.');
            recommendations.push('Negotiate timeline extension with stakeholders.');
        } else if (delayDays > 0) {
            newRisks.push({ task: 'Mid-term Milestones', risk: 'Medium' });
            recommendations.push('Monitor critical path closely.');
        }

        if (isOverrun) {
            newRisks.push({ task: 'Budget Control', risk: 'High' });
            recommendations.push('Review resource allocation and hourly rates.');
            recommendations.push('Freeze non-essential scope changes.');
        }

        if (project.riskStats && project.riskStats.high > 0) {
            recommendations.push('Detailed mitigation plan required for High priority risks.');
        }

        // Critical Path (Mock)
        const criticalPath = ['Requirement', 'Design', 'Dev', 'UAT', 'Go-Live'];

        this.simulationResult = {
            predictedCompletionDate: predictedDate,
            delayDays: delayDays,
            budgetForecast: {
                overrun: isOverrun,
                predictedAtCompletion: predictedBudget
            },
            confidenceScore: 0.85, // Mock confidence
            criticalPath: criticalPath,
            risks: newRisks.length ? newRisks : [{ task: 'None', risk: 'Low' }],
            recommendations: recommendations.length ? recommendations : ['Continue monitoring progress.']
        };

        this.simulationLoading = false;
    }
}

