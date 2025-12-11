import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-template-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-template-sidebar.component.html',
})
export class EditTemplateSidebarComponent {
    @Input() isVisible = false;
    @Input() config: any = {};
    @Input() editingTemplate: any = null;
    @Input() availableRoutes: any[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    activeTab: any = 'Settings';

    // Internal JSON string for textarea
    jsonContent: string = '';

    // Add available icons as static list for now, similar to dashboard
    availableIcons = ['link', 'triangle', 'chevron', 'user', 'cart', 'gear', 'monitor', 'pie-chart', 'wrench', 'truck', 'home', 'search', 'bell', 'calendar', 'users', 'dollar-sign', 'eye', 'activity', 'trending-up'];

    constructor() {
    }

    ngOnChanges() {
        if (this.isVisible && this.config) {
            // Initialize jsonContent from config.content
            if (this.config.content && typeof this.config.content === 'object') {
                this.jsonContent = JSON.stringify(this.config.content, null, 2);
            } else if (typeof this.config.content === 'string') {
                this.jsonContent = this.config.content;
                // Try to parse it to object for input binding if possible
                try {
                    this.config.content = JSON.parse(this.config.content);
                } catch (e) {
                    // Keep as string
                }
            } else {
                this.jsonContent = '';
            }
        }
    }

    onJsonContentChange(newValue: string) {
        this.jsonContent = newValue;
        try {
            // Try to parse and update config.content object
            const parsed = JSON.parse(newValue);
            this.config.content = parsed;
        } catch (e) {
            // Invalid JSON, don't update object yet or set to null? 
            // Better to let it be invalid until save or just keep config.content as reference?
            // If we don't update config.content, the Value input won't update.
            // But if we can't parse, we can't update.
        }
    }

    // Helper to safely get value for input
    get contentValue(): string {
        return this.config?.content?.value || '';
    }

    set contentValue(v: string) {
        if (!this.config.content) this.config.content = {};
        // If content is just a string (old format), force it to object? 
        if (typeof this.config.content === 'string') {
            this.config.content = { label: this.config.content };
        }

        this.config.content.value = v;
        // Sync json string
        this.jsonContent = JSON.stringify(this.config.content, null, 2);
    }

    get actionPath(): string {
        return this.config?.action?.payload || '';
    }

    set actionPath(v: string) {
        if (!v) {
            delete this.config.action;
            return;
        }
        if (!this.config.action) {
            this.config.action = { type: 'navigate' };
        }
        this.config.action.type = 'navigate'; // Ensure type
        this.config.action.payload = v;
    }

    onClose() {
        this.close.emit();
    }

    onSave() {
        // Ensure config.content matches jsonContent if it was edited textually
        // actually onJsonContentChange handles it.
        // But if json was invalid, we might have an issue. 
        // We will trust the current state of config.
        if (typeof this.config.content === 'string') {
            // Try one last parse
            try {
                this.config.content = JSON.parse(this.config.content);
            } catch (e) { }
        }
        this.save.emit(this.config);
    }
}
