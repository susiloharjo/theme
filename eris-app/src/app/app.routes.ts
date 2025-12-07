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
            { path: '', component: Home },
            { path: 'profile', component: Profile },
            { path: 'training/request', component: TrainingRequestComponent },
            { path: 'training/list', component: TrainingListComponent },
            { path: 'purchase/request', component: PurchaseRequestComponent },
            { path: 'purchase/list', component: PurchaseListComponent },
            {
                path: 'pmo',
                children: [
                    { path: 'projects', loadComponent: () => import('./pages/pmo/project-list/project-list').then(m => m.ProjectListComponent) },
                ]
            },
            {
                path: 'crm',
                children: [
                    { path: 'dashboard', loadComponent: () => import('./pages/crm/dashboard/dashboard.component').then(m => m.CrmDashboardComponent) },
                    { path: 'customers', loadComponent: () => import('./pages/crm/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
                    { path: 'customers/:id', loadComponent: () => import('./pages/crm/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent) },
                    { path: 'leads', loadComponent: () => import('./pages/crm/leads-list/leads-list.component').then(m => m.LeadsListComponent) },
                    { path: 'pipeline', loadComponent: () => import('./pages/crm/pipeline/pipeline.component').then(m => m.PipelineComponent) },
                    { path: 'opportunities', loadComponent: () => import('./pages/crm/opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent) },
                ]
            },
        ]
    }
];
