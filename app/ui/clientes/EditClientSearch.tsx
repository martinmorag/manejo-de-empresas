'use client';

import { useState, useEffect, useRef } from 'react';
import { Cliente } from '@/app/lib/definitions'; 

export interface ClientSearchProps {
  onSelect: (client: Cliente) => void;
  selectedClientId?: string;
}

const EditClientSearch = ({ onSelect, selectedClientId }: ClientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/cliente'); 
        const data: Cliente[] = await response.json();
        setClientes(data);

        if (selectedClientId) {
          const client = data.find(c => c.id === selectedClientId);
          if (client) {
            setSelectedClient(client);
            setSearchTerm(client.name); // Set searchTerm to the selected client's name
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [selectedClientId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownVisible(true);
  };

  const handleClientSelect = (client: Cliente) => {
    setSearchTerm(client.name); // Update searchTerm to reflect selected client's name
    setSelectedClient(client); // Store the selected client
    setIsDropdownVisible(false); // Hide the dropdown
    onSelect(client);
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
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedClient && selectedClient.id === client.id ? 'bg-gray-200' : ''
              }`}
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

export default EditClientSearch;