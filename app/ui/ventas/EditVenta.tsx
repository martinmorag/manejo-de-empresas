"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { CreateVentaFormData, Producto, DetalleVenta, Cliente } from '@/app/lib/definitions';
import EditProductSearch from './EditProductSearch'; 
import EditClientSearch from './clientes/EditClientSearch';
import { useRouter, usePathname } from 'next/navigation';

const EditVenta = () => {
    const pathname = usePathname();
    const ventaId = pathname.split('/').pop();

    const [formData, setFormData] = useState<CreateVentaFormData>({
        payment: 0,
        payment_method: 'Efectivo',
        clienteid: '',
        detalles_ventas: [],
        is_on_credit: false,
        deuda_amount: 0,
        due_date: null,
        total: 0,
  });

    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [selectedProductPrice, setSelectedProductPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [ivaPercentage, setIvaPercentage] = useState<number>(0);
    const [clientPayment, setClientPayment] = useState<number>(0);
    const [daysUntilDue, setDaysUntilDue] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [detalleVentaId, setdetalleVentaID] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);
    const router = useRouter();

    const fetchProductDetails = async (productId: string) => {
        try {
            const response = await fetch(`/api/producto/${productId}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error("Failed to fetch product details");
                return null;
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            return null;
        }
    };
    
    const fetchVentaData = useCallback(async () => {
        if (!ventaId) return; 
        try {
            const response = await fetch(`/api/venta/${ventaId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData(data);

                if (data.balance_due > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        is_on_credit: true,
                    }))   
                }
                
                if (data.detalles_ventas.length > 0) {
                    const firstDetalle = data.detalles_ventas[0];
                    if (firstDetalle && firstDetalle.productoid) {
                        setSelectedProductId(firstDetalle.productoid); 
                        const productDetails = await fetchProductDetails(firstDetalle.productoid);
                        if (productDetails) {
                            setSelectedProduct(productDetails)
                            setSelectedProductPrice(parseFloat(productDetails.price.toString()));
                        } else {
                            console.error("Failed to fetch product details for productId:", firstDetalle.productoid);
                        }
                    } else {
                        console.error("Product ID is undefined.");
                    }

                    setQuantity(firstDetalle.quantity);
                    setDiscount(firstDetalle.discount || 0);
                    setIvaPercentage(firstDetalle.iva_percentage || 0);
                }
                
                
                setClientPayment(data.payment);
                setSelectedClientId(data.clienteid);
                
    
                if (data.sale_date) {
                    setSaleDate(new Date(data.sale_date).toISOString().split('T')[0]);
                }
    
                if (data.is_on_credit && data.due_date) {
                    const dueDate = new Date(data.due_date);
                    const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    setDaysUntilDue(daysDiff);
                }

                const detallesVenta: DetalleVenta[] = Array.isArray(data?.detalles_ventas) ? data.detalles_ventas : [];
                const detalle_id = detallesVenta.map((detalle: DetalleVenta) => detalle.id);
                if (detalle_id.length > 0) {
                    setdetalleVentaID(detalle_id[0]); // Set the first 'id'
                    console.log("type of", typeof detalle_id[0]);
                    console.log(detalle_id[0]);
                } else {
                    console.log('No detalle IDs found.');
                }
                
                console.log('Detalles Ventas:', data.detalles_ventas);

                console.log('Fetched Venta Data:', data);
                console.log('Selected Product:', selectedProduct);
                
            } else {
                console.error("Failed to fetch venta data");
            }
        } catch (error) {
            console.error("Error fetching venta data:", error);
        }
    }, [ventaId]);
    
    useEffect(() => {
        fetchVentaData();
    }, [fetchVentaData]);
    

    useEffect(() => {
        if (formData.is_on_credit && daysUntilDue !== null && daysUntilDue > 0) {
        const calculatedDueDate = new Date();
        calculatedDueDate.setDate(calculatedDueDate.getDate() + daysUntilDue);
        setFormData((prev) => ({
            ...prev,
            due_date: calculatedDueDate.toISOString(),
        }));
        } else {
        setFormData((prev) => ({
            ...prev,
            due_date: null,
        }));
        }
    }, [daysUntilDue, formData.is_on_credit]);

    useEffect(() => {
        const fetchIvaPercentage = async () => {
            try {
                const response = await fetch('/api/negocio'); // Adjust the API path as necessary
                const data = await response.json();
                if (response.ok) {
                    setIvaPercentage(data.iva_percentage || 0);
                } else {
                    console.error("Error fetching IVA percentage:", data);
                }
            } catch (error) {
                console.error("Error fetching IVA percentage:", error);
            }
        };

        fetchIvaPercentage();
    }, []);

    const handleProductSelect = useCallback((product: Producto) => {
        setSelectedProduct(product);
        setSelectedProductPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price);
    }, []);
    
    const handleClientSelect = useCallback((client: Cliente) => {
        console.log('Client selected:', client);
        setSelectedClient(client);
        setFormData(prev => ({
            ...prev,
            clienteid: client.id,
        }));
    }, []);

    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(value > 0 ? value : 1);
    }, []);

    const handleSaleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSaleDate(e.target.value);
    }, []);

    const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setDiscount(value >= 0 ? value : 0);
    }, []);

    const handlePaymentMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            payment_method: e.target.value as 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito',
        }));
    }, []);

    const handleIvaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setIvaPercentage(parseFloat(e.target.value) || 0);
    }, []);

    const Total = selectedProductPrice * quantity;
    const discountAmount = (Total * discount) / 100;
    const subtotal = Total - discountAmount;
    const ivaAmount = (subtotal * ivaPercentage) / 100;
    let totalWithIva = subtotal + ivaAmount;
    totalWithIva = parseFloat(totalWithIva.toFixed(2));

    const handleClientPaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setClientPayment(value);
            setFormData(prev => ({
                ...prev,
                payment: value
            }));
        } else {
            setClientPayment(0);
            setFormData(prev => ({
                ...prev,
                payment: 0
            }));
        }
    }, [totalWithIva]);

    const handleCreditToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const isOnCredit = e.target.checked;
        const calculatedDebt = isOnCredit ? totalWithIva - clientPayment : 0;

        setFormData(prev => ({
            ...prev,
            is_on_credit: isOnCredit,
            deuda_amount: calculatedDebt > 0 ? calculatedDebt : 0,
            due_date: isOnCredit && daysUntilDue ? new Date(new Date().setDate(new Date().getDate() + daysUntilDue)).toISOString() : null,
        }));
        
        if (!isOnCredit) {
            setDaysUntilDue(null);
            setFormData(prev => ({
                ...prev,
                deuda_amount: 0,
            }));
        }
    }, [clientPayment, daysUntilDue, totalWithIva]);

    const handleSetFullPayment = useCallback(() => {
        if (totalWithIva <= 0) return;
        setClientPayment(totalWithIva);
        setFormData(prev => ({
            ...prev,
            deuda_amount: 0,
        }));
    }, [totalWithIva]);

    useEffect(() => {
        if (formData.is_on_credit) {
            const calculatedDebt = totalWithIva - clientPayment;
            setFormData(prev => ({
                ...prev,
                deuda_amount: calculatedDebt > 0 ? calculatedDebt : 0,
            }));
        }
    }, [clientPayment, totalWithIva, formData.is_on_credit]);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedProduct || !selectedProduct.id) {
            setError("No se pudo encontrar el producto o el cliente.");
            return;
        }
    
        const ivaPercentageNumber = parseFloat(ivaPercentage.toString());
    
        // Calculate the balance due
        const balanceDue = totalWithIva - clientPayment;
    
        // Determine the status based on payment and credit conditions
        const status = balanceDue <= 0
            ? 'Pagado'
            : 'Parcialmente pagado';
        

        // Update formData with current values
        const updatedFormData = {
            ...formData,
            payment: clientPayment, // Use the state value for payment
            status: status,
            total: totalWithIva,
            detalles_ventas: [
                {
                    productoid: selectedProduct.id,
                    quantity,
                    price: selectedProductPrice,
                    iva_percentage: ivaPercentageNumber,
                    discount: parseFloat(discount.toString()),
                    id: detalleVentaId
                }
            ],
            balance_due: balanceDue.toFixed(2)
        };
    
        console.log('Final Form Data:', updatedFormData);
    
        try {
            if (!ventaId) return; 
            const response = await fetch(`/api/venta/${ventaId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFormData),
              });
    
            const result = await response.json();
            if (response.ok) {
                console.log('Venta registrada:', result);
    
                // Reset form fields
                setSelectedProduct(null);
                setSelectedProductPrice(0);
                setQuantity(1);
                setDiscount(0);
                setSaleDate(new Date().toISOString().split('T')[0]);
                setIvaPercentage(0);
                setFormData({
                    payment: 0,
                    payment_method: 'Efectivo',
                    clienteid: '',
                    detalles_ventas: [],
                    is_on_credit: false,
                    deuda_amount: 0,
                    due_date: null, 
                    total: 0
                }); 
                
                router.push("/panel/ventas")
            } else {
                const result = await response.json();
                if (result.errors) {
                    const formattedErrors = result.errors.reduce(
                        (acc: { [key: string]: string }, error: { path: string; message: string }) => {
                            acc[error.path] = error.message;
                            return acc;
                        },
                        {}
                    );
                    setValidationErrors(formattedErrors);
                } else {
                    setError(result.message || "Error al actualizar la venta.");
                }
                setMessage(null);
            }
        } catch (error) {
            console.error("Error actualizando la venta:", error);
            setError("Error actualizando la venta.");
            setMessage(null);
            setValidationErrors(null);
        }
    };   
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-xl">
            <label className="mb-2">Cliente</label>
            <EditClientSearch 
            onSelect={handleClientSelect} 
            selectedClientId={selectedClientId ?? undefined}
            />
            <label className="mt-4 mb-2">Producto</label>
            <EditProductSearch 
            onSelect={handleProductSelect}
            selectedProductId={selectedProductId ?? undefined}  
            />
            <div className="flex flex-col justify-items">
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <p className="text-xl font-semibold">Producto Seleccionado: 
                    {selectedProduct && (
                        <> {selectedProduct.name} </>
                    )}</p>
                    <p className="text-xl">Precio: 
                        {selectedProductPrice !== undefined && selectedProductPrice !== null ? (
                            <> ${parseFloat(selectedProductPrice.toString() || '0').toFixed(2)} </>
                        ) : (
                            <> Precio no disponible </>
                        )}
                    </p>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <label className="pr-3">Cantidad</label>
                        <input
                            type="number"
                            required
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="mb-4 p-2 border rounded-md"
                        />
                        {validationErrors?.quantity && <p className="text-red-600">{validationErrors.quantity}</p>}
                    </div>
                    <div>
                        <label className='mr-3'>IVA (%)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            min="0" 
                            value={ivaPercentage} 
                            onChange={handleIvaChange} 
                            className="mb-4 p-2 border rounded-md"
                        />
                        {validationErrors?.ivePercentage && <p className="text-red-600">{validationErrors.ivaPercentage}</p>}
                    </div>
                    <div>
                        <label className='mr-3'>Descuento (%)</label>
                        <input
                            type="number" 
                            id="discount" 
                            name="discount" 
                            value={discount}
                            onChange={handleDiscountChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className=" mb-4 p-2 border rounded-md"
                        />
                        {validationErrors?.discount && <p className="text-red-600">{validationErrors.discount}</p>}
                    </div>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <label className='mr-3'>Fecha</label>
                        <input 
                            type="date" 
                            id="saleDate" 
                            value={saleDate} 
                            onChange={handleSaleDateChange} 
                            className="p-2 border rounded-md"
                        />
                        {validationErrors?.saleDate && <p className="text-red-600">{validationErrors.saleDate}</p>}
                    </div>
                    <div>
                        <label className='mr-3'>Método de Pago</label>
                        <select 
                            value={formData.payment_method} 
                            onChange={handlePaymentMethodChange}
                            className="p-2 border rounded-md"
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <div>
                            <label className='mr-3'>Pago Cliente</label>
                            <input 
                                type="number" 
                                id="clientPayment" 
                                value={parseFloat(clientPayment.toString() || '0').toFixed(2)} 
                                onChange={handleClientPaymentChange} 
                                min="0"
                                step="0.01"
                                className="p-2 border rounded-md"
                            />
                            {validationErrors?.clientPayment && <p className="text-red-600">{validationErrors.clientPayment}</p>}
                            <button 
                                type="button"
                                onClick={handleSetFullPayment}
                                className="ml-4 p-2 bg-blue-500 text-white rounded-md"
                            >
                                Todo
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.is_on_credit} 
                                onChange={handleCreditToggle} 
                                className="mr-2"
                                disabled={clientPayment >= totalWithIva}
                            />
                            Pagar parcialmente
                        </label>
                    </div>
                    <div>
                        <p className="text-xl">Total a pagar: ${totalWithIva.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <p className="text-xl">Deuda:
                        {formData.is_on_credit && (
                        <> ${formData.deuda_amount ? formData.deuda_amount.toFixed(2) : '0.00'} </>
                        )}</p>
                    </div>
                    <div>
                        <label>
                            Días para pagar:
                            <input
                                type="number"
                                min="1"
                                value={daysUntilDue ?? ''}
                                onChange={(e) => setDaysUntilDue(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Número de días"
                                disabled={!formData.is_on_credit}
                                className="ml-3 p-2 border rounded-md"
                            />
                            {validationErrors?.daysUntilDue && <p className="text-red-600">{validationErrors.daysUntilDue}</p>}
                        </label>
                        {formData.due_date && (
                            <p className="mt-3">
                                Fecha de vencimiento: {new Date(formData.due_date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center my-5 w-[100%]">
                <button
                    type="submit"
                    disabled={!(totalWithIva > 0 && (clientPayment >= totalWithIva || formData.is_on_credit))}
                    className={`w-[100%] py-2 px-4 rounded-md ${
                        totalWithIva > 0 && (clientPayment >= totalWithIva || formData.is_on_credit)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                >
                    {totalWithIva > 0 && (clientPayment >= totalWithIva || formData.is_on_credit)
                        ? 'Actualizar Venta'
                        : 'Completar información'}
                </button>
            </div>
        </form>
    );
};

export default EditVenta;