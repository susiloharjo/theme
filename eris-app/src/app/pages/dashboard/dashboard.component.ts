import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { GridStack, GridStackOptions } from 'gridstack';

// Import gridstack CSS if not globally accessible - typically easier to add to styles.css or angular.json
// But we can try to rely on global styles or basic styling.
// For now, assuming basic usage.

export interface DashboardWidget {
    id: string;
    titles?: string; // Optional: Gridstack might not care, but we do for display
    title: string;
    type: 'stat' | 'chart' | 'list' | 'bar' | 'pie' | 'line';
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    content?: string;
    value?: string;
    icon?: string;
    color?: string;
    dashboard_id?: string;
    meta?: any; // Holds parsed content for complex widgets
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [DashboardService],
    templateUrl: './dashboard.html',
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('gridStack') gridStackEl!: ElementRef;
    private grid!: GridStack;

    widgets: DashboardWidget[] = [];
    currentDashboardId = 'main';
    availableDashboards = ['main', 'analytics', 'projects'];

    isEditMode = false;
    isLoading = true;
    error: string | null = null;

    showAddWidgetSidebar = false;

    widgetTemplates: Partial<DashboardWidget>[] = [
        { title: 'New Stat', type: 'stat', w: 2, h: 4, value: '0', icon: 'activity', color: 'bg-blue-500' },
        {
            title: 'New List', type: 'list', w: 3, h: 6,
            content: JSON.stringify({
                listItems: [
                    { label: 'Item 1', value: '100', colorClass: 'text-green-600' },
                    { label: 'Item 2', value: '50', colorClass: 'text-red-600' }
                ],
                footer: 'Just now'
            })
        },
        {
            title: 'New Bar Chart', type: 'bar', w: 3, h: 6, value: '1.2M',
            content: JSON.stringify({
                subtitle: 'Sales', unit: 'M', footer: 'YTD',
                chartData: [
                    { value: 30, colorClass: 'bg-blue-400' },
                    { value: 60, colorClass: 'bg-blue-600' },
                    { value: 45, colorClass: 'bg-blue-500' }
                ]
            })
        },
        {
            title: 'New Pie Chart', type: 'pie', w: 3, h: 6, value: '75%',
            content: JSON.stringify({
                subtitle: 'Conversion', target: '100%', footer: 'Monthly'
            })
        },
        {
            title: 'New Line Chart', type: 'line', w: 3, h: 6,
            content: JSON.stringify({
                value1: '100', value2: '80', labelStart: 'Jan', labelEnd: 'Dec'
            })
        }
    ];

    constructor(
        private dashboardService: DashboardService,
        private cdr: ChangeDetectorRef
    ) { }

    toggleAddWidgetSidebar() {
        this.showAddWidgetSidebar = !this.showAddWidgetSidebar;
    }

    addWidget(template: Partial<DashboardWidget>) {
        // Find the bottom-most position
        let maxY = 0;
        if (this.grid) {
            this.grid.engine.nodes.forEach(n => {
                // n.y and n.h might be undefined if not yet rendered, but engine nodes usually have them.
                // Fallback to widget list if needed, but grid engine is more accurate for current layout.
                const bottom = (n.y || 0) + (n.h || 0);
                if (bottom > maxY) maxY = bottom;
            });
        }

        const newWidget: DashboardWidget = {
            id: 'w_' + Date.now(),
            dashboard_id: this.currentDashboardId,
            title: template.title || 'New Widget',
            type: template.type as any,
            x: 0,
            y: maxY, // Place at the bottom to avoid shifting existing widgets
            w: template.w,
            h: template.h,
            value: template.value,
            icon: template.icon,
            color: template.color,
            content: template.content,
            meta: template.content ? JSON.parse(template.content) : undefined
        };

        this.widgets.push(newWidget);
        this.cdr.detectChanges(); // Update view

        setTimeout(() => {
            const el = document.getElementById(newWidget.id);
            if (el && this.grid) {
                // makeWidget will respect the gs-x/gs-y attributes if present, 
                // but since we are dynamically adding, we can also pass options or rely on DOM attributes.
                // The *ngFor binds [attr.gs-y]="w.y", so it should pick it up.
                this.grid.makeWidget(el);
                this.showAddWidgetSidebar = false; // Close sidebar
                this.saveLayout();

                // Scroll to the new widget
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initializeGrid();
        this.loadDashboard(this.currentDashboardId);
    }

    ngOnDestroy() {
        if (this.grid) {
            this.grid.destroy(false);
        }
    }

    initializeGrid() {
        const options: GridStackOptions = {
            cellHeight: 100,
            margin: 10,
            column: 12,
            animate: true,
            staticGrid: true, // Start in non-editable mode
            disableDrag: true,
            disableResize: true
        };

        // Initialize GridStack
        this.grid = GridStack.init(options, this.gridStackEl.nativeElement);

        // Bind Events
        this.grid.on('change', (event, items) => {
            this.saveLayout();
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        console.log('Toggling Edit Mode:', this.isEditMode);

        if (this.grid) {
            // setStatic(false) means NOT static (editable)
            // setStatic(true) means static (locked)
            this.grid.setStatic(!this.isEditMode);

            // Explicitly enable/disable to ensure it works
            if (this.isEditMode) {
                this.grid.enableMove(true);
                this.grid.enableResize(true);
            } else {
                this.grid.enableMove(false);
                this.grid.enableResize(false);
            }
        } else {
            console.error('Grid instance not found during toggle!');
        }
    }

    editWidget(w: DashboardWidget) {
        console.log('Edit widget:', w);
        // Placeholder for future edit modal
    }

    deleteWidget(w: DashboardWidget) {
        if (confirm(`Are you sure you want to delete "${w.title}"?`)) {
            // Remove from Gridstack
            const el = document.getElementById(w.id);
            if (el && this.grid) {
                this.grid.removeWidget(el);
            }

            // Remove from local array
            this.widgets = this.widgets.filter(widget => widget.id !== w.id);

            // Save changes
            this.saveLayout();
        }
    }

    loadDashboard(dashboardId: string) {
        this.isLoading = true;
        this.error = null;
        this.currentDashboardId = dashboardId;

        // Clear current grid
        this.grid.removeAll();

        this.dashboardService.getWidgets(dashboardId).subscribe({
            next: (data) => {
                console.log('Dashboard Data Received:', data);
                this.isLoading = false;

                // Parse content JSON into meta
                this.widgets = (data || []).map(w => {
                    let meta = {};
                    if (w.content && (w.type === 'list' || w.type === 'bar' || w.type === 'pie' || w.type === 'line')) {
                        try {
                            meta = JSON.parse(w.content);
                        } catch (e) {
                            console.error('Failed to parse widget content:', w.id, e);
                        }
                    }
                    return { ...w, meta };
                });

                // Add widgets to grid
                // We need to let Angular render the items? OR use Gridstack.addWidget()?
                // IF we use Angular *ngFor to render .grid-stack-item, we just need to update 'widgets' array
                // BUT Gridstack needs to know about them. 
                // The Angular wrapper approach usually involves:
                // 1. Render items with *ngFor
                // 2. Call makeWidget() after they are in DOM.
                // OR better: use grid.load(items) if items match GridStackWidget interface.

                // Let's try the *ngFor approach + makeWidget, or simpler: grid.load()
                // Our widget structure matches GridStackWidget (x,y,w,h,id).

                // Manual add for now to ensure control
                this.widgets.forEach(w => {
                    // We use a slight timeout or direct addWidget with HTML content?
                    // "Angular way": Let Angular render DOM. Angular gets confused.

                    // "Widget way": Let's use *ngFor. 
                    // We need to wait for View Update.
                });

                // Actually, simplest integration without a dedicated wrapper lib:
                // 1. Set simple widgets array for *ngFor.
                // 2. Wait for CD.
                // 3. call makeWidget on new elements.

                this.cdr.detectChanges();

                // After DOM updated
                setTimeout(() => {
                    console.log('Initializing widgets for Gridstack...');
                    this.widgets.forEach(w => {
                        // Check if already initialized? 
                        // Gridstack 'init' automatically picks up .grid-stack-item children if they exist at init.
                        // But we are adding them later.
                        // We need to tell gridstack about them.
                        // The *ngFor will create elements with class 'grid-stack-item'.
                        // We need to call makeWidget on them if they are new.
                        // Actually, if we use `grid.load(widgets)` it expects us to not have DOM?

                        // Let's use the `grid.addWidget(el)` approach? No that's for creating new DOM.

                        // HYBRID: We let Angular render the structure. We use `makeWidget` to register it.
                        // Ideally we find the element by ID.
                        const el = document.getElementById(w.id);
                        if (el) {
                            console.log('Found element for widget:', w.id);
                            this.grid.makeWidget(el);
                        } else {
                            console.warn('Could not find element for widget:', w.id);
                        }
                    });
                }, 100);

            },
            error: (err) => {
                console.error('Error loading dashboard:', err);
                this.isLoading = false;
                this.error = 'Failed to load dashboard.';
                this.cdr.detectChanges();
            }
        });
    }

    switchDashboard(id: string) {
        if (this.currentDashboardId === id) return;
        this.loadDashboard(id);
    }

    saveLayout() {
        // Get current state from Gridstack
        const gridItems = this.grid.getGridItems(); // returns elements
        // We need to map back to our data model.
        // Gridstack updates attributes on the DOM element (gs-x, gs-y, etc.) OR we can use grid.save() logic.

        const saveList = this.grid.save(false) as DashboardWidget[]; // false = don't save content, just layout

        // We need to merge this layout info back with our content/metadata (title, type, etc.)
        const mergedWidgets = saveList.map(item => {
            const original = this.widgets.find(w => w.id === item.id);
            // Gridstack save returns: x, y, w, h, id, content?
            // We must ensure 'id' is set on the grid-stack-item for this to work.
            return {
                ...original,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h
            } as DashboardWidget;
        });

        this.dashboardService.saveWidgets(this.currentDashboardId, mergedWidgets).subscribe();
    }
}
