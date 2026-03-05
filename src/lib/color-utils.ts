/**
 * Utility for extracting the dominant color from an image using a Canvas.
 * Generates an HSL value to be used for M3 Dynamic Color injection.
 */

export function extractImageColor(imgUrl: string): Promise<{ h: number; s: number; l: number } | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(null);
                    return;
                }

                // Downscale for performance
                canvas.width = 64;
                canvas.height = 64;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let r = 0, g = 0, b = 0, count = 0;

                // Sample every 4th pixel for speed
                for (let i = 0; i < imageData.length; i += 16) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                resolve(rgbToHsl(r, g, b));
            } catch (error) {
                console.error("Failed to extract image color:", error);
                resolve(null);
            }
        };

        img.onerror = () => resolve(null);
        img.src = imgUrl;
    });
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Given a base HSL color, generates M3 primary tonal palettes dynamically.
 * Returns an object of CSS variable overrides.
 */
export function generateM3TonalPalette(h: number, s: number, l: number, isDark: boolean = false): Record<string, string> {
    // Ensure we maintain a reasonable saturation and lightness for the primary hue
    const primaryS = Math.max(s, 60); // Keep it vibrant

    if (isDark) {
        return {
            '--m3-primary': `${h} ${primaryS}% 65%`,
            '--m3-on-primary': `0 0% 10%`,
            '--m3-primary-container': `${h} ${primaryS}% 20%`,
            '--m3-on-primary-container': `${h} ${primaryS}% 90%`,
        };
    } else {
        return {
            '--m3-primary': `${h} ${primaryS}% 45%`,
            '--m3-on-primary': `0 0% 100%`,
            '--m3-primary-container': `${h} ${primaryS}% 90%`,
            '--m3-on-primary-container': `${h} ${primaryS}% 10%`,
        };
    }
}
