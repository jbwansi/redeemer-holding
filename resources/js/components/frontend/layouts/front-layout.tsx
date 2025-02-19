import React from 'react'
import Navbar from './navbar'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from './footer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function FrontLayout({ children }: any) {


    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            },
        },
    });


    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Navbar />
                {children}
                <Footer />
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default FrontLayout
