import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Training {
    id: string;
    topic: string;
    provider: string; // Subtitle for topic
    type: string;
    location: string;
    startDate: string;
    endDate: string;
    status: 'Pending Approval' | 'Approved' | 'In Progress';
    cost: string; // Formatted string for now
}

interface ColumnConfig {
    key: keyof Training | 'select' | 'actions'; // 'select' and 'actions' are special columns
    label: string;
    visible: boolean;
}

@Component({
    selector: 'app-training-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './training-list.html',
})
export class TrainingListComponent {
    @ViewChild('settingsMenu') settingsMenu!: ElementRef;
    @ViewChild('settingsButton') settingsButton!: ElementRef;

    isSettingsOpen = false;

    // Search & Sort State
    searchText = '';
    sortColumn: string | null = null;
    sortDirection: 'asc' | 'desc' = 'asc';

    // Default Columns Configuration
    columns: ColumnConfig[] = [
        { key: 'select', label: '', visible: true },
        { key: 'topic', label: 'Topic', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'location', label: 'Location', visible: true },
        { key: 'startDate', label: 'Start Date', visible: true },
        { key: 'cost', label: 'Cost (IDR)', visible: true },
        { key: 'actions', label: 'Actions', visible: true }
    ];

    // Mock Data
    trainings: Training[] = [
        {
            id: '1',
            topic: 'Advanced Angular Development',
            provider: 'Udemy',
            type: 'Technical Skills',
            location: 'Online',
            startDate: '2024-12-10',
            endDate: '2024-12-12',
            status: 'Pending Approval',
            cost: '1,500,000'
        },
        {
            id: '2',
            topic: 'Leadership 101',
            provider: 'Internal HR',
            type: 'Management',
            location: 'Jakarta Office',
            startDate: '2024-11-05',
            endDate: '2024-11-05',
            status: 'Approved',
            cost: 'Free'
        },
        {
            id: '3',
            topic: 'Safety & Compliance 2024',
            provider: 'E-Learning',
            type: 'Compliance',
            location: 'Online',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'In Progress',
            cost: 'Free'
        },
        {
            id: '4',
            topic: 'Cybersecurity Fundamentals',
            provider: 'Coursera',
            type: 'Technical Skills',
            location: 'Online',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            status: 'Pending Approval',
            cost: '2,000,000'
        },
        {
            id: '5',
            topic: 'Project Management Professional',
            provider: 'PMI',
            type: 'Certification',
            location: 'Singapore',
            startDate: '2024-05-10',
            endDate: '2024-05-15',
            status: 'Approved',
            cost: '15,000,000'
        },
        {
            id: '6',
            topic: 'Effective Communication',
            provider: 'Internal HR',
            type: 'Soft Skills',
            location: 'Bali Office',
            startDate: '2024-03-01',
            endDate: '2024-03-02',
            status: 'In Progress',
            cost: 'Free'
        },
        // Adding more dummy data to reach 15 items
        {
            id: '7',
            topic: 'Data Analysis with Python',
            provider: 'DataCamp',
            type: 'Technical Skills',
            location: 'Online',
            startDate: '2024-06-01',
            endDate: '2024-06-30',
            status: 'Approved',
            cost: '300,000'
        },
        {
            id: '8',
            topic: 'Conflict Resolution',
            provider: 'Internal HR',
            type: 'Soft Skills',
            location: 'Jakarta Office',
            startDate: '2024-07-10',
            endDate: '2024-07-11',
            status: 'Pending Approval',
            cost: 'Free'
        },
        {
            id: '9',
            topic: 'AWS Solutions Architect',
            provider: 'A Cloud Guru',
            type: 'Technical Skills',
            location: 'Online',
            startDate: '2024-08-01',
            endDate: '2024-09-15',
            status: 'In Progress',
            cost: '2,500,000'
        },
        {
            id: '10',
            topic: 'Agile Methodologies',
            provider: 'Scrum Alliance',
            type: 'Certification',
            location: 'Bandung',
            startDate: '2024-04-20',
            endDate: '2024-04-22',
            status: 'Approved',
            cost: '5,000,000'
        },
        {
            id: '11',
            topic: 'Public Speaking Masterclass',
            provider: 'Udemy',
            type: 'Soft Skills',
            location: 'Online',
            startDate: '2024-09-05',
            endDate: '2024-09-06',
            status: 'Pending Approval',
            cost: '200,000'
        },
        {
            id: '12',
            topic: 'Machine Learning Basics',
            provider: 'Coursera',
            type: 'Technical Skills',
            location: 'Online',
            startDate: '2024-10-01',
            endDate: '2024-11-01',
            status: 'In Progress',
            cost: '1,200,000'
        },
        {
            id: '13',
            topic: 'Time Management',
            provider: 'Internal HR',
            type: 'Soft Skills',
            location: 'Jakarta Office',
            startDate: '2024-01-15',
            endDate: '2024-01-15',
            status: 'Approved',
            cost: 'Free'
        },
        {
            id: '14',
            topic: 'Financial Accounting 101',
            provider: 'EdX',
            type: 'Finance',
            location: 'Online',
            startDate: '2024-05-01',
            endDate: '2024-05-20',
            status: 'Pending Approval',
            cost: '800,000'
        },
        {
            id: '15',
            topic: 'Business English',
            provider: 'EF',
            type: 'Language',
            location: 'Online',
            startDate: '2024-02-01',
            endDate: '2024-04-01',
            status: 'Approved',
            cost: '3,000,000'
        }
    ];

    // Pagination
    currentPage = 1;
    pageSize = 10;

    get filteredSortedTrainings(): Training[] {
        let result = [...this.trainings];

        // Filter
        if (this.searchText) {
            const lowerSearch = this.searchText.toLowerCase();
            result = result.filter(item =>
                item.topic.toLowerCase().includes(lowerSearch) ||
                item.provider.toLowerCase().includes(lowerSearch) ||
                item.type.toLowerCase().includes(lowerSearch) ||
                item.location.toLowerCase().includes(lowerSearch)
            );
        }

        // Sort
        if (this.sortColumn) {
            result.sort((a, b) => {
                let valA = (a as any)[this.sortColumn!]?.toString().toLowerCase() || '';
                let valB = (b as any)[this.sortColumn!]?.toString().toLowerCase() || '';

                // Handle Cost sorting manually (remove commas, handle 'free')
                if (this.sortColumn === 'cost') {
                    const numA = valA === 'free' ? 0 : parseInt(valA.replace(/,/g, ''), 10) || 0;
                    const numB = valB === 'free' ? 0 : parseInt(valB.replace(/,/g, ''), 10) || 0;
                    return this.sortDirection === 'asc' ? numA - numB : numB - numA;
                }

                // Default String/Date sorting
                if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }

    get paginatedTrainings(): Training[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredSortedTrainings.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSortedTrainings.length / this.pageSize) || 1;
    }

    get startIndex(): number {
        if (this.filteredSortedTrainings.length === 0) return 0;
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        if (this.filteredSortedTrainings.length === 0) return 0;
        return Math.min(this.startIndex + this.pageSize - 1, this.filteredSortedTrainings.length);
    }

    onSort(column: string) {
        if (column === 'select' || column === 'actions') return;

        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
        if (this.isSettingsOpen) {
            // alert('Settings Menu Opened!'); // Commenting out alert after testing, used for debug
            console.log('Settings Menu Opened');
        }
    }

    closeSettings() {
        this.isSettingsOpen = false;
    }

    toggleColumn(colKey: string) {
        const col = this.columns.find(c => c.key === colKey);
        if (col) {
            col.visible = !col.visible;
        }
    }
}
