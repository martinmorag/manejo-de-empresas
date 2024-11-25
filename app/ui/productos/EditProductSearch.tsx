'use client';

import { useState, useEffect, useRef } from 'react';
import { Producto } from '@/app/lib/definitions';

interface ProductSearchProps {
  onSelect: (product: Producto) => void;
  selectedProductId?: string;
}

const EditProductSearch = ({ onSelect, selectedProductId }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/producto');
        const data: Producto[] = await response.json();
        setProductos(data);

        // If selectedProductId is provided, find and set the product
        if (selectedProductId) {
          const product = data.find(p => p.id === selectedProductId);
          if (product) {
            setSelectedProduct(product);
            setSearchTerm(product.name); // Set searchTerm to the selected product's name
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } 
    };

    fetchProducts();
  }, [selectedProductId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownVisible(true);
  };

  const handleProductSelect = (product: Producto) => {
    setSearchTerm(product.name); // Set searchTerm to the selected product's name
    setSelectedProduct(product); // Store the selected product
    setIsDropdownVisible(false); // Hide the dropdown
    onSelect(product); // Trigger the callback with the selected product
  };

  const filteredProducts = productos.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Busca por nombre o código de barras"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full border rounded-md p-2"
        onFocus={() => setIsDropdownVisible(true)}
      />
      {isDropdownVisible && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedProduct && selectedProduct.id === product.id ? 'bg-gray-200' : ''
              }`}
              onClick={() => handleProductSelect(product)}
            >
              {product.name} - {product.barcode}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditProductSearch;