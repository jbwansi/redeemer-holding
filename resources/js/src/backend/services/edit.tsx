import React from "react";
import { PageProps } from "@inertiajs/core";

import { Service } from "@/types/service";
import FormService from "./form-service";

interface EditServiceProps extends PageProps {
    service: Service;

}

const Edit = ({ service }: EditServiceProps) => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Modifier le service</h2>
                    <p className="text-muted-foreground">
                        Modifiez les informations de votre service
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <FormService mode="edit" service={service} />
            </div>
        </div>
    );
};

export default Edit;
