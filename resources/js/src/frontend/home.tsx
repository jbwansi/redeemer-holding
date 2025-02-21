import Hero from '@/components/frontend/home/hero'
import Services from '@/components/frontend/home/services'
import CalendlyCTA from '@/components/frontend/layouts/calendly-cta'
import FrontLayout from '@/components/frontend/layouts/front-layout'
import { Head } from '@inertiajs/react'
import React from 'react'

function Home( { services}: any) {
    return (
        <FrontLayout>
            <Head title='La vie que vous méritez à portée de main' />
            <Hero/>
            <Services services={services} />
            <CalendlyCTA/>
        </FrontLayout>
    )
}

export default Home
