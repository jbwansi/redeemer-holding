import Hero from '@/components/frontend/home/hero'
import Services from '@/components/frontend/home/services'
import CalendlyCTA from '@/components/frontend/layouts/calendly-cta'
import FrontLayout from '@/components/frontend/layouts/front-layout'
import AdvancedGallery from '@/components/frontend/vertical-gallery'
import { Head } from '@inertiajs/react'
import React from 'react'

function Home() {
    return (
        <FrontLayout>
            <Head title='Accueil' />
            <Hero/>
            <Services/>
            <CalendlyCTA/>
        </FrontLayout>
    )
}

export default Home
