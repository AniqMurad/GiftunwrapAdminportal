import { useState } from 'react';
import { postProduct } from '../api'; // Assuming your api.js

// Category and KeyGift map (Keep as is)
const categoryOptions = {
    birthday: ['his birthday', 'her birthday', 'employee birthday', 'baby birthday'],
    giftsForCompany: ['newhire', 'ocassion', 'farewell', 'achievement', 'workanniversary'],
    giftsForReligions: ['eid', 'holi', 'diwali', 'navroz'],
    giftsForBabies: ['newborn'],
    giftsForEveryone: ['couple', 'teacher', 'relative'],
    giftsForHer: ['mum', 'sister', 'girlfriend', 'daughter', 'wife', 'friend'],
    giftsForHim: ['pop', 'brother', 'boyfriend', 'son', 'husband', 'friend'],
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
    const [form, setForm] = useState({
        category: '',
        products: [
            {
                id: '',
                name: '',
                price: '',
                originalPrice: '',
                discount: '',
                keyGift: '',
                subcategory: '',
                shortDescription: '',
                longDescription: '',
            }
        ]
    });
    // State to hold selected image files, initialize as an empty array
    const [productImages, setProductImages] = useState([]);

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

        const formData = new FormData();
        formData.append('category', form.category);

        const productToSubmit = {
            ...form.products[0],
            id: Number(form.products[0].id),
            price: Number(form.products[0].price),
            originalPrice: form.products[0].originalPrice ? Number(form.products[0].originalPrice) : undefined,
            discount: form.products[0].discount ? Number(form.products[0].discount) : undefined,
        };
        formData.append('products', JSON.stringify([productToSubmit]));

        // Append each selected image file
        productImages.forEach((file) => {
            formData.append('images', file); // 'images' must match multer field name
        });

        try {
            await postProduct(formData); // Use the postProduct from api.js
            alert('Product posted successfully!');
            // Reset form and images after successful submission
            setForm({
                category: '',
                products: [{
                    id: '',
                    name: '',
                    price: '',
                    originalPrice: '',
                    discount: '',
                    keyGift: '',
                    subcategory: '',
                    shortDescription: '',
                    longDescription: '',
                }]
            });
            setProductImages([]); // Clear selected images
            // To clear file input, you might need a ref or reset the form
            e.target.reset(); // Resets the form elements
        } catch (error) {
            console.error('Failed to post product:', error.response?.data || error);
            alert('Failed to post product: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }
    };

    const currentKeyGifts = categoryOptions[form.category] || [];

    return (
        <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Post New Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="number"
                    name="id"
                    placeholder="Product ID"
                    value={form.products[0].id}
                    onChange={handleProductChange}
                    style={inputStyle}
                    required
                />

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

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        Product Images (Upload up to 4 images):
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg, image/png, image/jpg"
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
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#1d4ed8',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginTop: '1rem',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                >
                    Post Product
                </button>
            </form>
        </div>
    );
}