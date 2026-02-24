import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4F46E5', // Vibrant Indigo
        light: '#818CF8',
        dark: '#3730A3',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#EC4899', // Vibrant Pink
        light: '#F472B6',
        dark: '#BE185D',
        contrastText: '#ffffff'
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#B91C1C',
        contrastText: '#fff'
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#B45309',
        contrastText: '#fff'
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#fff'
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#047857',
        contrastText: '#fff'
      },
      neutral: {
        main: '#64748B',
        light: '#94A3B8',
        dark: '#334155',
        contrastText: '#fff'
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC', // Deep Slate for Dark Mode
        paper: isDark ? '#1E293B' : '#ffffff' // Elevated Slate for Paper
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
        disabled: isDark ? '#475569' : '#94A3B8'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontWeight: 800,
        fontSize: '2rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em'
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em'
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.5rem',
        lineHeight: 1.2
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.2
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em'
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            transition: 'all 0.2s ease-in-out'
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
            boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)'
            }
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.39)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(236, 72, 153, 0.45)'
            }
          },
          outlined: {
            borderWidth: '2px',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderWidth: '2px'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none', // Remove default MUI dark mode overlay
            backgroundColor: isDark ? '#1E293B' : '#ffffff',
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            border: `1px solid ${isDark ? '#334155' : 'rgba(226, 232, 240, 0.8)'}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none'
          },
          elevation1: {
            boxShadow: isDark
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          },
          elevation2: {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
          elevation3: {
            boxShadow: isDark
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            color: isDark ? '#F8FAFC' : '#0F172A',
            boxShadow: isDark ? '0 1px 0 0 #334155' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? '#334155' : 'rgba(226, 232, 240, 0.8)'}`,
            backgroundColor: isDark ? '#0F172A' : '#ffffff'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            color: isDark ? '#CBD5E1' : '#475569',
            borderBottom: `1px solid ${isDark ? '#334155' : 'rgba(224, 224, 224, 1)'}`
          },
          root: {
            borderBottom: `1px solid ${isDark ? '#334155' : 'rgba(224, 224, 224, 1)'}`
          }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5) !important' : 'rgba(241, 245, 249, 0.5) !important'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'box-shadow 0.2s',
              '& fieldset': {
                borderColor: isDark ? '#334155' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#818CF8'
              },
              '&.Mui-focused': {
                boxShadow: isDark ? '0 0 0 3px rgba(79, 70, 229, 0.5)' : '0 0 0 3px rgba(79, 70, 229, 0.2)'
              }
            }
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? "#475569 #0f172a" : "#cbd5e1 #f8fafc",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              background: isDark ? "#0f172a" : "#f8fafc",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#475569" : "#cbd5e1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: isDark ? "#64748B" : "#94a3b8",
            },
          }
        }
      }
    }
  });
};