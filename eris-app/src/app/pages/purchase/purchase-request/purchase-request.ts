import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Use CommonModule instead of NgIf/NgFor directly
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-purchase-request',
    standalone: true,
    imports: [CommonModule, FormsModule], // Import CommonModule here
    templateUrl: './purchase-request.html',
})
export class PurchaseRequestComponent {

    // Mock Data
    readonly AVAILABLE_PRODUCTS = [
        { name: 'Laptop Dell XPS 15', price: 25000000 },
        { name: 'MacBook Pro M3', price: 28000000 },
        { name: 'Monitor LG 27"', price: 4500000 },
        { name: 'Mouse Logitech MX Master', price: 1500000 },
        { name: 'Keyboard Keychron K2', price: 1200000 },
        { name: 'Office Chair Herman Miller', price: 15000000 },
        { name: 'Notebook Paper A4 (Box)', price: 50000 },
        { name: 'Ballpoint Pen (Dozen)', price: 25000 }
    ];

    readonly AVAILABLE_SERVICES = [
        { name: 'IT Support Maintenance', price: 5000000 },
        { name: 'Cloud Server Hosting (Monthly)', price: 2000000 },
        { name: 'Software License Subscription', price: 1500000 },
        { name: 'Cleaning Service (Monthly)', price: 3000000 },
        { name: 'AC Maintenance', price: 750000 },
        { name: 'Printer Repair Service', price: 500000 }
    ];

    // Model for form data
    request = {
        requestDate: new Date().toISOString().split('T')[0],
        requiredDate: '',
        department: '',
        requester: 'John Doe',
        justification: '',
        productItems: [
            { productName: '', quantity: 1, unitPrice: 0, filteredOptions: [] as any[] }
        ],
        serviceItems: [
            { serviceName: '', quantity: 1, unitPrice: 0, filteredOptions: [] as any[] }
        ]
    };

    // --- Product Methods ---

    addProductItem() {
        this.request.productItems.push({ productName: '', quantity: 1, unitPrice: 0, filteredOptions: [] });
    }

    removeProductItem(index: number) {
        if (this.request.productItems.length > 0) {
            this.request.productItems.splice(index, 1);
        }
    }

    onBlurProduct(index: number) {
        setTimeout(() => {
            if (this.request.productItems[index]) {
                this.request.productItems[index].filteredOptions = [];
            }
        }, 200);
    }

    filterProducts(index: number) {
        const query = this.request.productItems[index].productName.toLowerCase();
        if (query) {
            this.request.productItems[index].filteredOptions = this.AVAILABLE_PRODUCTS.filter(p =>
                p.name.toLowerCase().includes(query)
            );
        } else {
            this.request.productItems[index].filteredOptions = [];
        }
    }

    selectProduct(index: number, product: any) {
        this.request.productItems[index].productName = product.name;
        this.request.productItems[index].unitPrice = product.price;
        this.request.productItems[index].filteredOptions = []; // Hide dropdown
    }

    // --- Service Methods ---

    addServiceItem() {
        this.request.serviceItems.push({ serviceName: '', quantity: 1, unitPrice: 0, filteredOptions: [] });
    }

    removeServiceItem(index: number) {
        if (this.request.serviceItems.length > 0) {
            this.request.serviceItems.splice(index, 1);
        }
    }

    onBlurService(index: number) {
        setTimeout(() => {
            if (this.request.serviceItems[index]) {
                this.request.serviceItems[index].filteredOptions = [];
            }
        }, 200);
    }

    filterServices(index: number) {
        const query = this.request.serviceItems[index].serviceName.toLowerCase();
        if (query) {
            this.request.serviceItems[index].filteredOptions = this.AVAILABLE_SERVICES.filter(s =>
                s.name.toLowerCase().includes(query)
            );
        } else {
            this.request.serviceItems[index].filteredOptions = [];
        }
    }

    selectService(index: number, service: any) {
        this.request.serviceItems[index].serviceName = service.name;
        this.request.serviceItems[index].unitPrice = service.price;
        this.request.serviceItems[index].filteredOptions = []; // Hide dropdown
    }

    // --- Totals ---

    get totalProductAmount(): number {
        return this.request.productItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    get totalServiceAmount(): number {
        return this.request.serviceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    get grandTotal(): number {
        return this.totalProductAmount + this.totalServiceAmount;
    }

    onSubmit() {
        // Clean up filteredOptions before submitting/logging
        const cleanRequest = {
            ...this.request,
            productItems: this.request.productItems.map(({ filteredOptions, ...rest }) => rest),
            serviceItems: this.request.serviceItems.map(({ filteredOptions, ...rest }) => rest)
        };
        console.log('Purchase Request Submitted:', cleanRequest);
        alert('Purchase request submitted successfully! (Check console for data)');
    }
}

