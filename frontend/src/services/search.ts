import apiCall from './api';

export interface SearchSuggestion {
    id: string;
    name: string;
    slug: string;
    image: string;
}

export const searchService = {
    async getSuggestions(query: string): Promise<SearchSuggestion[]> {
        if (!query || query.trim().length < 2) return [];
        return apiCall<SearchSuggestion[]>(`/search/suggestions?q=${encodeURIComponent(query.trim())}`);
    }
};
