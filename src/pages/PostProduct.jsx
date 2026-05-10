import { useState } from 'react';
import { postProduct } from '../api'; // Assuming your api.js

// Category and KeyGift map (Keep as is)
const categoryOptions = {
    //birthday: ['his birthday', 'her birthday', 'employee birthday', 'baby birthday'],
    giftsForCompany: ['newhire', 'ocassion', 'farewell', 'achievement', 'workanniversary'],
    giftsForReligions: ['eid', 'holi', 'diwali', 'navroz', 'ramadan'],
    giftsForBabies: ['newborn'],
    giftsForEveryone: ['couple', 'teacher', 'relative'],
    giftsForHer: ['mum', 'sister', 'girlfriend', 'daughter', 'wife', 'friend'],
    giftsForHim: ['father', 'brother', 'boyfriend', 'son', 'husband', 'friend'],
    giftsForWedding: ['bride', 'groom', 'bridalparty', 'weddinganniversary'],
    FlowersChocolates: ['cake', 'bouquets', 'cakebouquets'],
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
};

const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
};

const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff',
    cursor: 'pointer',
};

export default function PostProduct() {
    const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Keep request under common serverless body limits
    const TARGET_IMAGE_BYTES = 900 * 1024;
    const MAX_IMAGE_DIMENSION = 1600;

    const [form, setForm] = useState({
        category: '',
        products: [
            {
                name: '',
                price: '',
                originalPrice: '',
                discount: '',
                keyGift: '',
                subcategory: '',
                shortDescription: '',
                longDescription: '',
                metaTitle: '',
                metaDescription: '',
            }
        ]
    });
    // State to hold selected image files, initialize as an empty array
    const [productImages, setProductImages] = useState([]);
    const [isPosting, setIsPosting] = useState(false);

    const loadImage = (file) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`Failed to read image: ${file.name}`));
            };

            img.src = objectUrl;
        });

    const canvasToBlob = (canvas, type, quality) =>
        new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Unable to compress image.'));
                    return;
                }
                resolve(blob);
            }, type, quality);
        });

    const compressImage = async (file) => {
        if (!file.type.startsWith('image/')) {
            return file;
        }

        const image = await loadImage(file);
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
            return file;
        }

        context.drawImage(image, 0, 0, width, height);

        // Convert to JPEG for strong size reduction before API upload.
        let quality = 0.85;
        let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

        while (blob.size > TARGET_IMAGE_BYTES && quality > 0.55) {
            quality -= 0.1;
            blob = await canvasToBlob(canvas, 'image/jpeg', quality);
        }

        if (blob.size >= file.size) {
            return file;
        }

        const baseName = file.name.replace(/\.[^/.]+$/, '');
        return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    };

    const prepareImagesForUpload = async (files) => {
        const compressed = await Promise.all(files.map((file) => compressImage(file)));
        const totalBytes = compressed.reduce((sum, file) => sum + file.size, 0);
        return { files: compressed, totalBytes };
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setForm(prev => ({
            ...prev,
            category: selectedCategory,
            products: [{
                ...prev.products[0],
                keyGift: '', // reset keyGift on category change
            }]
        }));
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            products: [{
                ...prev.products[0],
                [name]: value,
            }]
        }));
    };

    // Handle image file selection
    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Limit to a maximum of 4 files
        if (files.length > 4) {
            alert('You can only upload a maximum of 4 images per product.');
            setProductImages(files.slice(0, 4)); // Take only the first 4
        } else {
            setProductImages(files);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isPosting) {
            return;
        }

        // Basic validation for images
        if (productImages.length === 0) {
            alert('Please upload at least one image for the product.');
            return;
        }
        if (productImages.length > 4) {
            // This case should ideally be caught by handleImageFileChange, but double-check
            alert('You can only upload a maximum of 4 images per product.');
            return;
        }

        setIsPosting(true);

        const formData = new FormData();
        formData.append('category', form.category);

        const productToSubmit = {
            ...form.products[0],
            price: Number(form.products[0].price),
            originalPrice: form.products[0].originalPrice ? Number(form.products[0].originalPrice) : undefined,
            discount: form.products[0].discount ? Number(form.products[0].discount) : undefined,
        };
        formData.append('products', JSON.stringify([productToSubmit]));

        try {
            const { files: preparedFiles, totalBytes } = await prepareImagesForUpload(productImages);

            if (totalBytes > MAX_UPLOAD_BYTES) {
                alert('Images are still too large for upload. Please use fewer images or smaller originals.');
                return;
            }

            // Append processed image files
            preparedFiles.forEach((file) => {
                formData.append('images', file); // 'images' must match multer field name
            });

            await postProduct(formData); // Use the postProduct from api.js
            alert('Product posted successfully!');
            // Reset form and images after successful submission
            setForm({
                category: '',
                products: [{
                    name: '',
                    price: '',
                    originalPrice: '',
                    discount: '',
                    keyGift: '',
                    subcategory: '',
                    shortDescription: '',
                    longDescription: '',
                    metaTitle: '',
                    metaDescription: '',
                }]
            });
            setProductImages([]); // Clear selected images
            // To clear file input, you might need a ref or reset the form
            e.target.reset(); // Resets the form elements
        } catch (error) {
            console.error('Failed to post product:', error.response?.data || error);
            alert('Failed to post product: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        } finally {
            setIsPosting(false);
        }
    };

    const currentKeyGifts = categoryOptions[form.category] || [];

    return (
        <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Post New Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                

                <select
                    value={form.category}
                    onChange={handleCategoryChange}
                    style={selectStyle}
                    required
                >
                    <option value="">Select Category</option>
                    {Object.keys(categoryOptions).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    name="keyGift"
                    value={form.products[0].keyGift}
                    onChange={handleProductChange}
                    disabled={!form.category}
                    style={selectStyle}
                    required
                >
                    <option value="">Select Key Gift</option>
                    {currentKeyGifts.map((keyGift) => (
                        <option key={keyGift} value={keyGift}>{keyGift}</option>
                    ))}
                </select>

                <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={form.products[0].name}
                    onChange={handleProductChange}
                    style={inputStyle}
                    required
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={form.products[0].price}
                    onChange={handleProductChange}
                    style={inputStyle}
                    required
                />

                <input
                    type="number"
                    name="originalPrice"
                    placeholder="Original Price (Optional)"
                    value={form.products[0].originalPrice}
                    onChange={handleProductChange}
                    style={inputStyle}
                />
                <input
                    type="number"
                    name="discount"
                    placeholder="Discount (Optional)"
                    value={form.products[0].discount}
                    onChange={handleProductChange}
                    style={inputStyle}
                />
                <input
                    type="text"
                    name="subcategory"
                    placeholder="Subcategory (Optional)"
                    value={form.products[0].subcategory}
                    onChange={handleProductChange}
                    style={inputStyle}
                />

                <textarea
                    name="shortDescription"
                    placeholder="Short Description"
                    value={form.products[0].shortDescription}
                    onChange={handleProductChange}
                    style={textareaStyle}
                />

                <textarea
                    name="longDescription"
                    placeholder="Long Description"
                    value={form.products[0].longDescription}
                    onChange={handleProductChange}
                    style={textareaStyle}
                />

                <input
                    type="text"
                    name="metaTitle"
                    placeholder="Meta Title (SEO - Optional)"
                    value={form.products[0].metaTitle}
                    onChange={handleProductChange}
                    style={inputStyle}
                />

                <textarea
                    name="metaDescription"
                    placeholder="Meta Description (SEO - Optional, max 160 characters)"
                    value={form.products[0].metaDescription}
                    onChange={handleProductChange}
                    style={textareaStyle}
                    maxLength="160"
                />

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        Product Images (Upload up to 4 images):
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        onChange={handleImageFileChange}
                        style={{ ...inputStyle, border: 'none', padding: '0', cursor: 'pointer' }}
                    />
                    {productImages.length > 0 && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                            Selected {productImages.length} image(s).
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPosting}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: isPosting ? '#93c5fd' : '#1d4ed8',
                        color: 'white',
                        border: 'none',
                        cursor: isPosting ? 'not-allowed' : 'pointer',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.3s ease',
                        opacity: isPosting ? 0.9 : 1,
                    }}
                    onMouseEnter={e => {
                        if (!isPosting) {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = isPosting ? '#93c5fd' : '#1d4ed8';
                    }}
                >
                    {isPosting && (
                        <span
                            aria-hidden="true"
                            style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255, 255, 255, 0.5)',
                                borderTopColor: '#fff',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                    )}
                    {isPosting ? 'Posting...' : 'Post Product'}
                </button>
            </form>

            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}