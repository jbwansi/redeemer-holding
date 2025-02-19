import { Head } from "@inertiajs/react"
import FormService from "./form-service"


export default function Create() {
    return (
        <>
            <Head title="Nouveau service" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Nouveau service offert par Redeemer Holding
                    </h1>
                </div>

                <FormService mode="create" />
            </div>
        </>
    )
}
