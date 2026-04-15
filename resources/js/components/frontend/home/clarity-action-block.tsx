import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

type BlockItem = {
    text: string
}

type ClarityActionBlockProps = {
    enabled?: boolean
    title?: string
    leftTitle?: string
    leftItems?: BlockItem[]
    rightTitle?: string
    rightItems?: BlockItem[]
}

export default function ClarityActionBlock({
    enabled = true,
    title,
    leftTitle,
    leftItems = [],
    rightTitle,
    rightItems = [],
}: ClarityActionBlockProps) {
    if (!enabled) return null

    const filteredLeftItems = leftItems.filter((item) => item?.text?.trim())
    const filteredRightItems = rightItems.filter((item) => item?.text?.trim())

    if (!title && !filteredLeftItems.length && !filteredRightItems.length) {
        return null
    }

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
                        Transformation
                    </span>

                    {title ? (
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                            {title}
                        </h2>
                    ) : null}

                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Identifiez ce qui freine votre progression et découvrez le cadre concret pour avancer avec plus de clarté, de constance et de résultats.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {leftTitle ? (
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {leftTitle}
                            </h3>
                        ) : null}

                        <div className="mt-6 space-y-4">
                            {filteredLeftItems.map((item, index) => (
                                <div
                                    key={`left-${index}`}
                                    className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                                >
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10 flex-shrink-0">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>

                                    <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {rightTitle ? (
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {rightTitle}
                            </h3>
                        ) : null}

                        <div className="mt-6 space-y-4">
                            {filteredRightItems.map((item, index) => (
                                <div
                                    key={`right-${index}`}
                                    className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                                >
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10 flex-shrink-0">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>

                                    <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}