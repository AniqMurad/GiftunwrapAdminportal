import { useState } from 'react';
import { postProduct } from '../api';
import { PageHeader, Card, Input, Textarea, Select, ImageDropzone, Button, useToast } from '../components/ui';

const categoryOptions = {
    giftsForCompany: ['newhire', 'ocassion', 'farewell', 'achievement', 'workanniversary'],
    giftsForReligions: ['eid', 'holi', 'diwali', 'navroz', 'ramadan'],
    giftsForBabies: ['newborn'],
    giftsForEveryone: ['couple', 'teacher', 'relative'],
    giftsForHer: ['mum', 'sister', 'girlfriend', 'daughter', 'wife', 'friend'],
    giftsForHim: ['father', 'brother', 'boyfriend', 'son', 'husband', 'friend'],
    giftsForWedding: ['bride', 'groom', 'bridalparty', 'weddinganniversary'],
    FlowersChocolates: ['cake', 'bouquets', 'cakebouquets'],
};

export default function PostProduct() {
    const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Keep request under common serverless body limits
    const TARGET_IMAGE_BYTES = 900 * 1024;
    const MAX_IMAGE_DIMENSION = 1600;

    const toast = useToast();

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isPosting) {
            return;
        }

        if (productImages.length === 0) {
            toast.error('Please upload at least one image for the product.');
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
                toast.error('Images are still too large for upload. Please use fewer images or smaller originals.');
                return;
            }

            preparedFiles.forEach((file) => {
                formData.append('images', file); // 'images' must match multer field name
            });

            await postProduct(formData);
            toast.success('Product posted successfully!');
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
            setProductImages([]);
        } catch (error) {
            console.error('Failed to post product:', error.response?.data || error);
            toast.error('Failed to post product: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        } finally {
            setIsPosting(false);
        }
    };

    const currentKeyGifts = categoryOptions[form.category] || [];

    return (
        <div className="page-shell" style={{ maxWidth: '780px' }}>
            <PageHeader title="Post New Product" description="Add a new product to the storefront catalog." />

            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="field-row">
                        <Select label="Category" required value={form.category} onChange={handleCategoryChange}>
                            <option value="">Select Category</option>
                            {Object.keys(categoryOptions).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Select>

                        <Select
                            label="Key Gift"
                            required
                            name="keyGift"
                            value={form.products[0].keyGift}
                            onChange={handleProductChange}
                            disabled={!form.category}
                        >
                            <option value="">Select Key Gift</option>
                            {currentKeyGifts.map((keyGift) => (
                                <option key={keyGift} value={keyGift}>{keyGift}</option>
                            ))}
                        </Select>
                    </div>

                    <Input
                        label="Product Name"
                        required
                        name="name"
                        placeholder="e.g. Birthday Surprise Box"
                        value={form.products[0].name}
                        onChange={handleProductChange}
                    />

                    <div className="field-row">
                        <Input
                            label="Price"
                            type="number"
                            required
                            name="price"
                            value={form.products[0].price}
                            onChange={handleProductChange}
                        />
                        <Input
                            label="Original Price"
                            type="number"
                            name="originalPrice"
                            placeholder="Optional"
                            value={form.products[0].originalPrice}
                            onChange={handleProductChange}
                        />
                    </div>

                    <div className="field-row">
                        <Input
                            label="Discount (%)"
                            type="number"
                            name="discount"
                            placeholder="Optional"
                            value={form.products[0].discount}
                            onChange={handleProductChange}
                        />
                        <Input
                            label="Subcategory"
                            name="subcategory"
                            placeholder="Optional"
                            value={form.products[0].subcategory}
                            onChange={handleProductChange}
                        />
                    </div>

                    <Textarea
                        label="Short Description"
                        name="shortDescription"
                        value={form.products[0].shortDescription}
                        onChange={handleProductChange}
                    />

                    <Textarea
                        label="Long Description"
                        name="longDescription"
                        value={form.products[0].longDescription}
                        onChange={handleProductChange}
                    />

                    <Input
                        label="Meta Title"
                        name="metaTitle"
                        placeholder="SEO — optional"
                        value={form.products[0].metaTitle}
                        onChange={handleProductChange}
                    />

                    <Textarea
                        label="Meta Description"
                        name="metaDescription"
                        placeholder="SEO — optional, max 160 characters"
                        value={form.products[0].metaDescription}
                        onChange={handleProductChange}
                        maxLength="160"
                    />

                    <ImageDropzone
                        label="Product Images"
                        required
                        multiple
                        maxFiles={4}
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        files={productImages}
                        onFilesChange={setProductImages}
                        help="Images are automatically compressed before upload. Up to 4 images."
                    />

                    <div className="form-actions">
                        <Button type="submit" loading={isPosting} size="lg">
                            {isPosting ? 'Posting...' : 'Post Product'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
