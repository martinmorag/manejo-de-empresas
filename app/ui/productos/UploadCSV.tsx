"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { ProductCSV, CsvRow } from '@/app/lib/definitions';
import { useRouter } from 'next/navigation';

const UploadCSV: React.FC = () => {
    const [previewData, setPreviewData] = useState<ProductCSV[]>([]);
    const [error, setError] = useState<string>('');
    const [uploadError, setUploadError] = useState<string>(''); // Error for upload
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); // Clear previous errors
        setPreviewData([]);

        const file = event.target.files?.[0]; // Optional chaining to handle cases where no file is selected
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase(); // Get the file extension
            if (fileExtension === 'csv') {
                parseCSV(file);
            } else if (fileExtension === 'xlsx') {
                parseXLSX(file);
            } else {
                setError('Por favor suba un archivo .csv o .xlsx');
                event.target.value = '';
            }
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const products: ProductCSV[] = results.data.map((row) => ({
                    name: row.nombre,
                    description: row.descripcion,
                    barcode: row["codigo de barras"],
                    price: parseFloat(row.precio), // Convert to number
                }));
                setPreviewData(products);
            },
            error: (error) => {
                setError('Error subiendo archivo.');
                console.error(error);
            },
        });
    };

    const parseXLSX = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const products: ProductCSV[] = jsonData.slice(1).map((row) => ({
              name: row[0] as string, // Cast to string
              description: row[1] as string, // Cast to string
              barcode: row[2] as string, // Cast to string
              price: parseFloat(row[3] as string), // Cast to string before parsing
            }));
          
            setPreviewData(products);
        };

        reader.onerror = () => {
            setError('Error leyendo archivo XLSX.');
        };

        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        setUploadError('');

        try {
            const promises = previewData.map(async (product) => {
                const response = await fetch('/api/producto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });
    
                if (!response.ok) {
                    // Capture the error from the server response
                    const errorData = await response.json();
                    console.error('Upload error:', errorData);
                    throw new Error(
                        errorData.message || 'Failed to upload products.'
                    );
                }
            });
    
            // Wait for all product uploads to finish
            await Promise.all(promises);
            setPreviewData([]);
            router.push("/panel/productos");
        } catch (error) {
            console.error('Error subiendo productos:', error);
            setUploadError(
                error instanceof Error ? error.message : 'Error desconocido.'
            );
        }
    };

    const handleCancel = () => {
        setPreviewData([]);  // Clear the preview data
        setError('');        // Clear any errors
        setUploadError('');

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) (fileInput as HTMLInputElement).value = '';
    };

    return (
        <div>
            <label className="cursor-pointer inline-block p-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Seleccionar Archivo
                <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </label>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {previewData.length > 0 && (
                <div className='fixed inset-0 flex items-center justify-center z-50 w-full h-full bg-black bg-opacity-50'>
                  <div className='bg-white p-3 rounded-md'>
                    <h2 className='text-center text-xl mb-5 mt-3'>Vista previa de productos</h2>
                    <table className='border '>
                        <thead>
                            <tr>
                                <th className='border border-gray-300 border-2 p-2'>Nombre</th>
                                <th className='border border-gray-300 border-2 p-2'>Descripción</th>
                                <th className='border border-gray-300 border-2 p-2'>Código de Barras</th>
                                <th className='border border-gray-300 border-2 p-2'>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.map((product, index) => (
                                <tr key={index}>
                                    <td className='border border-gray-300 border-2 p-2'>{product.name}</td>
                                    <td className='border border-gray-300 border-2 p-2'>{product.description}</td>
                                    <td className='border border-gray-300 border-2 p-2'>{product.barcode}</td>
                                    <td className='border border-gray-300 border-2 p-2'>{product.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex justify-between'>
                        <button 
                        onClick={handleUpload}
                        className='p-2 m-3 border border-2 rounded-md'
                        >Agregar productos</button>
                        <button
                        onClick={handleCancel}
                        className='p-2 px-3 m-3 bg-red-400 rounded-md'
                        >Cancelar</button>
                    </div>
                    {uploadError && (
                            <p className="text-red-500 mt-2">{uploadError}</p>
                    )}
                  </div>
                </div>
            )}
        </div>
    );
};

export default UploadCSV;