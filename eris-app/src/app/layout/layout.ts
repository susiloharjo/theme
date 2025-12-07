import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  activeMenu: string | null = null;
  isNotificationsOpen = false;
  isSidebarOpen = false;
  expandedMenus: Set<string> = new Set();

  menuItems = [
    {
      id: 'self-service', label: 'Self Service', icon: 'user', submenus: [
        { label: 'My Profile', route: '/profile' },
        { label: 'Training', route: '/training/list' },
        { label: 'Purchase', route: '/purchase/list' },
        { label: 'Reimbursement', route: '#' },
        { label: 'Cash Advance', route: '#' }
      ]
    },
    {
      id: 'crm', label: 'CRM', icon: 'users', submenus: [
        { label: 'Customers', route: '#' },
        { label: 'Leads', route: '#' },
        { label: 'Opportunities', route: '#' },
        { label: 'Sales Pipeline', route: '#' }
      ]
    },
    {
      id: 'pmo', label: 'PMO', icon: 'briefcase', submenus: [
        { label: 'Projects', route: '#' },
        { label: 'Tasks', route: '#' },
        { label: 'Milestones', route: '#' },
        { label: 'Resources', route: '#' }
      ]
    },
    {
      id: 'procurement', label: 'Procurement', icon: 'shopping-cart', submenus: [
        { label: 'Purchase Request', route: '/purchase/request' },
        { label: 'Purchase List', route: '/purchase/list' },
        { label: 'Vendor Management', route: '#' },
        { label: 'RFQ Management', route: '#' }
      ]
    },
    {
      id: 'warehouse', label: 'Warehouse', icon: 'package', submenus: [
        { label: 'Inventory', route: '#' },
        { label: 'Stock Movement', route: '#' },
        { label: 'Goods Receipt', route: '#' },
        { label: 'Stock Transfer', route: '#' }
      ]
    },
    {
      id: 'fico', label: 'FICO', icon: 'dollar-sign', submenus: [
        { label: 'General Ledger', route: '#' },
        { label: 'Accounts Payable', route: '#' },
        { label: 'Accounts Receivable', route: '#' },
        { label: 'Cost Center', route: '#' }
      ]
    },
    {
      id: 'helpdesk', label: 'Help Desk', icon: 'headphones', submenus: [
        { label: 'Create Ticket', route: '#' },
        { label: 'My Tickets', route: '#' },
        { label: 'Knowledge Base', route: '#' },
        { label: 'FAQ', route: '#' }
      ]
    },
    {
      id: 'hris', label: 'HRIS', icon: 'users', submenus: [
        { label: 'Employee Directory', route: '#' },
        { label: 'Attendance', route: '#' },
        { label: 'Payroll', route: '#' },
        { label: 'Performance Review', route: '#' }
      ]
    },
    {
      id: 'asset', label: 'Asset Management', icon: 'server', submenus: [
        { label: 'Asset Register', route: '#' },
        { label: 'Asset Assignment', route: '#' },
        { label: 'Maintenance', route: '#' },
        { label: 'Depreciation', route: '#' }
      ]
    },
    {
      id: 'ebudget', label: 'E-Budget', icon: 'pie-chart', submenus: [
        { label: 'Budget Planning', route: '#' },
        { label: 'Budget Monitoring', route: '#' },
        { label: 'Budget Approval', route: '#' },
        { label: 'Budget Reports', route: '#' }
      ]
    },
    {
      id: 'project-control', label: 'Project Control', icon: 'clipboard', submenus: [
        { label: 'Project Dashboard', route: '#' },
        { label: 'Cost Control', route: '#' },
        { label: 'Schedule Control', route: '#' },
        { label: 'Risk Management', route: '#' }
      ]
    }
  ];
  isUserMenuOpen = false;
  @ViewChild('navContainer') navContainer!: ElementRef;

  toggleMenu(menuName: string) {
    this.activeMenu = this.activeMenu === menuName ? null : menuName;
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  closeNotifications() {
    this.isNotificationsOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleSubmenu(menuId: string) {
    if (this.expandedMenus.has(menuId)) {
      this.expandedMenus.delete(menuId);
    } else {
      this.expandedMenus.add(menuId);
    }
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus.has(menuId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activeMenu && this.navContainer && !this.navContainer.nativeElement.contains(event.target)) {
      this.activeMenu = null;
    }
  }
}
