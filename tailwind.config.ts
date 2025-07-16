import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					subtle: 'hsl(var(--primary-subtle))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				heading: 'var(--font-heading)',
				body: 'var(--font-body)',
				code: 'var(--font-code)'
			},
			fontSize: {
				'fluid-xs': 'var(--text-xs)',
				'fluid-sm': 'var(--text-sm)',
				'fluid-base': 'var(--text-base)',
				'fluid-lg': 'var(--text-lg)',
				'fluid-xl': 'var(--text-xl)',
				'fluid-2xl': 'var(--text-2xl)',
				'fluid-3xl': 'var(--text-3xl)',
				'fluid-4xl': 'var(--text-4xl)',
				'fluid-5xl': 'var(--text-5xl)',
				'fluid-6xl': 'var(--text-6xl)'
			},
			spacing: {
				'fluid-xs': 'var(--space-xs)',
				'fluid-sm': 'var(--space-sm)',
				'fluid-md': 'var(--space-md)',
				'fluid-lg': 'var(--space-lg)',
				'fluid-xl': 'var(--space-xl)',
				'fluid-2xl': 'var(--space-2xl)',
				'fluid-3xl': 'var(--space-3xl)',
				'fluid-4xl': 'var(--space-4xl)'
			},
			maxWidth: {
				content: 'var(--content-max-width)',
				narrow: 'var(--narrow-max-width)',
				wide: 'var(--wide-max-width)',
				container: 'var(--container-max-width)'
			},
			width: {
				sidebar: 'var(--sidebar-width)',
				'sidebar-collapsed': 'var(--sidebar-collapsed-width)'
			},
			height: {
				header: 'var(--header-height)',
				footer: 'var(--footer-height)'
			},
			lineHeight: {
				tight: 'var(--leading-tight)',
				snug: 'var(--leading-snug)',
				normal: 'var(--leading-normal)',
				relaxed: 'var(--leading-relaxed)',
				loose: 'var(--leading-loose)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-radial': 'var(--gradient-radial)'
			},
			boxShadow: {
				xs: 'var(--shadow-xs)',
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)'
			},
			transitionTimingFunction: {
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
			},
			transitionDuration: {
				base: '150ms',
				slow: '300ms',
				fast: '100ms'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
