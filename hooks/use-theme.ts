import { theme, getColor } from '@/lib/theme/colors'

export const useTheme = () => {
  return {
    theme,
    getColor,
    // Atajos útiles
    colors: theme.colors,
    components: theme.components,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    fontSize: theme.fontSize,
    boxShadow: theme.boxShadow,
  }
}