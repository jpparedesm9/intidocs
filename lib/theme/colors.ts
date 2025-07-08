/**
 * Sistema de colores del GAD Municipal del Cantón Mejía
 * Basado en el Manual de Uso de Marca
 */

export const brandColors = {
  // Colores principales de la marca
  primary: {
    yellow: '#fcc108',      // Amarillo/Dorado principal
    green: '#028738',       // Verde institucional
    darkBlue: '#142a44',    // Azul oscuro
    mediumBlue: '#153c60',  // Azul medio
  },
  
  // Escala de grises para UI
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Colores de estado
  status: {
    success: '#028738',     // Verde de la marca
    warning: '#fcc108',     // Amarillo de la marca
    error: '#dc2626',
    info: '#153c60',        // Azul medio de la marca
  },
  
  // Colores para fondos
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#142a44',        // Azul oscuro de la marca
  },
  
  // Colores para texto
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    inverse: '#ffffff',
    brand: '#142a44',       // Azul oscuro para textos importantes
  },
  
  // Colores para bordes
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },
  
  // Variantes con transparencia
  alpha: {
    yellow10: 'rgba(252, 193, 8, 0.1)',
    yellow20: 'rgba(252, 193, 8, 0.2)',
    green10: 'rgba(2, 135, 56, 0.1)',
    green20: 'rgba(2, 135, 56, 0.2)',
    darkBlue10: 'rgba(20, 42, 68, 0.1)',
    darkBlue20: 'rgba(20, 42, 68, 0.2)',
    mediumBlue10: 'rgba(21, 60, 96, 0.1)',
    mediumBlue20: 'rgba(21, 60, 96, 0.2)',
  }
}

// Tema principal de la aplicación
export const theme = {
  colors: brandColors,
  
  // Configuración de componentes específicos
  components: {
    button: {
      primary: {
        bg: brandColors.primary.green,
        hover: '#026b2c', // Verde más oscuro
        text: brandColors.text.inverse,
      },
      secondary: {
        bg: brandColors.primary.mediumBlue,
        hover: '#0f2d4a', // Azul más oscuro
        text: brandColors.text.inverse,
      },
      warning: {
        bg: brandColors.primary.yellow,
        hover: '#e6b007', // Amarillo más oscuro
        text: brandColors.primary.darkBlue,
      },
      ghost: {
        bg: 'transparent',
        hover: brandColors.alpha.darkBlue10,
        text: brandColors.text.primary,
      },
    },
    
    sidebar: {
      bg: brandColors.primary.darkBlue,
      text: brandColors.text.inverse,
      hover: brandColors.alpha.yellow20,
      active: brandColors.primary.yellow,
      activeText: brandColors.primary.darkBlue,
    },
    
    badge: {
      success: {
        bg: brandColors.alpha.green10,
        text: brandColors.primary.green,
        border: brandColors.primary.green,
      },
      warning: {
        bg: brandColors.alpha.yellow10,
        text: '#b08006', // Amarillo más oscuro para legibilidad
        border: brandColors.primary.yellow,
      },
      error: {
        bg: 'rgba(220, 38, 38, 0.1)',
        text: brandColors.status.error,
        border: brandColors.status.error,
      },
      info: {
        bg: brandColors.alpha.mediumBlue10,
        text: brandColors.primary.mediumBlue,
        border: brandColors.primary.mediumBlue,
      },
    },
    
    input: {
      bg: brandColors.background.primary,
      border: brandColors.border.default,
      borderFocus: brandColors.primary.green,
      text: brandColors.text.primary,
      placeholder: brandColors.text.tertiary,
    },
    
    card: {
      bg: brandColors.background.primary,
      border: brandColors.border.light,
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
  },
  
  // Espaciado consistente
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  
  // Radios de borde
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px',
  },
  
  // Tipografía
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Sombras
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
}

// Función helper para obtener colores
export const getColor = (path: string): string => {
  const keys = path.split('.')
  let value: any = theme.colors
  
  for (const key of keys) {
    value = value[key]
    if (!value) {
      console.warn(`Color not found: ${path}`)
      return '#000000'
    }
  }
  
  return value
}

// Export para uso en Tailwind CSS
export const tailwindColors = {
  brand: {
    yellow: brandColors.primary.yellow,
    green: brandColors.primary.green,
    'dark-blue': brandColors.primary.darkBlue,
    'medium-blue': brandColors.primary.mediumBlue,
  },
  ...brandColors.gray,
}