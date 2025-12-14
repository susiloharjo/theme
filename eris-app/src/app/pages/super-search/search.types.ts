/**
 * Super Search Types
 * Standardized interfaces for cross-module search
 */

export interface SearchResult {
    id: string;
    objectType: 'CRM' | 'PMO' | 'Training' | 'Purchase';
    objectId: string;
    referenceNo?: string;
    title: string;
    subtitle?: string;
    description?: string;
    status?: string;
    ownerId?: string;
    ownerName?: string;
    department?: string;
    amount?: number;
    currency?: string;
    datePrimary?: string;
    dateSecondary?: string;
    tags?: string[];
    updatedAt: string;
}

export interface FacetValue {
    value: string;
    count: number;
}

export interface SearchFacets {
    objectType: FacetValue[];
    status: FacetValue[];
    department?: FacetValue[];
    owner?: FacetValue[];
}

export interface SearchFilters {
    objectType?: string[];
    status?: string[];
    ownerId?: string;
    department?: string;
    dateRange?: '7days' | '14days' | '30days' | '90days' | '1year' | '3years';
}

export interface SearchRequest {
    query: string;
    filters?: SearchFilters;
    page?: number;
    size?: number;
}

export interface SearchResponse {
    results: SearchResult[];
    facets: SearchFacets;
    totalCount: number;
    page: number;
    size: number;
}

export interface DateRangeOption {
    value: string;
    label: string;
    count?: number;
}
