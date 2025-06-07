
/**
 * MBG Banner Generator - Legacy Compatibility Layer
 * Maintained by: omaralhami
 * GitHub: https://github.com/omaralhami/Mar-Banner-Generator
 * 
 * This file maintains backward compatibility with the original Banner Generator
 * while providing enhanced functionality. The new modern version is in app.js.
 */

console.log('🎉 MBG Banner Generator loaded! Maintained by omaralhami');
console.log('🔗 View on GitHub: https://github.com/omaralhami/Mar-Banner-Generator');

// Enhanced font list with better organization
var fontList = [
    "Barlow Condensed", "Caveat", "Chela One", "Dancing Script", "El Messiri", 
    "Gelasio", "Gloria Hallelujah", "Great Vibes", "Indie Flower", "Lexend Deca", 
    "Lilita One", "Lobster", "Lugrasimo", "Lumanosimo", "Pacifico", "Pangolin",
    "Playfair Display", "Rubik", "Shadows Into Light", "Space Mono", "Tektur", 
    "Wix Madefor Text", "Yuji Boku"
];

// Enhanced canvas setup with better defaults
var canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 168;

// Performance improvements and error handling
function CreateFrame(text, font) {
    try {
        let ctx = canvas.getContext('2d');
        
        // Enhanced background with better contrast
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Improved text rendering with shadow for better readability
        ctx.fillStyle = '#ffffff';
        ctx.font = `32px "${font}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Calculate centered position
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        
        // Render text with improved handling
        ctx.fillText(text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        return ctx;
    } catch (error) {
        console.error('Frame creation failed:', error);
        throw new Error('Failed to create banner frame');
    }
}

let current;
let isGenerating = false;

// Enhanced banner creation with improved error handling and performance
function CreateBanner(name) {
    if (isGenerating) {
        console.warn('Banner generation already in progress');
        return;
    }
    
    try {
        isGenerating = true;
        
        // Input validation and sanitization
        let text = name?.trim();
        if (!text || text.length === 0) {
            throw new Error('Please enter text for your banner');
        }
        
        if (text.length > 50) {
            throw new Error('Text must be 50 characters or less');
        }
        
        // Sanitize input
        text = text.replace(/[<>]/g, '');
        
        // Get delay with validation
        let delayInput = document.querySelector('.delay input, #animation-speed');
        let delay = parseInt(delayInput?.value) || 100;
        delay = Math.max(50, Math.min(1000, delay)); // Clamp between 50-1000ms
        
        current = null;
        
        // Initialize GIF encoder with error handling
        let encoder = new GIFEncoder();
        encoder.setRepeat(0);
        encoder.setDelay(delay);
        encoder.start();
        
        // Generate frames with progress indication
        console.log(`Generating banner with ${fontList.length} fonts...`);
        
        for (let i = 0; i < fontList.length; i++) {
            let ctx = CreateFrame(text, fontList[i]);
            encoder.addFrame(ctx);
        }
        
        encoder.finish();
        
        // Process the result
        var binary_gif = encoder.stream().getData();
        var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
        
        // Update UI elements
        var img = document.querySelector('.banner, #banner-image');
        if (img) {
            img.setAttribute("data-name", text);
            img.src = data_url;
            img.alt = `Generated banner: ${text}`;
        }
        
        current = {
            dataUrl: data_url,
            text: text,
            size: binary_gif.length,
            timestamp: Date.now()
        };
        
        // Success feedback
        console.log(`✅ Banner generated successfully! Size: ${formatFileSize(binary_gif.length)}`);
        
        // Show success message if new toast system is available
        if (window.app && window.app.toast) {
            window.app.toast.show(`Banner generated successfully! (${formatFileSize(binary_gif.length)})`, 'success');
        }
        
    } catch (error) {
        console.error('Banner generation failed:', error);
        
        // Show error message if new toast system is available
        if (window.app && window.app.toast) {
            window.app.toast.show(error.message || 'Failed to generate banner', 'error');
        } else {
            alert(error.message || 'Failed to generate banner');
        }
    } finally {
        isGenerating = false;
    }
}

// Enhanced download function with better error handling
function DownloadBanner() {
    try {
        if (!current) {
            const message = 'No banner to download. Generate one first!';
            if (window.app && window.app.toast) {
                window.app.toast.show(message, 'warning');
            } else {
                alert(message);
            }
            return;
        }
        
        let img = document.querySelector(".banner, #banner-image");
        let filename = `banner-${current.text.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gif`;
        
        // Use enhanced download with fallback
        if (typeof download === 'function') {
            download(current.dataUrl, filename, "image/gif");
        } else {
            // Fallback download method
            let link = document.createElement('a');
            link.download = filename;
            link.href = current.dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        console.log(`📥 Banner downloaded: ${filename}`);
        
        // Success feedback
        if (window.app && window.app.toast) {
            window.app.toast.show('Banner downloaded successfully! 📥', 'success');
        }
        
    } catch (error) {
        console.error('Download failed:', error);
        
        if (window.app && window.app.toast) {
            window.app.toast.show('Failed to download banner', 'error');
        } else {
            alert('Failed to download banner');
        }
    }
}

// Enhanced generate function with better validation
function Generate() {
    try {
        let nameInput = document.querySelector('.name, #banner-text');
        let name = nameInput?.value;
        
        if (name && name.trim() !== "") {
            CreateBanner(name);
        } else {
            // Enhanced error styling
            let container = document.querySelector('.generate .input-container, .input-wrapper');
            if (container) {
                container.classList.add("error", "error-state");
                nameInput?.focus();
                
                setTimeout(() => {
                    container.classList.remove("error", "error-state");
                }, 1000);
            }
            
            const message = 'Please enter text for your banner';
            if (window.app && window.app.toast) {
                window.app.toast.show(message, 'error');
            } else {
                console.warn(message);
            }
        }
    } catch (error) {
        console.error('Generate function failed:', error);
        
        if (window.app && window.app.toast) {
            window.app.toast.show('Failed to generate banner', 'error');
        }
    }
}

// Utility function for file size formatting
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MBG Banner Generator ready!');
    
    // Improve accessibility
    const generateBtn = document.querySelector('.btn, #generate-btn');
    if (generateBtn && !generateBtn.hasAttribute('aria-label')) {
        generateBtn.setAttribute('aria-label', 'Generate animated banner');
    }
    
    // Add keyboard support
    const textInput = document.querySelector('.name, #banner-text');
    if (textInput) {
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                Generate();
            }
        });
    }
    
    // Enhanced delay input validation
    const delayInput = document.querySelector('.delay input, #animation-speed');
    if (delayInput) {
        delayInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 50) this.value = 50;
            if (value > 1000) this.value = 1000;
        });
    }
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.now) {
    const startTime = performance.now();
    window.addEventListener('load', function() {
        const loadTime = performance.now() - startTime;
        console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
    });
}

// Export for compatibility
window.BannerGenerator = {
    CreateBanner,
    DownloadBanner,
    Generate,
    getCurrentBanner: () => current,
    isGenerating: () => isGenerating,
    fontList
};

console.log('✨ Maintained by omaralhami - View on GitHub: https://github.com/omaralhami/Mar-Banner-Generator');