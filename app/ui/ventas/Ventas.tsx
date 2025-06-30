"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "@/app/ui/ConfirmDelete"; 
import { Venta, AvailableMonth } from "@/app/lib/definitions";
import { TablesVentasSkeleton } from "@/app/ui/skeletons";
import * as XLSX from "xlsx";

const Ventas: React.FC = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedVentaId, setSelectedVentaId] = useState<string | null>(null);
    const [expandedVentaId, setExpandedVentaId] = useState<string | null>(null);
    const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
    const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");;
    const router = useRouter();
    

    useEffect(() => {
        const fetchAvailableMonths = async () => {
            try {
                const response = await fetch("/api/venta");
                if (!response.ok) throw new Error("Error obteniendo los meses disponibles.");
                
                const data: AvailableMonth[] = await response.json();
                setAvailableMonths(data); 

                if (data.length > 0) {
                    setSelectedMonthYear(`${data[data.length - 1].month} ${data[data.length - 1].year}`);
                    console.log("selected month year actual: ", `${data[data.length - 1].month} ${data[data.length - 1].year}`)
                } else {
                    setLoading(false);
                }
            } catch (error) {
                setError("Error al cargar los meses disponibles.");
                setLoading(false);
            }
        };

        fetchAvailableMonths();
    }, []);

    console.log("usestate months ", availableMonths);
    const [month, year] = selectedMonthYear.split(" "); 
    console.log("Month:", month, "Year:", year);

    useEffect(() => {
        if(!selectedMonthYear) return;

        const [month, year] = selectedMonthYear.split(" "); 
        //console.log("Month:", month, "Year:", year);

        const fetchVentas = async () => {
            try {
                const response = await fetch(`/api/venta?year=${year}&month=${month}`);
                if (!response.ok) throw new Error("Error obteniendo las ventas.");
                
                const data: Venta[] = await response.json();
                setVentas(data);
            } catch (error) {
                setError("Error al cargar las ventas.");
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, [selectedMonthYear]);

    console.log("Render Ventas. loading:", loading);

    const handleMonthYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonthYear(event.target.value);
    };

    const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const monthIndex = parseInt(month, 10) - 1; // Convert to zero-based index
    const monthName = monthNames[monthIndex];
    const exportToExcel = () => {
        const worksheetData = ventas.map((venta) => ({
            Fecha: new Date(venta.created_at).toLocaleDateString(),
            Productos: venta.detalles_ventas.map((detalle) => detalle.productname).join(", "),
            Pago: typeof venta.payment === 'number' ? venta.payment.toFixed(2) : parseFloat(venta.payment).toFixed(2),
            "Saldo Pendiente": typeof venta.balance_due === 'number' 
                ? venta.balance_due.toFixed(2) 
                : venta.balance_due 
                    ? parseFloat(venta.balance_due).toFixed(2) 
                    : 'N/A',
            "Método de Pago": venta.payment_method || 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

        const filename = `Ventas ${monthName} ${year}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    /* Pagination */

    const itemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(ventas.length / itemsPerPage);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return ventas.slice(startIndex, startIndex + itemsPerPage);
    };

    const displayedItems = getPaginatedData();

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };
    
    /* Toggle, Delete and Edit */

    const toggleDetails = (ventaId: string) => {
        setExpandedVentaId(expandedVentaId === ventaId ? null : ventaId);
    };

    const handleEdit = (id: string) => {
        router.push(`/panel/ventas/editar/${id}`);
    };

    const handleDelete = async () => {
        if (!selectedVentaId) return;

        try {
            const response = await fetch(`/api/venta?id=${selectedVentaId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error eliminando la venta.");
            }

            setVentas((prevVentas) =>
                prevVentas.filter((venta) => venta.id !== selectedVentaId)
            );
            setIsModalVisible(false);
            setSelectedVentaId(null);
        } catch (error) {
            setError("Error al eliminar la venta.");
        }
    };

    /*  Confirmation Modal and loading  */

    const openConfirmationModal = (id: string) => {
        setSelectedVentaId(id);
        setIsModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setIsModalVisible(false);
        setSelectedVentaId(null);
    };

    if (loading) {
        return <TablesVentasSkeleton />;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            <div className="flex justify-between">
                <select id="month-year-select" 
                value={selectedMonthYear} 
                onChange={handleMonthYearChange}
                className="my-3 p-1 rounded-md">
                    <option value="" disabled>Selecciona un mes</option>
                    {availableMonths.map(({ formatted, month, year }) => (
                        <option key={`${month}-${year}`} value={`${month} ${year}`}>
                            {formatted}
                        </option>
                    ))}
                </select>
                <button onClick={exportToExcel} className="my-3 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
                    Descargar Ventas
                </button>
            </div>
            {ventas.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="border border-gray-300 px-4 py-2">Fecha</th>
                            <th className="border border-gray-300 px-4 py-2">Producto</th>
                            <th className="border border-gray-300 px-4 py-2">Pago</th>
                            <th className="border border-gray-300 px-4 py-2">Saldo Pendiente</th>
                            <th className="border border-gray-300 px-4 py-2">Método de Pago</th>
                            <th className="w-[80px] text-center px-2 py-2 bg-background"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((venta) => (
                            <React.Fragment key={venta.id}>
                                <tr onClick={() => toggleDetails(venta.id)} className="cursor-pointer">
                                    <td className="border border-gray-300 px-4">
                                        {new Date(venta.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        {venta.detalles_ventas.map((detalle) => (
                                            <p key={detalle.id}> {/* Assuming detalle has a unique ID */}
                                                {detalle.productname} {/* Display product name */}
                                            </p>
                                        ))}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        ${parseFloat(venta.payment.toString()).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        ${venta.balance_due ? parseFloat(venta.balance_due.toString()).toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        {venta.payment_method || 'N/A'}
                                    </td>
                                    <td className="px-2 flex justify-between items-center space-x-2 w-[80px]">
                                        <button onClick={() => handleEdit(venta.id)}>
                                            <PencilIcon className="w-7 h-7 bg-blue-500 text-white p-1 rounded hover:bg-blue-700" />
                                        </button>
                                        <button onClick={() => openConfirmationModal(venta.id)}>
                                            <TrashIcon className="w-7 h-7 bg-red-500 text-white p-1 rounded hover:bg-red-700" />
                                        </button>
                                    </td>
                                </tr>
                                {expandedVentaId === venta.id && (
                                    <tr>
                                        <td colSpan={4} className="border border-gray-300 px-4 py-2">
                                            <ul className="list-disc pl-5">
                                                {venta.detalles_ventas.map((detalle, index) => (
                                                    <li key={index} className="mb-2">
                                                        <p><strong>Cantidad:</strong> {detalle.quantity}</p>
                                                        <p><strong>Precio:</strong> $ {parseFloat(detalle.price.toString()).toFixed(2)}</p>
                                                        <p><strong>IVA:</strong> % {detalle.iva_percentage ?? 'N/A'}</p>
                                                        <p><strong>Descuento:</strong> % {detalle.discount ?? 'N/A'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay ventas disponibles.</p>
            )}
            {totalPages > 1 && (
                <div className="flex justify-center my-5">
                    <button onClick={previousPage}>
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                    <p className="text-lg m-2 p-2 bg-gray-300 rounded-md">{currentPage}</p>
                    <button onClick={nextPage}>
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
            <ConfirmationModal
                message="¿Estás seguro de que deseas eliminar esta venta?"
                onConfirm={handleDelete}
                onCancel={closeConfirmationModal}
                isVisible={isModalVisible}
            />
        </>
    );
};

export default Ventas;