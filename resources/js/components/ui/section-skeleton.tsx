// resources/js/components/frontend/ui/section-skeleton.tsx
export function SectionSkeleton() {
    return (
        <div className="py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse">
                <div className="mx-auto mb-10 h-6 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="mx-auto mb-4 h-10 w-2/3 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="mx-auto h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
        </div>
    )
}