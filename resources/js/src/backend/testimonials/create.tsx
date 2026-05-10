import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Create({ services = [] }: any) {
    const [data, setData] = useState({
        name: "",
        message: "",
        rating: 5,
        photo: null as File | null,
        service_id: ""
    });

    const { errors } = usePage().props as any;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("message", data.message);
        formData.append("rating", String(data.rating));

        if (data.service_id) {
            formData.append("service_id", data.service_id);
        }

        if (data.photo) {
            formData.append("photo", data.photo);
        }

        router.post(route("testimonials.store"), formData, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Ajouter témoignage" />

            <form onSubmit={submit} className="p-6 max-w-xl space-y-4">
                <h1 className="text-2xl font-bold">Ajouter témoignage</h1>

                {Object.keys(errors || {}).length > 0 && (
                    <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        {Object.entries(errors).map(([key, value]: any) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Nom"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full border p-2"
                />

                <input
                    type="text"
                    placeholder="Rôle (ex: Coach, CEO...)"
                    value={data.role || ""}
                    onChange={(e) => setData({ ...data, role: e.target.value })}
                    className="w-full border p-2"
                />

                <input
                    type="text"
                    placeholder="Entreprise (ex: Google, Freelance...)"
                    value={data.company || ""}
                    onChange={(e) => setData({ ...data, company: e.target.value })}
                    className="w-full border p-2"
                />

                <textarea
                    placeholder="Message"
                    value={data.message}
                    onChange={(e) => setData({ ...data, message: e.target.value })}
                    className="w-full border p-2"
                />

                <select
                    value={data.rating}
                    onChange={(e) =>
                        setData({ ...data, rating: Number(e.target.value) })
                    }
                    className="w-full rounded border p-2"
                >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                </select>

                <select
                    value={data.service_id}
                    onChange={(e) => setData({ ...data, service_id: e.target.value })}
                    className="w-full rounded border p-2"
                >
                    <option value="">Témoignage global</option>

                    {services.map((service: any) => (
                        <option key={service.id} value={service.id}>
                            {service.name}
                        </option>
                    ))}
                </select>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setData({
                            ...data,
                            photo: e.target.files?.[0] ?? null,
                        })
                    }
                />

                <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-white"
                >
                    Enregistrer
                </button>
            </form>
        </>
    );
}