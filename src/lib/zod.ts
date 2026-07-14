// src/lib/zod.ts — Validación con Zod para auth
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email es requerido').email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});
