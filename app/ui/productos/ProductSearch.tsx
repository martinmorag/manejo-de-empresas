'use client';

import { useState, useEffect, useRef } from 'react';
import { Producto } from '@/app/lib/definitions';

interface ProductSearchProps {
  onSelect: (product: Producto) => void;
}

const ProductSearch = ({ onSelect }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/producto'); 
        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownVisible(true);
  };

  const handleProductSelect = (product: Producto) => {
    onSelect(product);
    setSearchTerm(product.name); // Update searchTerm to reflect selected product's name
    setIsDropdownVisible(false);
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
              className="p-2 cursor-pointer hover:bg-gray-100"
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

export default ProductSearch;