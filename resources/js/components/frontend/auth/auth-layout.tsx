import { Head, Link } from "@inertiajs/react";
import { motion } from 'framer-motion';
// Composant AuthLayout partagé pour Login et Register
export const AuthLayout = ({ children, title, subtitle }: any) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title={title} />

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent"></div>
            <div className="absolute top-40 left-10 w-80 h-80 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-8">
                    <div className="relative overflow-hidden group h-14 w-14 rounded-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#DA2E29] via-rose-500 to-orange-500 rounded-xl opacity-80 group-hover:opacity-100 blur p-[1px] transition-opacity duration-300"></div>
                        <div className="relative rounded-xl bg-white dark:bg-gray-900 h-full w-full flex items-center justify-center border border-gray-200 dark:border-gray-800">
                            <span className="text-[#DA2E29] font-bold text-2xl">R</span>
                        </div>
                    </div>
                </Link>

                <motion.h2
                    className="mt-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {title}
                </motion.h2>
                <motion.p
                    className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700/30 relative overflow-hidden">
                    {/* Subtle pattern for background */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>

                    {children}
                </div>
            </div>
        </div>
    );
};
