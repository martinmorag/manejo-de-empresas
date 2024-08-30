"use client";

import { useState, useEffect, FormEvent } from 'react';
import { CreateVentaFormData, Producto, DetalleVenta } from '@/app/lib/definitions';
import ProductSearch from './ProductSearch'; // Adjust the import path as necessary

const CreateVenta = () => {
    const [formData, setFormData] = useState<CreateVentaFormData>({
        total: 0,
        payment_method: 'Efectivo',
        detalles_ventas: [],
    });


    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [selectedProductPrice, setSelectedProductPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [ivaPercentage, setIvaPercentage] = useState<number>(0);

    useEffect(() => {
        // Fetch IVA percentage from the server when the component mounts
        const fetchIvaPercentage = async () => {
            try {
                const response = await fetch('/api/negocio'); // Adjust the API path as necessary
                const data = await response.json();
                if (response.ok) {
                    setIvaPercentage(data.iva_percentage || 0);
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
        setIvaPercentage(parseFloat(e.target.value));
    };

    const Total = selectedProductPrice * quantity;
    const discountAmount = (Total * discount) / 100;
    const subtotal = Total - discountAmount;
    const ivaAmount = (subtotal * ivaPercentage) / 100;
    const totalWithIva = subtotal + ivaAmount;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct) {
            console.error('No product selected');
            return;
        }
    
        if (!selectedProduct.id) {
            console.error('Product ID is missing');
            return;
        }
    
        // Convert iva_percentage to a number
        const ivaPercentageNumber = parseFloat(ivaPercentage.toString());
    
        // Update formData with current values
        const updatedFormData = {
            ...formData,
            total: totalWithIva,
            detalles_ventas: [
                {
                    productoid: selectedProduct.id, // Ensure it's a string
                    quantity,
                    price: selectedProductPrice,
                    iva_percentage: ivaPercentageNumber,
                    discount: discount
                }
            ],
        };
    
    
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
                    total: 0,
                    payment_method: 'Efectivo',
                    detalles_ventas: [],
                });
            } else {
                console.error('Error al registrar la venta:', result);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            // Handle network error
        }
    };    
    

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-xl">
            <label className="mb-2">Productos:</label>
            <ProductSearch onSelect={handleProductSelect} />
            <div className="flex flex-col justify-items">
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <p className="text-xl font-semibold">Producto Seleccionado: 
                    {selectedProduct && (
                        <> {selectedProduct.name} </>
                    )}</p>
                    <p className="text-xl">Precio: 
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
                        <label className='mr-3'>Descuento</label>
                        <input
                            type="number" 
                            id="discount" 
                            name="discount" 
                            value={discount}
                            onChange={handleDiscountChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="p-2 border rounded-md"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between my-5 w-[100%]">
                    <div>
                        <label className='mr-3'>Fecha</label>
                        <input 
                        type="date" 
                        id="sale_date" 
                        name="sale_date" 
                        value={saleDate}
                        onChange={handleSaleDateChange} 
                        />
                    </div>
                    <div>
                        <label className='mr-3'>Método de pago</label>
                        <select 
                            value={formData.payment_method}
                            onChange={handlePaymentMethodChange}
                            className="p-2 border rounded-md"
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta de crédito">Tarjeta de Crédito</option>
                            <option value="tarjeta de débito">Tarjeta de Débito</option>
                        </select>
                    </div>
                </div>
            </div>

            <label>Total:</label>
            <p className="text-xl font-semibold">${totalWithIva.toFixed(2)}</p>

            <button type="submit" className="mt-[3.5rem] mb-5 w-[180px] h-[45px] ml-auto bg-white rounded-lg text-xl border-[3px] border-main border-solid">Registrar Venta</button>
        </form>
    );
};

export default CreateVenta;