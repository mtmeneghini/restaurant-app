// Simplified Color Palette
export const colors = {
    // Brand Colors (now more muted)
    brand: {
      primary: '#0A0A0A',   // Changed to black
      tertiary: '#6366F1',  // Kept the modern iris purple
    },
  
    // Simplified UI Colors
    ui: {
      // Primary text/backgrounds
      black: '#0A0A0A',     // Softened pure black
      white: '#FFFFFF',
  
      // Extended grayscale (better for accessibility)
      gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
      },
  
      // Semantic colors (simplified)
      error: '#DC2626',     // Red for errors
      success: '#16A34A',   // Green for success
      warning: '#F59E0B',   // Amber for warnings
    }
  }
  
  // Modern Typography System
  export const typography = {
    fontFamily: {
      primary: 'DM Sans, sans-serif', // Changed to DM Sans
    },
  
    // Enhanced Size Hierarchy (rem-based)
    fontSize: {
      xs: '0.75rem',    // 12px - Captions
      sm: '0.875rem',   // 14px - Body small
      base: '1rem',     // 16px - Base body
      lg: '1.125rem',   // 18px - Lead text
      xl: '1.25rem',    // 20px - H5
      '2xl': '1.5rem',  // 24px - H4
      '3xl': '1.875rem',// 30px - H3
      '4xl': '2.25rem', // 36px - H2
      '5xl': '3rem',    // 48px - H1
    },
  
    // Weight System
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
    },
  
    // Line Height System
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  
    // Type Scale (8px baseline grid)
    headings: {
      h1: {
        fontSize: '3rem',        // 48px
        lineHeight: '3.5rem',    // 56px
        fontWeight: 'semibold',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2.25rem',     // 36px
        lineHeight: '2.75rem',   // 44px
        fontWeight: 'semibold',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.875rem',    // 30px
        lineHeight: '2.25rem',   // 36px
        fontWeight: 'semibold',
      },
      h4: {
        fontSize: '1.5rem',      // 24px
        lineHeight: '2rem',      // 32px
        fontWeight: 'semibold',
      },
      h5: {
        fontSize: '1.25rem',     // 20px
        lineHeight: '1.75rem',   // 28px
        fontWeight: 'medium',
      },
      body: {
        fontSize: '1rem',        // 16px
        lineHeight: '1.5rem',    // 24px
        fontWeight: 'regular',
      },
    },
  }
  
  // Simplified Spacing System (4px base)
  export const spacing = {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
  }
  
  // Other systems remain similar but consider:
  // 1. Using simpler border radius (sm: 2px, md: 4px, lg: 8px)
  // 2. More subtle shadows for minimal aesthetic
  // 3. Reduced color variants in original palette