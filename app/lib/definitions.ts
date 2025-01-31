import { DefaultUser } from 'next-auth';
import { Session } from 'next-auth';

// export interface CustomUser extends NextAuthUser {
//   name: string;
//   email: string;
//   default_picture: string;
// }

interface CustomUser extends DefaultUser {
  id: string;
  name: string;
  email: string;
  default_picture: string;
}

// Augment the Session interface to include your custom user type
declare module 'next-auth' {
  interface Session {
    usuario: CustomUser; // Ensure the session user has the CustomUser type
  }
}

export interface ProfileData {
  default_picture? : string;
  profile_image?: string;
  level: string;
}

export interface Usuario {
  name: string;
  lastname: string;
  email: string;
  password: string;
  default_picture: string;
  profile_image: string;
}

export interface DropDownProps {
  profileImage?: string;
  defaultPicture?: string;
}

export interface Producto {
  id: string;
  name: string;
  description: string;
  barcode: string;
  price: number | string;
}

export interface ProductCSV {
  name: string;
  description: string;
  barcode: string;
  price: number;
}

export interface CsvRow {
  nombre: string;
  descripcion: string;
  "codigo de barras": string; // Using quotes to handle spaces in the key
  precio: string; // Keep as string since CSV values are parsed as strings initially
}

export interface Negocio {
  id: string;
  name: string;
  location: string;
  iva_percentage: number;
}

export interface Cliente {
  id: string;
  negocioid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Deuda {
  id: string;
  cliente_id: string;
  venta_id: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  cliente: {
    name: string;  // Adding client name
  } | null;
  venta?  : {
    created_at: string;  // Adding venta date
  };
}

export interface EditProductProps {
  productId: string;
}

export interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export interface ClientSearchProps {
  onSelect: (client: Cliente) => void;
}


export interface DetalleVenta {
  id: string;
  ventaid: string;
  productoid: string;
  quantity: number;
  price: number;
  sale_date: string; 
  discount?: number;
  iva_percentage: number;
  productname: string;
}

export interface UpdateVentaFormData {
  id: string;
  payment: number;
  payment_method: 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito';
  clienteid: string;
  is_on_credit: boolean;
  deuda_amount: number;
  total: number;
  due_date?: string | null
  detalles_ventas: DetalleVenta[];
}


export interface CreateVentaFormData {
  payment: number;
  payment_method: 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito';
  clienteid: string;
  is_on_credit: boolean;
  deuda_amount: number;
  total: number;
  due_date?: string | null
  detalles_ventas: DetalleVenta[];
}

export interface Venta {
    id: string;
    negocioid: string;
    payment: number | string;
    balance_due?: number;
    status?: string;
    payment_method?: string;
    created_at: string;
    clienteid?: string;
    detalles_ventas: DetalleVenta[];
    formatted: string;
}

export interface AvailableMonth {
  formatted: string;
  year: string;
  month: string;
}

export interface VentaDetails {
  id: string;
  ventaid: string;
  productoid: string;
  quantity: number;
  price: number;
  iva_percentage?: number;
  sale_date: string;
  discount?: number;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

/* Anuncios */

export interface Anuncio {
  id: number;
  estado: string;
  message: string;
  usuarioid: string;
  created_at: Date;
  finished_at: Date;
  usuarios: {
    name: string;
    lastname: string;
  }
}

export interface AnunciosInfoProps {
  anuncios: Anuncio[] | null;
  onFinalizarAnuncio: (id: string) => void;
}


/* TABLES */

export interface NetRevenueData {
  total_sales: number;
  total_debt: number;
  actual_amount: number;
}

export interface ByProduct {
  product_id: string;
  product_name: string | null;
  total_sales: number;
  total_quantity: string;
}

export interface AccesosDirectos {
  lista_productos?: boolean;
  lista_ventas?: boolean;
  lista_clientes?: boolean;
  lista_deudas?: boolean;
  agregar_productos?: boolean;
  agregar_venta?: boolean;
  agregar_cliente?: boolean;
}