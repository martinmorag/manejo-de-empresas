'use client';

import { useState, useEffect, useRef } from 'react';
import { Cliente, ClientSearchProps } from '@/app/lib/definitions'; // Adjust the import path as necessary

const ClientSearch = ({ onSelect }: ClientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch clients when the component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/cliente'); 
        const data: Cliente[] = await response.json();
        setClientes(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownVisible(true);
  };

  const handleClientSelect = (client: Cliente) => {
    onSelect(client);
    setSearchTerm(client.name); // Update searchTerm to reflect selected client's name
    setIsDropdownVisible(false);
  };

  const filteredClients = clientes.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        placeholder="Busca por nombre o correo"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full border rounded-md p-2"
        onFocus={() => setIsDropdownVisible(true)}
      />
      {isDropdownVisible && filteredClients.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleClientSelect(client)}
            >
              {client.name} - {client.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;