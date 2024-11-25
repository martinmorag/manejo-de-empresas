    "use client";

    import { useState, useEffect, FormEvent } from 'react';
    import { CreateVentaFormData, Producto, DetalleVenta, Cliente } from '@/app/lib/definitions';
    import ProductSearch from '../productos/ProductSearch'; // Adjust the import path as necessary
    import ClientSearch from '../clientes/ClientSearch';
    import { useRouter } from 'next/navigation';

    const CreateVenta = () => {
        const [formData, setFormData] = useState<CreateVentaFormData>({
            payment: 0,
            payment_method: 'Efectivo',
            clienteid: "",
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
        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
        const [errors, setErrors] = useState<{ [key: string]: string }>({});
        const router = useRouter();

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

        const handleProductSelect = (product: Producto) => {
            setSelectedProduct(product);
            setSelectedProductPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price);
        };    

        const handleClientSelect = (client: Cliente) => {
            setSelectedClient(client);
            setFormData(prev => ({
                ...prev,
                clienteid: client.id,
            }));
        };

        const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value, 10);
            setQuantity(value > 0 ? value : 1); // Ensure quantity is at least 1
        };

        const handleSaleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSaleDate(e.target.value);
        };

        const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value);
            setDiscount(value >= 0 ? value : 0); // Ensure discount is not negative
        };

        const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setFormData(prev => ({
                ...prev,
                payment_method: e.target.value as 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito',
            }));
        };

        const handleIvaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setIvaPercentage(parseFloat(e.target.value) || 0);
        };

        const handleClientPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value);
            console.log('Client payment change:', value); // Debugging log
            if (!isNaN(value) && value >= 0) {
                setClientPayment(value);
                setFormData(prev => ({
                    ...prev,
                    payment: value
                }));
        
                if (value > 0 && value <= totalWithIva) {
                    setErrors(prevErrors => ({ ...prevErrors, payment: '' }));
                } else if (value > totalWithIva) {
                    setErrors(prevErrors => ({ ...prevErrors, payment: 'El pago no puede ser mayor que el total.' }));
                }
            } else {
                setClientPayment(0);
                setFormData(prev => ({
                    ...prev,
                    payment: 0
                }));
        
                setErrors(prevErrors => ({ ...prevErrors, payment: 'El pago del cliente debe ser un número mayor a 0' }));
            }
        };    
        
        const handleCreditToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                // Clear debt amount when credit is unchecked
                setFormData(prev => ({
                    ...prev,
                    deuda_amount: 0,
                }));
            }
        };
        
    
        const Total = selectedProductPrice * quantity;
        const discountAmount = (Total * discount) / 100;
        const subtotal = Total - discountAmount;
        const ivaAmount = (subtotal * ivaPercentage) / 100;
        const totalWithIva = parseFloat((subtotal + ivaAmount).toFixed(2));



        const handleSetFullPayment = () => {
            if (totalWithIva <= 0) return;
            setClientPayment(totalWithIva);
            setFormData(prev => ({
                ...prev,
                deuda_amount: 0,
            }));
        };

        // Update deuda_amount when clientPayment or is_on_credit changes
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
            
            const errors: { [key: string]: string } = {};
            let hasErrors = false;

            if (!selectedClient || !selectedProduct || !selectedProduct.id) {
                console.log('Cliente o producto no está seleccionado correctamente.')
                return;
            }
        
            const ivaPercentageNumber = parseFloat(ivaPercentage.toString());
        
            if (isNaN(clientPayment) || clientPayment <= 0) {
                errors.payment = 'El pago del cliente debe ser un número mayor a 0';
                hasErrors = true;
            }
        
            if (hasErrors) {
                setErrors(errors);
                return;
            }

            setErrors({});
        
            // Calculate the balance due
            const balanceDue = parseFloat((totalWithIva - clientPayment).toFixed(2));
        
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
                        productname: selectedProduct.name,
                        quantity,
                        price: selectedProductPrice,
                        iva_percentage: ivaPercentageNumber,
                        discount: discount
                    }
                ],
                balance_due: balanceDue.toFixed(2)
            };
        
            console.log('Final Form Data:', updatedFormData);
        
            try {
                const response = await fetch('/api/venta', {
                    method: 'POST',
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
                    console.error("Error creando venta:", result);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };   
        
        const isFormValid = (totalWithIva > 0 && (clientPayment >= totalWithIva || formData.is_on_credit));

        return (
            <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-lg">
                <label className="mb-1">Clientes</label>
                <ClientSearch onSelect={handleClientSelect} />
                <label className="mt-4 mb-1">Productos</label>
                <ProductSearch onSelect={handleProductSelect} />
                <div className="flex flex-col justify-items">
                    <div className="flex items-center justify-between my-5 w-[100%]">
                        <p className="text-lg font-semibold">Producto Seleccionado:
                        {selectedProduct && (
                            <> {selectedProduct.name} </>
                        )}</p>
                        <p className="text-lg">Precio:
                        {selectedProduct && (
                            <>  ${selectedProductPrice.toFixed(2)} </>
                        )}</p>
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
                                    value={clientPayment.toFixed(2)} 
                                    onChange={handleClientPaymentChange} 
                                    min="0"
                                    step="0.01"
                                    className="p-2 border rounded-md"
                                />
                                <button 
                                    type="button"
                                    onClick={handleSetFullPayment}
                                    className="ml-4 p-2 bg-blue-500 text-white rounded-md"
                                >
                                    Todo
                                </button>
                                {errors.payment && <p className="text-red-500">{errors.payment}</p>}
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
                                    disabled={clientPayment===totalWithIva}
                                    className="mr-2"
                                />
                                Pagar parcialmente
                            </label>
                        </div>
                        <div>
                            <p className="text-lg">Total a pagar: ${totalWithIva.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between my-5 w-[100%]">
                        <div>
                            <p className="text-lg">Deuda:
                            {formData.is_on_credit && (
                            <> ${formData.deuda_amount.toFixed(2)} </>
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
                            disabled={!isFormValid}
                            className={`w-[100%] py-2 px-4 rounded-md ${isFormValid ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                        >
                            {totalWithIva > 0 && (clientPayment >= totalWithIva || formData.is_on_credit) ? 'Registrar Venta' : 'Completar información'}
                        </button>
                </div>  

                {Object.entries(validationErrors).map(([field, error]) => (
                    <p key={field} className="text-red-500">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </p>
                ))}

            </form>
        );
    };

    export default CreateVenta;