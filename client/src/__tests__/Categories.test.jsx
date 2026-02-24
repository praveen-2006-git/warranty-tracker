import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Categories from '../pages/Categories.jsx';
import { categoriesAPI } from '../services/api.js';

// Mock the API responses completely so tests run offline
vi.mock('../services/api.js', () => ({
    categoriesAPI: {
        getAll: vi.fn(),
    },
}));

// Provide a mock provider wrapper because the component depends on Routers and context.
const AllTheProviders = ({ children }) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    );
};

describe('Categories Page Integration', () => {

    it('renders the main heading correctly on mount', async () => {
        // Setup our mock implementation to instantly return no categories
        categoriesAPI.getAll.mockResolvedValue({ data: [] });

        render(<Categories />, { wrapper: AllTheProviders });

        // Ensure the loading spinner or header shows up
        const heading = await screen.findByText('Categories');
        expect(heading).toBeInTheDocument();
    });

    it('displays fetched categories correctly from the mockup API', async () => {
        const mockCategories = [
            { _id: '1', name: 'Laptops', description: 'Portable computers', isDefault: true },
            { _id: '2', name: 'Smartphones', description: 'Mobile devices', isDefault: false }
        ];

        categoriesAPI.getAll.mockResolvedValue({ data: mockCategories });

        render(<Categories />, { wrapper: AllTheProviders });

        // Wait for the components to mount and async useEffect to fire
        await waitFor(() => {
            expect(screen.getByText('Laptops')).toBeInTheDocument();
            expect(screen.getByText('Smartphones')).toBeInTheDocument();
        });

        // Check if the chips rendered based on isDefault
        expect(screen.getByText('System Default')).toBeInTheDocument();
        expect(screen.getByText('Custom')).toBeInTheDocument();
    });

});
