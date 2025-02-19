import React from 'react'
import Navbar from './navbar'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from './footer'

function FrontLayout({children}: any) {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Navbar/>
            {children}
            <Footer/>
        </ThemeProvider>
    )
}

export default FrontLayout
