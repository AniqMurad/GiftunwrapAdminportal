import { useState } from 'react';
import { postProduct } from '../api';
import { PageHeader, Card, Field, Input, Textarea, Select, ImageDropzone, Button, useToast } from '../components/UI';
import WhatsInsideEditor from '../components/WhatsInsideEditor';
import ProductOptionsEditor from '../components/ProductOptionsEditor';
import { cleanWhatsInsideItems } from '../utils/whatsInside';
import { prepareImagesForUpload } from '../utils/imageCompression';

const productCategories = [
    {
        value: 'giftsForHim',
        label: 'Gifts for Him',
        keyGifts: ['father', 'brother', 'boyfriend', 'son', 'husband', 'friend'],
    },
    {
        value: 'giftsForHer',
        label: 'Gifts for Her',
        keyGifts: ['mum', 'sister', 'girlfriend', 'daughter', 'wife', 'friend'],
    },
    {
        value: 'birthday',
        label: 'Birthday Gifts',
        keyGifts: ['birthday'],
    },
    {
        value: 'personalized',
        label: 'Personalized Gifts',
        keyGifts: ['personalized'],
    },
    {
        value: 'floralArrangements',
        label: 'Floral Arrangements',
        keyGifts: ['bouquets', 'floralarrangements'],
    },
    {
        value: 'sweetTreats',
        label: 'Sweet Treats',
        keyGifts: ['cake', 'brownies', 'cookies', 'chocolates'],
    },
    {
        value: 'greetingCards',
        label: 'Greeting Cards',
        keyGifts: ['birthday', 'anniversary', 'thankyou', 'getwell', 'congratulations', 'love', 'general'],
    },
    {
        value: 'giftsForCompany',
        label: 'Corporate Gifts',
        keyGifts: ['newhire', 'occasion', 'farewell', 'achievement', 'workanniversary'],
    },
];

const categoryOptions = Object.fromEntries(
    productCategories.map(({ value, keyGifts }) => [value, keyGifts]),
);

const formatOptionLabel = (value) => value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function MultiCheckboxSelect({ label, options, value, onChange, disabled = false, required = false }) {
    const selectedValues = Array.isArray(value) ? value : [];
    const selectionLabel = selectedValues.length
        ? selectedValues.map(formatOptionLabel).join(', ')
        : `Select ${label}`;

    const toggleOption = (option) => {
        const nextValues = selectedValues.includes(option)
            ? selectedValues.filter((valueItem) => valueItem !== option)
            : [...selectedValues, option];
        onChange(nextValues);
    };

    return (
        <Field label={label} required={required}>
            <details
                className={`multi-checkbox-select${disabled ? ' is-disabled' : ''}`}
                aria-disabled={disabled}
            >
                <summary
                    aria-label={`${label}: ${selectionLabel}`}
                    onClick={disabled ? (event) => event.preventDefault() : undefined}
                >
                    <span>{selectionLabel}</span>
                </summary>
                {!disabled && (
                    <div className="multi-checkbox-menu" role="group" aria-label={label}>
                        {options.map((option) => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option)}
                                    onChange={() => toggleOption(option)}
                                />
                                <span>{formatOptionLabel(option)}</span>
                            </label>
                        ))}
                    </div>
                )}
            </details>
        </Field>
    );
}

export default function PostProduct() {
    const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Keep request under common serverless body limits
    const MAX_PRODUCT_IMAGES = 10;
    const toast = useToast();

    const [form, setForm] = useState({
        category: '',
        products: [
            {
                name: '',
                price: '',
                originalPrice: '',
                discount: '',
                keyGift: [],
                subcategory: '',
                shortDescription: '',
                longDescription: '',
                metaTitle: '',
                metaDescription: '',
                showWhatsInside: false,
                showPackaging: false,
                whatsInside: [],
                showSizeOptions: false,
                sizeOptions: [],
                showColorOptions: false,
                colorOptions: [],
            }
        ]
    });
    const [productImages, setProductImages] = useState([]);
    const [isPosting, setIsPosting] = useState(false);

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        const isGreetingCard = selectedCategory === 'greetingCards';
        setForm(prev => ({
            ...prev,
            category: selectedCategory,
            products: [{
                ...prev.products[0],
                keyGift: [], // reset keyGift on category change
                ...(isGreetingCard ? {
                    shortDescription: '',
                    longDescription: '',
                    metaTitle: '',
                    metaDescription: '',
                    showWhatsInside: false,
                    showPackaging: false,
                    whatsInside: [],
                } : {}),
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

        if (!Array.isArray(form.products[0].keyGift) || form.products[0].keyGift.length === 0) {
            toast.error('Please select at least one Key Gift.');
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
            whatsInside: cleanWhatsInsideItems(form.products[0].whatsInside),
        };
        if (productToSubmit.showWhatsInside && productToSubmit.whatsInside.length === 0) {
            toast.error('Add at least one item before showing the What’s Inside section.');
            setIsPosting(false);
            return;
        }
        if (productToSubmit.showSizeOptions && productToSubmit.sizeOptions.length === 0) {
            toast.error('Select at least one size before enabling size options.');
            setIsPosting(false);
            return;
        }
        if (productToSubmit.showColorOptions && productToSubmit.colorOptions.length === 0) {
            toast.error('Add at least one color before enabling color options.');
            setIsPosting(false);
            return;
        }
        if (form.category === 'greetingCards') {
            delete productToSubmit.shortDescription;
            delete productToSubmit.longDescription;
            delete productToSubmit.metaTitle;
            delete productToSubmit.metaDescription;
            delete productToSubmit.showWhatsInside;
            delete productToSubmit.showPackaging;
            delete productToSubmit.whatsInside;
        }
        formData.append('products', JSON.stringify([productToSubmit]));

        try {
            const whatsInsideImageEntries = form.products[0].whatsInside
                .map((item, index) => ({ index, file: item.imageFile }))
                .filter((entry) => entry.file);
            const [preparedProductUpload, preparedInsideUpload] = await Promise.all([
                prepareImagesForUpload(productImages),
                prepareImagesForUpload(whatsInsideImageEntries.map((entry) => entry.file)),
            ]);
            const totalBytes = preparedProductUpload.totalBytes + preparedInsideUpload.totalBytes;

            if (totalBytes > MAX_UPLOAD_BYTES) {
                toast.error('Images are still too large for upload. Please use fewer images or smaller originals.');
                return;
            }

            preparedProductUpload.files.forEach((file) => {
                formData.append('images', file); // 'images' must match multer field name
            });
            preparedInsideUpload.files.forEach((file, uploadIndex) => {
                formData.append(`whatsInsideImage_${whatsInsideImageEntries[uploadIndex].index}`, file);
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
                    keyGift: [],
                    subcategory: '',
                    shortDescription: '',
                    longDescription: '',
                    metaTitle: '',
                    metaDescription: '',
                    showWhatsInside: false,
                    showPackaging: false,
                    whatsInside: [],
                    showSizeOptions: false,
                    sizeOptions: [],
                    showColorOptions: false,
                    colorOptions: [],
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
    const isGreetingCard = form.category === 'greetingCards';

    return (
        <div className="page-shell" style={{ maxWidth: '780px' }}>
            <PageHeader title="Post New Product" description="Add a new product to the storefront catalog." />

            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="field-row">
                        <Select label="Category" required value={form.category} onChange={handleCategoryChange}>
                            <option value="">Select Category</option>
                            {productCategories.map((category) => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </Select>

                        <MultiCheckboxSelect
                            key={form.category || 'no-category'}
                            label="Key Gift"
                            required
                            options={currentKeyGifts}
                            value={form.products[0].keyGift}
                            onChange={(keyGift) => setForm((previous) => ({
                                ...previous,
                                products: [{ ...previous.products[0], keyGift }],
                            }))}
                            disabled={!form.category}
                        />
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

                    <ProductOptionsEditor
                        value={form.products[0]}
                        onChange={(productOptions) => setForm((previous) => ({
                            ...previous,
                            products: [{ ...previous.products[0], ...productOptions }],
                        }))}
                    />

                    {!isGreetingCard && (
                        <>
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

                            <fieldset className="whats-inside-editor">
                                <legend>Product detail sections</legend>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={form.products[0].showWhatsInside}
                                        onChange={(event) => setForm((previous) => ({
                                            ...previous,
                                            products: [{ ...previous.products[0], showWhatsInside: event.target.checked }],
                                        }))}
                                    />
                                    <span><strong>Show What&apos;s Inside</strong><br /><small>Display the included-item section on this product page.</small></span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={form.products[0].showPackaging}
                                        onChange={(event) => setForm((previous) => ({
                                            ...previous,
                                            products: [{ ...previous.products[0], showPackaging: event.target.checked }],
                                        }))}
                                    />
                                    <span><strong>Show How It&apos;s Packaged</strong><br /><small>Display the Gift Unwrap packaging explanation on this product page.</small></span>
                                </label>
                            </fieldset>

                            {form.products[0].showWhatsInside && (
                                <WhatsInsideEditor
                                    category={form.category}
                                    items={form.products[0].whatsInside}
                                    onChange={(whatsInside) => setForm((previous) => ({
                                        ...previous,
                                        products: [{ ...previous.products[0], whatsInside }],
                                    }))}
                                />
                            )}

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
                        </>
                    )}

                    <ImageDropzone
                        label="Product Images"
                        required
                        multiple
                        maxFiles={MAX_PRODUCT_IMAGES}
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        files={productImages}
                        onFilesChange={setProductImages}
                        help={`Images are automatically compressed before upload. Up to ${MAX_PRODUCT_IMAGES} images.`}
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
