import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './pages/home/home/home';
import { Profile } from './pages/profile/profile/profile';

import { TrainingRequestComponent } from './pages/training/training-request/training-request';
import { TrainingListComponent } from './pages/training/training-list/training-list';
import { PurchaseRequestComponent } from './pages/purchase/purchase-request/purchase-request';
import { PurchaseListComponent } from './pages/purchase/purchase-list/purchase-list';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'myhome', component: Home },
            { path: 'profile', component: Profile, data: { breadcrumb: 'My Profile' } },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { breadcrumb: 'My Home' } },
            { path: 'training', component: TrainingListComponent, data: { breadcrumb: 'Training' } },
            { path: 'training/request', component: TrainingRequestComponent, data: { breadcrumb: 'Training Request' } },
            { path: 'training/list', component: TrainingListComponent, data: { breadcrumb: 'Training List' } },
            { path: 'purchase', component: PurchaseListComponent, data: { breadcrumb: 'Purchase' } },
            { path: 'purchase/request', component: PurchaseRequestComponent, data: { breadcrumb: 'Purchase Request' } },
            { path: 'purchase/list', component: PurchaseListComponent, data: { breadcrumb: 'Purchase List' } },
            {
                path: 'pmo',
                data: { breadcrumb: 'PMO' },
                children: [
                    { path: '', redirectTo: 'projects', pathMatch: 'full' },
                    { path: 'projects', loadComponent: () => import('./pages/pmo/project-list/project-list').then(m => m.ProjectListComponent), data: { breadcrumb: 'Projects' } },
                ]
            },
            {
                path: 'crm',
                data: { breadcrumb: 'CRM' },
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./pages/crm/dashboard/dashboard.component').then(m => m.CrmDashboardComponent), data: { breadcrumb: 'Dashboard' } },
                    { path: 'customers', loadComponent: () => import('./pages/crm/customer-list/customer-list.component').then(m => m.CustomerListComponent), data: { breadcrumb: 'Customers' } },
                    { path: 'customers/:id', loadComponent: () => import('./pages/crm/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent), data: { breadcrumb: 'Customer Details' } },
                    { path: 'leads', loadComponent: () => import('./pages/crm/leads-list/leads-list.component').then(m => m.LeadsListComponent), data: { breadcrumb: 'Leads' } },
                    { path: 'pipeline', loadComponent: () => import('./pages/crm/pipeline/pipeline.component').then(m => m.PipelineComponent), data: { breadcrumb: 'Sales Pipeline' } },
                    { path: 'opportunities', loadComponent: () => import('./pages/crm/opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent), data: { breadcrumb: 'Opportunities' } },
                ]
            },
            {
                path: 'system-settings',
                children: [
                    { path: '', redirectTo: 'widget-library', pathMatch: 'full' },
                    { path: 'widget-library', loadComponent: () => import('./pages/widget-library/widget-library.component').then(m => m.WidgetLibraryComponent), data: { breadcrumb: 'Widget Library' } }
                ]
            }
        ]
    }
];
