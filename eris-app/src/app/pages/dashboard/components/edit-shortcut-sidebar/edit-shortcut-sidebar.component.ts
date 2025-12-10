import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-shortcut-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-shortcut-sidebar.component.html',
})
export class EditShortcutSidebarComponent {
    @Input() isVisible = false;
    @Input() config: any = {};
    @Input() editingWidgetId: string | null = null;
    @Input() availableRoutes: any[] = [];
    @Input() availableIcons: string[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();

    activeTab = 'Settings'; // Default to Settings as per recent changes/preferences or 'Data' if we want to stick to original but user moved stuff to Settings. Let's stick to Settings since that's where content is. actually user said Data tab is placeholder. 
    // Wait, in the code view activeTab was default 'Data' in Dashboard, but let's see. 
    // In DashboardComponent it was initialized to 'Data'.
    // However, the fields were moved to settings. So maybe default to Settings? 
    // Let's keep 'Data' to match previous logic unless I see otherwise. 
    // Actually, looking at the last edits, the user moved things to Settings. It might be better to default to Settings? 
    // Let's stick to 'Data' to avoid changing behavior too much, or 'Settings' if 'Data' is empty.
    // The 'Data' tab is placeholder now. It makes sense to default to 'Settings'.
    // But wait, the previous code had `activeTab = 'Data'` in DashboardComponent. 
    // I will initialize it to 'Data' to be safe, but the inputs are in Settings. 
    // ACTUALLY, if 'Data' is empty, user has to click 'Settings' every time. That's annoying.
    // I'll set default to 'Settings'.

    constructor() {
        this.activeTab = 'Settings';
    }

    onClose() {
        this.close.emit();
    }

    onSave() {
        this.save.emit();
    }
}
