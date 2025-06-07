/**
 * MBG Banner Generator - Modern JavaScript Application
 * Created by Mar - Mar Terminal
 * Discord: https://discord.gg/marx
 * 
 * A comprehensive, modern web application for generating animated GIF banners
 * with advanced customization options and enhanced user experience.
 */

// ========================================
// Configuration & Constants
// ========================================

const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 168,
    DEFAULT_FONT_SIZE: 32,
    
    // Animation settings
    DEFAULT_DELAY: 100,
    MIN_DELAY: 50,
    MAX_DELAY: 1000,
    
    // Text settings
    MAX_TEXT_LENGTH: 50,
    
    // Colors
    DEFAULT_TEXT_COLOR: '#ffffff',
    DEFAULT_BG_COLOR: '#000000',
    
    // Font settings
    LETTER_SPACING: '2.2em',
    
    // Performance
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 4000,
    
    // Local storage keys
    STORAGE_KEYS: {
        THEME: 'banner-generator-theme',
        LAST_SETTINGS: 'banner-generator-last-settings'
    }
};

const FONT_LIST = [
    'Barlow Condensed', 'Caveat', 'Chela One', 'Dancing Script', 'El Messiri',
    'Gelasio', 'Gloria Hallelujah', 'Great Vibes', 'Indie Flower', 'Lexend Deca',
    'Lilita One', 'Lobster', 'Lugrasimo', 'Lumanosimo', 'Pacifico', 'Pangolin',
    'Playfair Display', 'Rubik', 'Shadows Into Light', 'Space Mono', 'Tektur',
    'Wix Madefor Text', 'Yuji Boku'
];

// ========================================
// Utility Functions
// ========================================

class Utils {
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate a random ID
     * @returns {string} Random ID
     */
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validate hex color
     * @param {string} color - Color to validate
     * @returns {boolean} Is valid color
     */
    static isValidColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB values
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Get contrast color (black or white) for background
     * @param {string} backgroundColor - Background color
     * @returns {string} Contrast color
     */
    static getContrastColor(backgroundColor) {
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return '#ffffff';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Sanitize text input
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeText(text) {
        return text.trim().replace(/[<>]/g, '');
    }
}

// ========================================
// Toast Notification System
// ========================================

class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = new Map();
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        const id = Utils.generateId();
        const toast = this.createToastElement(message, type, id);
        
        this.container.appendChild(toast);
        this.toasts.set(id, toast);

        // Auto-remove after duration
        setTimeout(() => this.remove(id), duration);

        // Add click-to-dismiss
        toast.addEventListener('click', () => this.remove(id));

        return id;
    }

    /**
     * Create toast element
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @param {string} id - Toast ID
     * @returns {HTMLElement} Toast element
     */
    createToastElement(message, type, id) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.id = id;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;

        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(id);
        });

        return toast;
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove toast by ID
     * @param {string} id - Toast ID
     */
    remove(id) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.style.animation = 'toast-out 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(id);
            }, 300);
        }
    }

    /**
     * Clear all toasts
     */
    clearAll() {
        this.toasts.forEach((_, id) => this.remove(id));
    }
}

// ========================================
// Theme Manager
// ========================================

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark';
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Show feedback
        const message = `Switched to ${newTheme} theme`;
        app.toast.show(message, 'success', 2000);
    }
}

// ========================================
// Settings Manager
// ========================================

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.elements = this.getElements();
        this.init();
    }

    getElements() {
        return {
            bannerText: document.getElementById('banner-text'),
            animationSpeed: document.getElementById('animation-speed'),
            speedValue: document.getElementById('speed-value'),
            textColor: document.getElementById('text-color'),
            bgColor: document.getElementById('bg-color'),
            bgTypeButtons: document.querySelectorAll('.bg-type-btn'),
            bgColorPresets: document.querySelectorAll('.bg-color-preset'),
            effectButtons: document.querySelectorAll('.effect-btn'),
            charCount: document.getElementById('char-count'),
            colorPresets: document.querySelectorAll('.color-preset')
        };
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.updateCharCount();
    }

    setupEventListeners() {
        // Text input with character counting
        this.elements.bannerText?.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSetting('text', this.elements.bannerText.value);
        });

        // Font selection removed - always use random fonts

        // Animation speed with real-time display
        this.elements.animationSpeed?.addEventListener('input', () => {
            const value = this.elements.animationSpeed.value;
            this.elements.speedValue.textContent = `${value}ms`;
            this.updateSetting('speed', parseInt(value));
        });

        // Text color
        this.elements.textColor?.addEventListener('change', () => {
            this.updateSetting('textColor', this.elements.textColor.value);
        });

        // Background color
        this.elements.bgColor?.addEventListener('change', () => {
            this.updateSetting('bgColor', this.elements.bgColor.value);
        });

        // Background type buttons
        this.elements.bgTypeButtons?.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                this.elements.bgTypeButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const bgType = button.dataset.type;
                this.updateSetting('backgroundType', bgType);
                
                // Show/hide color picker based on type
                const colorSection = document.querySelector('.bg-color-section');
                if (colorSection) {
                    colorSection.style.display = bgType === 'transparent' ? 'none' : 'flex';
                }
            });
        });

        // Background color presets
        this.elements.bgColorPresets?.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.elements.bgColor.value = color;
                this.updateSetting('bgColor', color);
                
                // Update active state
                this.elements.bgColorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });

        // Color presets
        this.elements.colorPresets?.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.elements.textColor.value = color;
                this.updateSetting('textColor', color);
            });
        });

        // Visual Effects buttons
        this.elements.effectButtons?.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                this.elements.effectButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const effect = button.dataset.effect;
                this.updateSetting('visualEffect', effect);
            });
        });
    }

    updateCharCount() {
        const text = this.elements.bannerText?.value || '';
        const count = text.length;
        const maxLength = CONFIG.MAX_TEXT_LENGTH;
        
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${count}/${maxLength}`;
            
            // Add visual feedback for character limit
            if (count > maxLength * 0.8) {
                this.elements.charCount.style.color = count >= maxLength ? 'var(--error-color)' : 'var(--warning-color)';
            } else {
                this.elements.charCount.style.color = 'var(--text-muted)';
            }
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }



    applySettings() {
        if (this.elements.bannerText) this.elements.bannerText.value = this.settings.text || '';
        if (this.elements.animationSpeed) {
            this.elements.animationSpeed.value = this.settings.speed || CONFIG.DEFAULT_DELAY;
            this.elements.speedValue.textContent = `${this.settings.speed || CONFIG.DEFAULT_DELAY}ms`;
        }
        if (this.elements.textColor) this.elements.textColor.value = this.settings.textColor || CONFIG.DEFAULT_TEXT_COLOR;
        if (this.elements.bgColor) this.elements.bgColor.value = this.settings.bgColor || CONFIG.DEFAULT_BG_COLOR;
        
        // Apply background type
        const bgType = this.settings.backgroundType || 'solid';
        this.elements.bgTypeButtons?.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.type === bgType) {
                button.classList.add('active');
            }
        });

        // Show/hide color section based on type
        const colorSection = document.querySelector('.bg-color-section');
        if (colorSection) {
            colorSection.style.display = bgType === 'transparent' ? 'none' : 'flex';
        }

        // Apply background color to presets
        const currentBgColor = this.settings.bgColor || '#000000';
        this.elements.bgColorPresets?.forEach(preset => {
            preset.classList.remove('active');
            if (preset.dataset.color === currentBgColor) {
                preset.classList.add('active');
            }
        });

        // Apply visual effect
        const currentEffect = this.settings.visualEffect || 'none';
        this.elements.effectButtons?.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.effect === currentEffect) {
                button.classList.add('active');
            }
        });
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SETTINGS);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {};
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SETTINGS, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    getSettings() {
        // Get current background type from active button
        const activeBgButton = document.querySelector('.bg-type-btn.active');
        const backgroundType = activeBgButton ? activeBgButton.dataset.type : 'solid';
        
        const settings = {
            ...this.settings,
            backgroundType: backgroundType
        };
        
        console.log('📝 Settings retrieved:', settings);
        return settings;
    }
}

// ========================================
// Banner Generator Engine
// ========================================

class BannerGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        this.currentBanner = null;
        this.isGenerating = false;
    }

    /**
     * Create a single frame for the banner
     * @param {string} text - Text to render
     * @param {string} font - Font family
     * @param {Object} options - Rendering options
     * @returns {CanvasRenderingContext2D} Context with rendered frame
     */
    createFrame(text, font, options = {}) {
        const {
            textColor = CONFIG.DEFAULT_TEXT_COLOR,
            backgroundColor = CONFIG.DEFAULT_BG_COLOR,
            backgroundType = 'solid',
            fontSize = CONFIG.DEFAULT_FONT_SIZE,
            visualEffect = 'none'
        } = options;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set background
        this.setBackground(backgroundColor, backgroundType, visualEffect);

        // Apply visual effect to text
        this.applyVisualEffect(text, font, fontSize, textColor, visualEffect);

        return this.ctx;
    }

    /**
     * Apply visual effects to text
     * @param {string} text - Text to render
     * @param {string} font - Font family
     * @param {number} fontSize - Font size
     * @param {string} textColor - Text color
     * @param {string} effect - Visual effect name
     */
    applyVisualEffect(text, font, fontSize, textColor, effect) {
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;

        // Set base font
        this.ctx.font = `${fontSize}px "${font}"`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        switch (effect) {
            case 'glow':
                this.applyGlowEffect(text, x, y, textColor);
                break;
            case 'neon':
                this.applyNeonEffect(text, x, y, textColor);
                break;
            case 'matrix':
                this.applyMatrixEffect(text, x, y, textColor, font);
                break;
            case 'retro':
                this.applyRetroEffect(text, x, y, textColor, font);
                break;
            case 'fire':
                this.applyFireEffect(text, x, y, textColor, font);
                break;
            default:
                // Default effect - simple shadow
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 4;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;
                this.ctx.fillStyle = textColor;
                this.ctx.fillText(text, x, y);
        }

        // Reset shadows
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    /**
     * Apply glow effect
     */
    applyGlowEffect(text, x, y, color) {
        // Multiple glow layers for intensity
        const glowLayers = [
            { blur: 20, alpha: 0.8 },
            { blur: 15, alpha: 0.6 },
            { blur: 10, alpha: 0.4 },
            { blur: 5, alpha: 0.3 }
        ];

        glowLayers.forEach(layer => {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = layer.blur;
            this.ctx.globalAlpha = layer.alpha;
            this.ctx.fillStyle = color;
            this.ctx.fillText(text, x, y);
        });

        // Final solid text
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Apply neon effect
     */
    applyNeonEffect(text, x, y, color) {
        // Neon outline
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.strokeText(text, x, y);

        // Inner glow
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, y);

        // Outer glow
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = color;
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    /**
     * Apply enhanced matrix effect
     */
    applyMatrixEffect(text, x, y, textColor, font) {
        // Enhanced Matrix character sets
        const matrixChars = [
            // Binary
            '01',
            // Japanese Katakana
            'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
            // Latin letters and numbers
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            // Special matrix symbols
            '!@#$%^&*()_+-=[]{}|;:,.<>?'
        ];
        
        // Convert user's text color to RGB for matrix variations
        const rgb = Utils.hexToRgb(textColor) || { r: 0, g: 255, b: 0 };
        const matrixColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const matrixColorAlpha = (alpha) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        const matrixColorBright = `rgb(${Math.min(255, rgb.r + 100)}, ${Math.min(255, rgb.g + 100)}, ${Math.min(255, rgb.b + 100)})`;
        const matrixColorDark = `rgb(${Math.max(0, rgb.r - 100)}, ${Math.max(0, rgb.g - 100)}, ${Math.max(0, rgb.b - 100)})`;
        
        // Create cascading digital rain effect
        const columnWidth = 14;
        const columnCount = Math.floor(this.canvas.width / columnWidth);
        
        // Draw multiple layers of falling characters
        for (let layer = 0; layer < 4; layer++) {
            const alpha = 0.3 - (layer * 0.05);
            const fontSize = 12 + (layer * 2);
            const charSet = matrixChars[layer % matrixChars.length];
            
            this.ctx.font = `${fontSize}px "Courier New", monospace`;
            
            for (let col = 0; col < columnCount; col++) {
                const columnX = col * columnWidth;
                const charCount = Math.floor(Math.random() * 15) + 5;
                
                for (let i = 0; i < charCount; i++) {
                    const char = charSet[Math.floor(Math.random() * charSet.length)];
                    const charY = (Math.random() * this.canvas.height) + (layer * 50);
                    
                    // Gradient effect for each character
                    const distance = Math.abs(charY - this.canvas.height / 2) / (this.canvas.height / 2);
                    const brightness = Math.max(0.1, 1 - distance);
                    
                    // Bright characters at the front of each stream using user's color
                    if (i < 3) {
                        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * brightness})`;
                    } else if (i < 6) {
                        this.ctx.fillStyle = matrixColorAlpha(alpha * brightness);
                    } else {
                        this.ctx.fillStyle = matrixColorAlpha(alpha * brightness * 0.7);
                    }
                    
                    // Add some randomness to character positioning
                    const offsetX = (Math.random() - 0.5) * 3;
                    this.ctx.fillText(char, columnX + offsetX, charY);
                }
            }
        }
        
        // Add digital noise effect with user's color
        this.ctx.fillStyle = matrixColorAlpha(0.05);
        for (let i = 0; i < 200; i++) {
            const pixel = Math.random() < 0.5 ? '█' : '▓';
            const px = Math.random() * this.canvas.width;
            const py = Math.random() * this.canvas.height;
            this.ctx.font = '8px monospace';
            this.ctx.fillText(pixel, px, py);
        }
        
        // Create glitch lines with user's color
        this.ctx.fillStyle = matrixColorAlpha(0.2);
        for (let i = 0; i < 5; i++) {
            const lineY = Math.random() * this.canvas.height;
            this.ctx.fillRect(0, lineY, this.canvas.width, Math.random() * 3 + 1);
        }
        
        // Add pulsing glow effect around the main text area with user's color
        const glowRadius = 100;
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, matrixColorAlpha(0.3));
        gradient.addColorStop(0.5, matrixColorAlpha(0.1));
        gradient.addColorStop(1, matrixColorAlpha(0));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
        
        // Main text with enhanced matrix styling using user's font
        this.ctx.font = `${this.canvas.height * 0.15}px "${font}", monospace`;
        
        // Multiple shadow layers for depth using user's color variations
        const shadowLayers = [
            { color: matrixColorDark, blur: 20, offset: 4 },
            { color: matrixColor, blur: 15, offset: 2 },
            { color: matrixColorBright, blur: 8, offset: 1 },
            { color: '#ffffff', blur: 3, offset: 0 }
        ];
        
        shadowLayers.forEach(layer => {
            this.ctx.shadowColor = layer.color;
            this.ctx.shadowBlur = layer.blur;
            this.ctx.shadowOffsetX = layer.offset;
            this.ctx.shadowOffsetY = layer.offset;
            this.ctx.fillStyle = layer.color;
            this.ctx.fillText(text, x, y);
        });
        
        // Main text - using user's color with electric effect
        this.ctx.shadowColor = matrixColor;
        this.ctx.shadowBlur = 25;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(text, x, y);
        
        // Add electric scan lines with user's color
        this.ctx.fillStyle = matrixColorAlpha(0.1);
        for (let scanline = 0; scanline < this.canvas.height; scanline += 4) {
            if (Math.random() > 0.7) { // Random scan lines
                this.ctx.fillRect(0, scanline, this.canvas.width, 1);
            }
        }
        
        // Reset shadow effects
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    /**
     * Apply enhanced 80s retro/synthwave effect
     */
    applyRetroEffect(text, x, y, textColor, font) {
        // Convert user's color to RGB for retro variations
        const rgb = Utils.hexToRgb(textColor) || { r: 255, g: 20, b: 147 };
        
        // Create classic 80s sunset gradient
        const sunsetGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        sunsetGradient.addColorStop(0, `rgba(${Math.min(255, rgb.r + 100)}, ${Math.max(0, rgb.g - 50)}, ${Math.min(255, rgb.b + 150)}, 0.6)`);
        sunsetGradient.addColorStop(0.4, `rgba(${rgb.r}, ${Math.min(255, rgb.g + 100)}, ${Math.max(0, rgb.b)}, 0.4)`);
        sunsetGradient.addColorStop(0.8, `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 150)}, ${Math.max(0, rgb.b - 50)}, 0.3)`);
        sunsetGradient.addColorStop(1, `rgba(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${rgb.b}, 0.2)`);
        
        // Apply sunset background
        this.ctx.fillStyle = sunsetGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simple but effective retro grid
        this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
        this.ctx.lineWidth = 2;
        const gridSpacing = 40;
        
        // Horizontal grid lines (perspective floor)
        for (let i = this.canvas.height * 0.7; i < this.canvas.height; i += gridSpacing / 2) {
            const perspective = (i - this.canvas.height * 0.7) / (this.canvas.height * 0.3);
            const lineWidth = this.canvas.width * (0.9 - perspective * 0.4);
            const startX = (this.canvas.width - lineWidth) / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, i);
            this.ctx.lineTo(startX + lineWidth, i);
            this.ctx.stroke();
        }
        
        // Vertical grid lines with perspective
        const verticalLines = 8;
        for (let i = 0; i <= verticalLines; i++) {
            const baseX = (this.canvas.width / verticalLines) * i;
            const topX = baseX;
            const bottomX = baseX + (baseX - this.canvas.width / 2) * 0.3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.canvas.height * 0.7);
            this.ctx.lineTo(bottomX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Retro neon shapes
        const shapeCount = 6;
        for (let i = 0; i < shapeCount; i++) {
            const shapeX = Math.random() * this.canvas.width;
            const shapeY = Math.random() * this.canvas.height * 0.6;
            const size = Math.random() * 20 + 10;
            
            this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            this.ctx.shadowColor = textColor;
            this.ctx.shadowBlur = 15;
            
            // Simple geometric shapes
            if (i % 3 === 0) {
                // Triangle
                this.ctx.beginPath();
                this.ctx.moveTo(shapeX, shapeY - size);
                this.ctx.lineTo(shapeX - size, shapeY + size);
                this.ctx.lineTo(shapeX + size, shapeY + size);
                this.ctx.closePath();
                this.ctx.fill();
            } else if (i % 3 === 1) {
                // Circle
                this.ctx.beginPath();
                this.ctx.arc(shapeX, shapeY, size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Diamond
                this.ctx.beginPath();
                this.ctx.moveTo(shapeX, shapeY - size);
                this.ctx.lineTo(shapeX + size, shapeY);
                this.ctx.lineTo(shapeX, shapeY + size);
                this.ctx.lineTo(shapeX - size, shapeY);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        
        // Simple scan lines
        this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
        for (let scanline = 0; scanline < this.canvas.height; scanline += 4) {
            this.ctx.fillRect(0, scanline, this.canvas.width, 1);
        }
        
        // Set retro font
        this.ctx.font = `${this.canvas.height * 0.15}px "${font}", "Impact", sans-serif`;
        
        // Classic 80s 3D text effect
        const shadowColors = [
            `rgba(${Math.max(0, rgb.r - 150)}, ${Math.max(0, rgb.g - 150)}, ${Math.max(0, rgb.b - 50)}, 0.9)`,
            `rgba(${Math.max(0, rgb.r - 100)}, ${Math.max(0, rgb.g - 100)}, ${Math.max(0, rgb.b - 30)}, 0.7)`,
            `rgba(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${rgb.b}, 0.5)`
        ];
        
        // Apply 3D shadow effect
        shadowColors.forEach((color, index) => {
            const offset = (index + 1) * 3;
            this.ctx.fillStyle = color;
            this.ctx.fillText(text, x + offset, y + offset);
        });
        
        // Bright neon outline
        this.ctx.strokeStyle = textColor;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = textColor;
        this.ctx.shadowBlur = 20;
        this.ctx.strokeText(text, x, y);
        
        // Main text with glow
        this.ctx.fillStyle = textColor;
        this.ctx.shadowColor = textColor;
        this.ctx.shadowBlur = 25;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillText(text, x, y);
        
        // Bright white highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(text, x, y);
        
        // Add retro light beams
        const beamCount = 4;
        for (let i = 0; i < beamCount; i++) {
            const beamAngle = (Math.PI * 2 / beamCount) * i;
            const beamLength = 80;
            const beamX = x + Math.cos(beamAngle) * beamLength;
            const beamY = y + Math.sin(beamAngle) * beamLength;
            
            this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = textColor;
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(beamX, beamY);
            this.ctx.stroke();
        }
        
        // Reset all effects
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    /**
     * Apply sparkle/stars effect
     */
    applyFireEffect(text, x, y, textColor, font) {
        // Convert user's color to RGB
        const rgb = Utils.hexToRgb(textColor) || { r: 255, g: 215, b: 0 };
        
        // Create sparkle background
        const sparkleCount = 20;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleX = Math.random() * this.canvas.width;
            const sparkleY = Math.random() * this.canvas.height;
            const size = Math.random() * 6 + 2;
            const brightness = Math.random();
            
            // Draw star shape
            this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;
            this.ctx.shadowColor = textColor;
            this.ctx.shadowBlur = 10;
            
            // Simple star
            this.ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = (j * Math.PI * 2) / 5;
                const starX = sparkleX + Math.cos(angle) * size;
                const starY = sparkleY + Math.sin(angle) * size;
                if (j === 0) {
                    this.ctx.moveTo(starX, starY);
                } else {
                    this.ctx.lineTo(starX, starY);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Glowing background around text
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 80);
        glowGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
        glowGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(x - 80, y - 80, 160, 160);
        
        // Set font
        this.ctx.font = `${this.canvas.height * 0.15}px "${font}", serif`;
        
        // Text shadow layers
        const shadowLayers = [
            { blur: 20, offset: 3, alpha: 0.8 },
            { blur: 15, offset: 2, alpha: 0.9 },
            { blur: 10, offset: 1, alpha: 1.0 }
        ];
        
        shadowLayers.forEach(layer => {
            this.ctx.fillStyle = textColor;
            this.ctx.shadowColor = textColor;
            this.ctx.shadowBlur = layer.blur;
            this.ctx.shadowOffsetX = layer.offset;
            this.ctx.shadowOffsetY = layer.offset;
            this.ctx.globalAlpha = layer.alpha;
            this.ctx.fillText(text, x, y);
        });
        
        // Main text
        this.ctx.fillStyle = textColor;
        this.ctx.shadowColor = textColor;
        this.ctx.shadowBlur = 25;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.fillText(text, x, y);
        
        // Bright sparkles around text
        const textSparkles = 12;
        for (let i = 0; i < textSparkles; i++) {
            const angle = (Math.PI * 2 * i) / textSparkles;
            const distance = 60 + Math.random() * 40;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;
            const size = Math.random() * 4 + 3;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = 15;
            this.ctx.globalAlpha = 0.9;
            
            // Simple cross sparkle
            this.ctx.fillRect(sparkleX - size, sparkleY - 1, size * 2, 2);
            this.ctx.fillRect(sparkleX - 1, sparkleY - size, 2, size * 2);
        }
        
        // Reset effects
        this.ctx.globalAlpha = 1;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    /**
     * Set canvas background
     * @param {string} color - Background color
     * @param {string} type - Background type (solid, gradient, transparent)
     */
    setBackground(color, type) {
        switch (type) {
            case 'solid':
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            
            case 'gradient':
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                const rgb = Utils.hexToRgb(color);
                if (rgb) {
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(1, `rgb(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)})`);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
                break;
            
            case 'transparent':
                // Transparent background - no fill
                break;
        }
    }

    /**
     * Generate animated banner
     * @param {Object} settings - Banner settings
     * @returns {Promise<string>} Data URL of generated GIF
     */
    async generateBanner(settings) {
        if (this.isGenerating) {
            throw new Error('Banner generation already in progress');
        }

        this.isGenerating = true;

        try {
            const {
                text,
                font = 'random',
                speed = CONFIG.DEFAULT_DELAY,
                textColor = CONFIG.DEFAULT_TEXT_COLOR,
                bgColor = CONFIG.DEFAULT_BG_COLOR,
                backgroundType = 'solid'
            } = settings;

            // Validate input
            if (!text || text.trim().length === 0) {
                throw new Error('Please enter text for your banner');
            }

            if (text.length > CONFIG.MAX_TEXT_LENGTH) {
                throw new Error(`Text must be ${CONFIG.MAX_TEXT_LENGTH} characters or less`);
            }

            // Sanitize text
            const sanitizedText = Utils.sanitizeText(text);

            // Determine fonts to use
            const fontsToUse = font === 'random' ? FONT_LIST : [font];

            // Initialize GIF encoder
            const encoder = new GIFEncoder();
            encoder.setRepeat(0); // Loop forever
            encoder.setDelay(speed);
            encoder.start();

            // Generate frames
            const options = {
                textColor,
                backgroundColor: bgColor,
                backgroundType,
                visualEffect: settings.visualEffect || 'none'
            };

            for (const fontFamily of fontsToUse) {
                const ctx = this.createFrame(sanitizedText, fontFamily, options);
                encoder.addFrame(ctx);
            }

            encoder.finish();

            // Get the GIF data
            const binaryGif = encoder.stream().getData();
            const dataUrl = 'data:image/gif;base64,' + encode64(binaryGif);

            console.log('🎬 GIF encoding complete:', {
                binarySize: binaryGif.length,
                dataUrlLength: dataUrl.length,
                startsWithData: dataUrl.startsWith('data:image/gif;base64,')
            });

            this.currentBanner = {
                dataUrl,
                text: sanitizedText,
                settings: { ...settings },
                size: binaryGif.length,
                timestamp: Date.now()
            };

            console.log('💾 Banner data stored:', this.currentBanner);
            return dataUrl;
        } catch (error) {
            console.error('Banner generation failed:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Get current banner data
     * @returns {Object|null} Current banner data
     */
    getCurrentBanner() {
        return this.currentBanner;
    }

    /**
     * Check if currently generating
     * @returns {boolean} Is generating
     */
    isGeneratingBanner() {
        return this.isGenerating;
    }
}

// ========================================
// Preview Manager
// ========================================

class PreviewManager {
    constructor() {
        this.elements = {
            placeholder: document.getElementById('preview-placeholder'),
            banner: document.getElementById('preview-banner'),
            image: document.getElementById('banner-image'),
            loading: document.getElementById('preview-loading')
        };
        
        // Initialize with clean state - show only placeholder
        this.showPlaceholder();
    }

    /**
     * Show loading state
     */
    showLoading() {
        console.log('⏳ SHOWING LOADING - Clean UI');
        
        // Get elements directly from DOM
        const placeholder = document.getElementById('preview-placeholder');
        const banner = document.getElementById('preview-banner');
        const loading = document.getElementById('preview-loading');

        // Hide other states
        if (placeholder) {
            placeholder.style.display = 'none';
            placeholder.style.visibility = 'hidden';
        }
        if (banner) {
            banner.style.display = 'none';
            banner.style.visibility = 'hidden';
        }

        // Show loading
        if (loading) {
            loading.style.display = 'block';
            loading.style.visibility = 'visible';
            loading.style.opacity = '1';
        }
        
        console.log('✅ LOADING DISPLAYED WITH CLEAN UI');
    }

    /**
     * Show banner preview
     * @param {string} dataUrl - Banner data URL
     * @param {Object} metadata - Banner metadata
     */
    showBanner(dataUrl, metadata = {}) {
        console.log('🚀 SHOWING BANNER - Clean UI approach');
        
        // Get elements directly from DOM
        const placeholder = document.getElementById('preview-placeholder');
        const banner = document.getElementById('preview-banner');
        const image = document.getElementById('banner-image');
        const loading = document.getElementById('preview-loading');

        console.log('🔍 Direct DOM elements found:', {
            placeholder: !!placeholder,
            banner: !!banner,
            image: !!image,
            loading: !!loading
        });

        // PROPERLY hide all other preview states
        if (placeholder) {
            placeholder.style.display = 'none';
            placeholder.style.visibility = 'hidden';
        }
        if (loading) {
            loading.style.display = 'none';
            loading.style.visibility = 'hidden';
        }

        if (!banner || !image) {
            console.error('❌ Critical elements missing!');
            return;
        }

        if (!dataUrl) {
            console.error('❌ No dataUrl provided!');
            return;
        }

        console.log('🖼️ Setting banner content...');
        
        // Set image source and properties
        image.src = dataUrl;
        image.alt = `Generated banner: ${metadata.text || 'Unknown'}`;
        
        // Add metadata tooltip
        if (metadata && metadata.size) {
            const sizeText = Utils.formatFileSize(metadata.size);
            image.title = `Size: ${sizeText}`;
        }
        
        // SHOW the banner with proper visibility
        banner.style.display = 'block';
        banner.style.visibility = 'visible';
        banner.style.opacity = '1';
        
        console.log('✅ BANNER DISPLAYED WITH CLEAN UI');
    }

    /**
     * Show placeholder
     */
    showPlaceholder() {
        console.log('📋 SHOWING PLACEHOLDER - Clean UI');
        
        // Get elements directly from DOM
        const placeholder = document.getElementById('preview-placeholder');
        const banner = document.getElementById('preview-banner');
        const loading = document.getElementById('preview-loading');

        // Hide banner and loading states
        if (banner) {
            banner.style.display = 'none';
            banner.style.visibility = 'hidden';
        }
        if (loading) {
            loading.style.display = 'none';
            loading.style.visibility = 'hidden';
        }

        // Show placeholder
        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.style.visibility = 'visible';
            placeholder.style.opacity = '1';
        }
        
        console.log('✅ PLACEHOLDER DISPLAYED WITH CLEAN UI');
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.hideAll();
        this.elements.placeholder.style.display = 'block';
        
        // Update placeholder content for error
        const placeholder = this.elements.placeholder;
        const icon = placeholder.querySelector('.placeholder-icon');
        const title = placeholder.querySelector('h4');
        const description = placeholder.querySelector('p');
        
        if (icon) icon.style.color = 'var(--error-color)';
        if (title) title.textContent = 'Generation Failed';
        if (description) description.textContent = message;
        
        // Reset after 5 seconds
        setTimeout(() => {
            this.resetPlaceholder();
            this.showPlaceholder();
        }, 5000);
    }

    /**
     * Reset placeholder to default state
     */
    resetPlaceholder() {
        const placeholder = this.elements.placeholder;
        const icon = placeholder.querySelector('.placeholder-icon');
        const title = placeholder.querySelector('h4');
        const description = placeholder.querySelector('p');
        
        if (icon) icon.style.color = '';
        if (title) title.textContent = 'Your banner will appear here';
        if (description) description.textContent = 'Fill in the text field and click generate to create your animated banner';
    }

    /**
     * Hide all preview states
     */
    hideAll() {
        console.log('👁️ Hiding all preview elements...');
        Object.values(this.elements).forEach((element, index) => {
            if (element) {
                const wasVisible = element.style.display !== 'none';
                element.style.display = 'none';
                if (wasVisible) {
                    console.log(`🙈 Hid element ${index}:`, element.id || element.className);
                }
            }
        });
    }
}

// ========================================
// Main Application Class
// ========================================

class BannerGeneratorApp {
    constructor() {
        this.isInitialized = false;
        this.toast = new ToastManager();
        this.theme = new ThemeManager();
        this.settings = new SettingsManager();
        this.generator = new BannerGenerator();
        this.preview = new PreviewManager();
        
        this.elements = {
            generateBtn: document.getElementById('generate-btn'),
            downloadBtn: document.getElementById('download-btn'),
            regenerateBtn: document.getElementById('regenerate-btn'),
            aboutLink: document.getElementById('about-link'),
            aboutModal: document.getElementById('about-modal'),
            modalClose: document.querySelector('.modal-close'),
            loadingScreen: document.getElementById('loading-screen')
        };

        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Wait for fonts to load
            await this.loadFonts();

            // Setup event listeners
            this.setupEventListeners();

            // Hide loading screen
            this.hideLoadingScreen();

            // Show welcome message
            this.toast.show('Welcome to MBG Banner Generator! 🎉', 'success');

            this.isInitialized = true;
        } catch (error) {
            console.error('App initialization failed:', error);
            this.toast.show('Failed to initialize application', 'error');
            this.hideLoadingScreen();
        }
    }

    /**
     * Load Google Fonts
     * @returns {Promise} Font loading promise
     */
    loadFonts() {
        return new Promise((resolve) => {
            // Check if fonts are already loaded
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(resolve);
            } else {
                // Fallback for older browsers
                setTimeout(resolve, 2000);
            }
        });
    }

    setupEventListeners() {
        // Generate button
        this.elements.generateBtn?.addEventListener('click', () => {
            this.handleGenerate();
        });

        // Download button
        this.elements.downloadBtn?.addEventListener('click', () => {
            this.handleDownload();
        });

        // Regenerate button
        this.elements.regenerateBtn?.addEventListener('click', () => {
            this.handleGenerate();
        });

        // About modal
        this.elements.aboutLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAboutModal();
        });

        this.elements.modalClose?.addEventListener('click', () => {
            this.hideAboutModal();
        });

        // Close modal on outside click
        this.elements.aboutModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.aboutModal) {
                this.hideAboutModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Form validation on Enter key
        document.getElementById('banner-text')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleGenerate();
            }
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.toast.show('Internet connection restored', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            this.toast.show('Working offline - some features may be limited', 'warning', 3000);
        });
    }

    /**
     * Handle banner generation
     */
    async handleGenerate() {
        if (this.generator.isGeneratingBanner()) {
            this.toast.show('Please wait for current generation to complete', 'warning');
            return;
        }

        try {
            // Get current settings and force random font
            const settings = this.settings.getSettings();
            settings.font = 'random'; // Always use random fonts
            
            console.log('🚀 Starting banner generation with settings:', settings);
            
            // Validate settings
            if (!settings.text || settings.text.trim().length === 0) {
                this.toast.show('Please enter text for your banner', 'error');
                document.getElementById('banner-text')?.focus();
                return;
            }

            // Show loading state
            this.setGenerateButtonLoading(true);
            this.preview.showLoading();

            // Generate banner
            console.log('🎨 Generating banner...');
            const dataUrl = await this.generator.generateBanner(settings);
            const bannerData = this.generator.getCurrentBanner();

            console.log('✅ Banner generated:', {
                dataUrlLength: dataUrl ? dataUrl.length : 0,
                bannerData: bannerData
            });

            // Verify we have valid data
            if (!dataUrl) {
                throw new Error('Failed to generate banner data');
            }

            if (!bannerData) {
                throw new Error('Banner metadata is missing');
            }

            // Show preview - DIRECT APPROACH
            console.log('📱 Showing banner in preview...');
            console.log('🎯 Calling showBanner with:', { dataUrlLength: dataUrl.length, bannerData });
            this.preview.showBanner(dataUrl, bannerData);
            
            // EMERGENCY BACKUP - Direct DOM manipulation
            setTimeout(() => {
                const banner = document.getElementById('preview-banner');
                const image = document.getElementById('banner-image');
                if (banner && image && dataUrl) {
                    console.log('🚨 EMERGENCY BACKUP: Forcing banner display via DOM');
                    image.src = dataUrl;
                    banner.style.display = 'block';
                    banner.style.visibility = 'visible';
                }
            }, 100);

            // Success feedback
            const sizeText = Utils.formatFileSize(bannerData.size);
            this.toast.show(`Banner generated successfully! (${sizeText})`, 'success');

        } catch (error) {
            console.error('❌ Generation failed:', error);
            this.preview.showError(error.message);
            this.toast.show(error.message || 'Failed to generate banner', 'error');
        } finally {
            this.setGenerateButtonLoading(false);
        }
    }

    /**
     * Handle banner download
     */
    handleDownload() {
        const bannerData = this.generator.getCurrentBanner();
        
        if (!bannerData) {
            this.toast.show('No banner to download. Generate one first!', 'warning');
            return;
        }

        try {
            const filename = `banner-${bannerData.text.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gif`;
            
            // Use the download library
            download(bannerData.dataUrl, filename, 'image/gif');
            
            this.toast.show('Banner downloaded successfully! 📥', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.toast.show('Failed to download banner', 'error');
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: Generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.handleGenerate();
        }

        // Ctrl/Cmd + S: Download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.handleDownload();
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            this.hideAboutModal();
        }

        // Ctrl/Cmd + /: Show shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showKeyboardShortcuts();
        }
    }

    /**
     * Show keyboard shortcuts toast
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            'Ctrl+Enter: Generate banner',
            'Ctrl+S: Download banner',
            'Escape: Close modals',
            'Ctrl+/: Show shortcuts'
        ];
        this.toast.show(shortcuts.join(' • '), 'info', 6000);
    }

    /**
     * Set generate button loading state
     * @param {boolean} loading - Is loading
     */
    setGenerateButtonLoading(loading) {
        const btn = this.elements.generateBtn;
        if (!btn) return;

        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                if (this.elements.loadingScreen && this.elements.loadingScreen.parentNode) {
                    this.elements.loadingScreen.parentNode.removeChild(this.elements.loadingScreen);
                }
            }, 500);
        }
    }

    /**
     * Show about modal
     */
    showAboutModal() {
        if (this.elements.aboutModal) {
            this.elements.aboutModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide about modal
     */
    hideAboutModal() {
        if (this.elements.aboutModal) {
            this.elements.aboutModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// ========================================
// Application Initialization
// ========================================

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new BannerGeneratorApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BannerGeneratorApp,
        Utils,
        CONFIG,
        FONT_LIST
    };
} 