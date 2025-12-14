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

  menuItems = [
    {
      id: 'self-service', label: 'Self Service', icon: 'user', submenus: [
        { label: 'My Home', route: '/dashboard' },
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
    },
    {
      id: 'system-settings', label: 'System Setting', icon: 'settings', submenus: [
        { label: 'Widget Library', route: '/system-settings/widget-library' }
      ]
    }
  ];
  isUserMenuOpen = false;
  @ViewChild('navContainer') navContainer!: ElementRef;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    // Initialize based on current URL
    this.updateTopMenu(this.router.url);
    this.generateBreadcrumbs();

    // Listen to navigation changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.updateTopMenu(url);
      this.generateBreadcrumbs();
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

  generateBreadcrumbs() {
    const breadcrumbs: Breadcrumb[] = [];
    let route = this.activatedRoute.root;
    let url = '';

    // Traverse the activated route tree
    while (route) {
      // Check if this route has children
      if (route.firstChild) {
        route = route.firstChild;

        // Get the route segment(s)
        const routeURL = route.snapshot.url.map(segment => segment.path).join('/');
        if (routeURL) {
          url += `/${routeURL}`;
        }

        // Get breadcrumb from route data
        const breadcrumb = route.snapshot.data['breadcrumb'];

        if (breadcrumb) {
          breadcrumbs.push({
            label: breadcrumb,
            route: url,
            isActive: false
          });
        }
      } else {
        break;
      }
    }

    // Mark the last breadcrumb as active
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    // Always add "My Home" at the beginning (if not on home page)
    if (breadcrumbs.length > 0) {
      breadcrumbs.unshift({
        label: 'My Home',
        route: '/dashboard',
        isActive: false
      });
    }

    this.breadcrumbs = breadcrumbs;
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
