/**
 * SKU and Slug Generator Utility
 * Generates SKUs and slugs with gender prefixes for categories, subcategories, and products
 */

// Gender code mapping
const GENDER_CODES = {
    'Men': 'M',
    'Women': 'W',
    'Unisex': 'U',
    'Boys': 'B',
    'Girls': 'G',
    'Kids': 'K'
};

// Category code mapping (short codes for SKU generation)
const CATEGORY_CODES = {
    'T-Shirts': 'TSH',
    'Shirts': 'SHT',
    'Dresses': 'DRS',
    'Jeans': 'JNS',
    'Trousers': 'TRS',
    'Shorts': 'SHT',
    'Jackets': 'JKT',
    'Sweaters': 'SWT',
    'Shoes': 'SHO',
    'Accessories': 'ACC',
    // Add more as needed
};

// Brand code extraction (first 2-3 uppercase letters)
const getBrandCode = (brandName) => {
    if (!brandName) return '';
    return brandName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();
};

// Product type code extraction
const getProductTypeCode = (productName, subCategoryName) => {
    const text = (subCategoryName || productName || '').toUpperCase();
    
    // Check for specific patterns
    if (text.includes('SLIM')) return 'SLM';
    if (text.includes('REGULAR')) return 'REG';
    if (text.includes('RELAXED')) return 'RLX';
    if (text.includes('COTTON')) return 'CTS';
    if (text.includes('POLYESTER')) return 'POL';
    if (text.includes('LINEN')) return 'LIN';
    
    // Default: use first 3 letters of subcategory or product name
    const source = subCategoryName || productName || 'GEN';
    return source
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();
};

// Color code extraction (first 3 letters)
const getColorCode = (colorName) => {
    if (!colorName) return '';
    const words = colorName.split(' ');
    if (words.length === 1) {
        return colorName.substring(0, 3).toUpperCase();
    }
    // For multi-word colors like "Navy Blue", use first letter of each word
    return words
        .map(w => w[0])
        .join('')
        .substring(0, 3)
        .toUpperCase();
};

// Size code mapping
const SIZE_CODES = {
    'XS': 'XS', 'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL', 'XXXL': '3XL',
    '28': '28', '30': '30', '32': '32', '34': '34', '36': '36', '38': '38', '40': '40', '42': '42',
    '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12'
};

const getSizeCode = (size) => {
    return SIZE_CODES[size] || size?.toString().substring(0, 3).toUpperCase() || 'UNK';
};

/**
 * Generate slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slugified text
 */
const generateSlug = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generate category slug with gender prefix
 * @param {string} categoryName - Category name
 * @param {string} gender - Gender (Men, Women, etc.)
 * @returns {string} - Gendered slug (e.g., "men-topwear")
 */
const generateCategorySlug = (categoryName, gender) => {
    if (!categoryName) return '';
    const genderSlug = gender ? generateSlug(gender) + '-' : '';
    const categorySlug = generateSlug(categoryName);
    return genderSlug ? `${genderSlug}-${categorySlug}` : categorySlug;
};

/**
 * Generate subcategory slug with category and gender prefix
 * @param {string} subCategoryName - Subcategory name
 * @param {string} categoryName - Category name
 * @param {string} gender - Gender (Men, Women, etc.)
 * @returns {string} - Gendered slug (e.g., "men-topwear-t-shirts")
 */
const generateSubCategorySlug = (subCategoryName, categoryName, gender) => {
    if (!subCategoryName) return '';
    const genderSlug = gender ? generateSlug(gender) + '-' : '';
    const categorySlug = categoryName ? generateSlug(categoryName) + '-' : '';
    const subCategorySlug = generateSlug(subCategoryName);
    return genderSlug ? `${genderSlug}-${categorySlug}${subCategorySlug}` : `${categorySlug}${subCategorySlug}`;
};

/**
 * Generate product slug with brand, gender, and product details
 * @param {string} productName - Product name
 * @param {string} brand - Brand name
 * @param {string} gender - Gender (Men, Women, etc.)
 * @param {string} color - Color variant
 * @returns {string} - Gendered product slug (e.g., "roadster-men-cotton-slim-shirt-navy")
 */
const generateProductSlug = (productName, brand, gender, color) => {
    if (!productName) return '';
    
    const parts = [];
    
    // Brand (if available)
    if (brand) {
        parts.push(generateSlug(brand));
    }
    
    // Gender (always include for products)
    if (gender) {
        parts.push(generateSlug(gender));
    }
    
    // Product name
    parts.push(generateSlug(productName));
    
    // Color (if available)
    if (color) {
        parts.push(generateSlug(color));
    }
    
    return parts.join('-');
};

/**
 * Generate SKU for product variant
 * Format: CATEGORY-GENDER-BRAND-PRODUCTTYPE-COLOR-SIZE
 * Example: TSH-M-RD-CTS-NVB-LRG
 * 
 * @param {Object} params - SKU generation parameters
 * @param {string} params.categoryCode - Category code (e.g., "TSH" for T-Shirts)
 * @param {string} params.gender - Gender (Men, Women, etc.)
 * @param {string} params.brand - Brand name
 * @param {string} params.productName - Product name
 * @param {string} params.subCategoryName - Subcategory name
 * @param {string} params.color - Color variant
 * @param {string} params.size - Size variant
 * @returns {string} - Generated SKU
 */
const generateSKU = ({
    categoryCode,
    gender,
    brand,
    productName,
    subCategoryName,
    color,
    size
}) => {
    const parts = [];
    
    // 1. Category Code (3 chars)
    if (categoryCode) {
        parts.push(categoryCode.toUpperCase());
    } else {
        parts.push('GEN');
    }
    
    // 2. Gender Code (1 char)
    const genderCode = GENDER_CODES[gender] || 'U';
    parts.push(genderCode);
    
    // 3. Brand Code (2-3 chars)
    const brandCode = getBrandCode(brand);
    if (brandCode) {
        parts.push(brandCode);
    }
    
    // 4. Product Type Code (3 chars)
    const productTypeCode = getProductTypeCode(productName, subCategoryName);
    if (productTypeCode) {
        parts.push(productTypeCode);
    }
    
    // 5. Color Code (3 chars)
    if (color) {
        const colorCode = getColorCode(color);
        if (colorCode) {
            parts.push(colorCode);
        }
    }
    
    // 6. Size Code (2-3 chars)
    if (size) {
        const sizeCode = getSizeCode(size);
        if (sizeCode) {
            parts.push(sizeCode);
        }
    }
    
    return parts.join('-');
};

/**
 * Get category code from category name
 * @param {string} categoryName - Category name
 * @param {string} subCategoryName - Subcategory name (optional, more specific)
 * @returns {string} - Category code
 */
const getCategoryCode = (categoryName, subCategoryName) => {
    // Check subcategory first (more specific)
    if (subCategoryName && CATEGORY_CODES[subCategoryName]) {
        return CATEGORY_CODES[subCategoryName];
    }
    
    // Check category
    if (categoryName && CATEGORY_CODES[categoryName]) {
        return CATEGORY_CODES[categoryName];
    }
    
    // Extract from name
    const source = subCategoryName || categoryName || '';
    return source
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase() || 'GEN';
};

module.exports = {
    generateSlug,
    generateCategorySlug,
    generateSubCategorySlug,
    generateProductSlug,
    generateSKU,
    getCategoryCode,
    getBrandCode,
    getColorCode,
    getSizeCode,
    GENDER_CODES,
    CATEGORY_CODES
};

