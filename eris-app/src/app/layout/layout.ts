import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  route: string;
  isActive: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  activeMenu: string | null = null;
  isNotificationsOpen = false;
  isSidebarOpen = false;
  expandedMenus: Set<string> = new Set();

  // Dynamic Top Menu State
  currentTopMenu: any[] = [];
  activeModuleTitle: string = 'My Home';

  // Breadcrumb State
  breadcrumbs: Breadcrumb[] = [];

  // Route labels mapping
  private routeLabels: { [key: string]: string } = {
    'crm': 'CRM',
    'customers': 'Customers',
    'leads': 'Leads',
    'pipeline': 'Sales Pipeline',
    'opportunities': 'Opportunities',
    'dashboard': 'Dashboard',
    'pmo': 'PMO',
    'projects': 'Projects',
    'profile': 'My Profile',
    'training': 'Training',
    'request': 'Request',
    'list': 'List',
    'purchase': 'Purchase'
  };

  menuItems = [
    {
      id: 'self-service', label: 'Self Service', icon: 'user', submenus: [
        { label: 'My Home', route: '/' },
        { label: 'My Profile', route: '/profile' },
        { label: 'Training', route: '/training/list' },
        { label: 'Purchase', route: '/purchase/list' },
        {
          label: 'Reimbursement', route: '#', children: [
            { label: 'Reimbursement Request', route: '/reimbursement/request' },
            { label: 'Reimbursement List', route: '/reimbursement/list' }
          ]
        },
        {
          label: 'Cash Advance', route: '#', children: [
            { label: 'Cash Advance Request', route: '/cash-advance/request' },
            { label: 'Cash Advance List', route: '/cash-advance/list' }
          ]
        }
      ]
    },
    {
      id: 'crm', label: 'CRM', icon: 'users', submenus: [
        { label: 'Dashboard', route: '/crm/dashboard' },
        { label: 'Customers', route: '/crm/customers' },
        { label: 'Sales Pipeline', route: '/crm/pipeline' }
      ]
    },
    {
      id: 'pmo', label: 'PMO', icon: 'briefcase', submenus: [
        { label: 'Projects', route: '/pmo/projects' },
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

  constructor(private router: Router) { }

  ngOnInit() {
    // Initialize based on current URL
    this.updateTopMenu(this.router.url);
    this.generateBreadcrumbs(this.router.url);

    // Listen to navigation changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.updateTopMenu(url);
      this.generateBreadcrumbs(url);
    });
  }

  updateTopMenu(url: string) {
    // 1. Find the module corresponding to the URL
    // Heuristic: check if URL contains the route of any submenu
    let foundModule = this.menuItems.find(menu =>
      menu.submenus.some(sub => sub.route !== '#' && sub.route !== '/' && url.startsWith(sub.route))
    );

    // Special case for root/home/profile falling under Self Service
    if (!foundModule && (url === '/' || url.startsWith('/profile') || url.startsWith('/training'))) {
      foundModule = this.menuItems.find(m => m.id === 'self-service');
    }

    if (foundModule) {
      this.currentTopMenu = foundModule.submenus;
      this.activeModuleTitle = foundModule.label;
    } else {
      // Fallback to Self Service if no module logic matches
      const defaultModule = this.menuItems.find(m => m.id === 'self-service');
      this.currentTopMenu = defaultModule ? defaultModule.submenus : [];
      this.activeModuleTitle = defaultModule?.label || 'Menu';
    }
  }

  generateBreadcrumbs(url: string) {
    const crumbs: Breadcrumb[] = [];

    console.log('Generating breadcrumbs for URL:', url);

    // Always start with home
    if (url !== '/') {
      crumbs.push({
        label: 'Home',
        route: '/',
        isActive: false
      });
    }

    // Parse URL segments
    const segments = url.split('/').filter(s => s);

    if (segments.length === 0) {
      this.breadcrumbs = [];
      console.log('No segments, breadcrumbs:', this.breadcrumbs);
      return;
    }

    let currentRoute = '';

    segments.forEach((segment, index) => {
      currentRoute += '/' + segment;
      const isLast = index === segments.length - 1;

      // Get label from mapping or use segment with capitalization
      let label = this.routeLabels[segment] || this.capitalizeWords(segment);

      // For IDs (like customer IDs), try to get more meaningful name
      if (segment.startsWith('c') && segments[index - 1] === 'customers') {
        // This would ideally fetch from a service, for now use generic
        label = 'Customer Details';
      } else if (!isNaN(Number(segment))) {
        // Skip numeric IDs for now or mark as details
        label = 'Details';
      }

      crumbs.push({
        label: label,
        route: currentRoute,
        isActive: isLast
      });
    });

    this.breadcrumbs = crumbs;
    console.log('Generated breadcrumbs:', this.breadcrumbs);
  }

  private capitalizeWords(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

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
