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
  default_picture : string;
}

export interface DropDownProps {
  session: Session;
}

export interface Producto {
  id: string;
  name: string;
  description: string;
  barcode: string;
  price: number | string;
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


export interface DetalleVenta {
  ventaid: string;
  productoid: string;
  quantity: number;
  price: number;
  sale_date: string; 
  discount?: number;
  iva_percentage: number;
}


export interface CreateVentaFormData {
  total: number;
  payment_method: 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito';
  detalles_ventas: DetalleVenta[];
}