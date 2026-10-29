import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PageHeader,
  EmptyState,
  CardListSkeleton,
  Pagination,
  usePagination,
  Button,
  Card,
  Badge,
  Modal,
  Input,
  Textarea,
  ImageDropzone,
  useToast,
  useConfirm,
} from '../components/UI';
import WhatsInsideEditor from '../components/WhatsInsideEditor';
import { cleanWhatsInsideItems } from '../utils/whatsInside';
import { prepareImagesForUpload } from '../utils/imageCompression';

// API functions
const fetchProducts = () => axios.get('https://giftunwrapbackend.vercel.app/api/products');
const deleteProductById = (productId) => axios.delete(`https://giftunwrapbackend.vercel.app/api/products/${productId}`);
const updateProductById = (productId, productData, images, whatsInsideImages) => {
  const formData = new FormData();
  formData.append('products', JSON.stringify([productData])); // products field should be an array stringified

  images.forEach((image) => {
    formData.append('images', image);
  });
  whatsInsideImages.forEach(({ index, file }) => {
    formData.append(`whatsInsideImage_${index}`, file);
  });
  return axios.put(`https://giftunwrapbackend.vercel.app/api/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const categoryLabels = {
  giftsForHim: 'Gifts for Him',
  giftsForHer: 'Gifts for Her',
  birthday: 'Birthday Gifts',
  personalized: 'Personalized Gifts',
  floralArrangements: 'Floral Arrangements',
  sweetTreats: 'Sweet Treats',
  greetingCards: 'Greeting Cards',
  giftsForCompany: 'Corporate Gifts',
};

const categoryOrder = Object.keys(categoryLabels);
const obsoleteCategories = new Set(['giftsForReligions', 'FlowersChocolates']);
const sweetProductTerms = /\b(cake|cakes|chocolate|chocolates|brownie|brownies|cookie|cookies|dessert|desserts|candy|candies|truffle|truffles|confection|confections)\b|\bsweet treats?\b/i;
const floralProductTerms = /\b(flower|flowers|floral|bouquet|bouquets|bloom|blooms|rose|roses|sunflower|sunflowers)\b/i;

const productSearchText = (product) => [
  product.name,
  ...(Array.isArray(product.keyGift) ? product.keyGift : [product.keyGift]),
  product.subcategory,
  product.shortDescription,
  product.longDescription,
  product.metaTitle,
  product.metaDescription,
].filter(Boolean).join(' ');

const mergeProducts = (...productLists) => {
  const merged = new Map();
  productLists.flat().forEach((product) => {
    const key = product.id != null ? `id:${product.id}` : `_id:${product._id}`;
    if (!merged.has(key)) merged.set(key, product);
  });
  return [...merged.values()];
};

const normalizeCategories = (categories) => {
  const sourceCategories = Array.isArray(categories) ? categories : [];
  const religious = sourceCategories.find((entry) => entry.category === 'giftsForReligions');
  const mixed = sourceCategories.find((entry) => entry.category === 'FlowersChocolates');
  const current = sourceCategories.filter((entry) => !obsoleteCategories.has(entry.category));

  if (religious || mixed) {
    const floral = current.find((entry) => entry.category === 'floralArrangements');
    const sweet = current.find((entry) => entry.category === 'sweetTreats');
    const mixedProducts = mixed?.products || [];
    const floralFromMixed = mixedProducts.filter((product) => {
      const text = productSearchText(product);
      return floralProductTerms.test(text) || !sweetProductTerms.test(text);
    });
    const sweetFromMixed = mixedProducts.filter((product) => sweetProductTerms.test(productSearchText(product)));
    const remaining = current.filter((entry) => !['floralArrangements', 'sweetTreats'].includes(entry.category));
    remaining.push({ ...(floral || {}), category: 'floralArrangements', products: mergeProducts(floral?.products || [], religious?.products || [], floralFromMixed) });
    remaining.push({ ...(sweet || {}), category: 'sweetTreats', products: mergeProducts(sweet?.products || [], sweetFromMixed) });
    return remaining;
  }

  return current;
};

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState('');
  const [editFormData, setEditFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [currentImagesToRetain, setCurrentImagesToRetain] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts();
      const currentCategories = normalizeCategories(response.data)
        .sort((left, right) => {
          const leftIndex = categoryOrder.indexOf(left.category);
          const rightIndex = categoryOrder.indexOf(right.category);
          return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
            - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
        });
      setCategories(currentCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const ok = await confirm({
      title: 'Delete product?',
      message: `This will permanently remove "${productName}" from the catalog.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(productId);
    try {
      await deleteProductById(productId);
      setCategories((prevCategories) =>
        prevCategories.map((cat) => ({
          ...cat,
          products: cat.products.filter((p) => p._id !== productId),
        }))
      );
      toast.success('Product deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete product.');
      console.error(error.response?.data || error.message || error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (product, category) => {
    setEditingProduct(product._id);
    setEditingCategory(category);
    setEditFormData({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      keyGift: Array.isArray(product.keyGift) ? product.keyGift.join(', ') : product.keyGift,
      subcategory: product.subcategory || '',
      shortDescription: product.shortDescription || '',
      longDescription: product.longDescription || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      whatsInside: cleanWhatsInsideItems(product.whatsInside || product.contents || product.items),
    });
    setNewImages([]);
    setCurrentImagesToRetain(product.images || []);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemoveExistingImage = (imageUrlToRemove) => {
    setCurrentImagesToRetain((prevImages) => prevImages.filter((url) => url !== imageUrlToRemove));
  };

  const handleSaveEdit = async () => {
    const MAX_PRODUCT_IMAGES = 10;
    let productDataToSend = { ...editFormData };
    productDataToSend.keyGift = String(productDataToSend.keyGift || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    productDataToSend.whatsInside = cleanWhatsInsideItems(productDataToSend.whatsInside);
    productDataToSend.images = currentImagesToRetain;

    if (currentImagesToRetain.length + newImages.length === 0) {
      toast.error('Please keep or upload at least one product image.');
      return;
    }
    if (currentImagesToRetain.length + newImages.length > MAX_PRODUCT_IMAGES) {
      toast.error(`A product can have up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    setSavingEdit(true);
    try {
      const whatsInsideImageEntries = (editFormData.whatsInside || [])
        .map((item, index) => ({ index, file: item.imageFile }))
        .filter((entry) => entry.file);
      const [preparedProductUpload, preparedInsideUpload] = await Promise.all([
        prepareImagesForUpload(newImages),
        prepareImagesForUpload(whatsInsideImageEntries.map((entry) => entry.file)),
      ]);
      const totalBytes = preparedProductUpload.totalBytes + preparedInsideUpload.totalBytes;
      if (totalBytes > 4 * 1024 * 1024) {
        toast.error('Images are too large for upload. Please use fewer images or smaller originals.');
        return;
      }
      await updateProductById(
        editingProduct,
        productDataToSend,
        preparedProductUpload.files,
        preparedInsideUpload.files.map((file, uploadIndex) => ({
          index: whatsInsideImageEntries[uploadIndex].index,
          file,
        })),
      );
      await getProducts();
      setEditingProduct(null);
      setEditingCategory('');
      setEditFormData({});
      setNewImages([]);
      setCurrentImagesToRetain([]);
      toast.success('Product updated successfully.');
    } catch (error) {
      toast.error('Failed to update product.');
      console.error('Error updating product:', error.response?.data || error.message || error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingCategory('');
    setEditFormData({});
    setNewImages([]);
    setCurrentImagesToRetain([]);
  };

  const isEmpty = categories.length === 0 || categories.every((cat) => cat.products.length === 0);

  return (
    <div className="page-shell">
      <PageHeader title="All Products" description="Catalog products grouped by category." />

      {error ? (
        <div className="alert-banner alert-banner-danger">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </div>
      ) : loading ? (
        <CardListSkeleton count={3} />
      ) : isEmpty ? (
        <EmptyState icon="bi-bag" title="No products found" description="Products you post will appear here, grouped by category." />
      ) : (
        categories.map((cat) => (
          <CategorySection
            key={cat._id || cat.category}
            category={cat}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        ))
      )}

      <Modal
        open={!!editingProduct}
        onClose={handleCancelEdit}
        title="Edit Product"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleCancelEdit} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} loading={savingEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="field-row">
          <Input label="Name" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} />
          <Input label="Price" type="number" name="price" value={editFormData.price || ''} onChange={handleEditFormChange} />
        </div>
        <div className="field-row">
          <Input
            label="Original Price"
            type="number"
            name="originalPrice"
            placeholder="Optional"
            value={editFormData.originalPrice || ''}
            onChange={handleEditFormChange}
          />
          <Input
            label="Discount (%)"
            type="number"
            name="discount"
            placeholder="Optional"
            value={editFormData.discount || ''}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="field-row">
          <Input label="Key Gift" name="keyGift" value={editFormData.keyGift || ''} onChange={handleEditFormChange} />
          <Input
            label="Subcategory"
            name="subcategory"
            placeholder="Optional"
            value={editFormData.subcategory || ''}
            onChange={handleEditFormChange}
          />
        </div>

        <Textarea
          label="Short Description"
          name="shortDescription"
          value={editFormData.shortDescription || ''}
          onChange={handleEditFormChange}
        />
        <Textarea
          label="Long Description"
          name="longDescription"
          value={editFormData.longDescription || ''}
          onChange={handleEditFormChange}
        />

        {editingCategory !== 'greetingCards' && (
          <WhatsInsideEditor
            category={editingCategory}
            items={editFormData.whatsInside || []}
            onChange={(whatsInside) => setEditFormData((previous) => ({
              ...previous,
              whatsInside,
            }))}
          />
        )}

        <Input
          label="Meta Title"
          name="metaTitle"
          placeholder="SEO — optional"
          value={editFormData.metaTitle || ''}
          onChange={handleEditFormChange}
        />
        <Textarea
          label="Meta Description"
          name="metaDescription"
          placeholder="SEO — optional, max 160 characters"
          maxLength="160"
          value={editFormData.metaDescription || ''}
          onChange={handleEditFormChange}
        />

        <ImageDropzone
          label="Product Images"
          multiple
          maxFiles={10}
          files={newImages}
          onFilesChange={setNewImages}
          existingImages={currentImagesToRetain}
          onRemoveExisting={handleRemoveExistingImage}
          countExistingTowardLimit
          help="New images are added to the current gallery. Remove individual current images with the × button. Up to 10 images total."
        />
      </Modal>
    </div>
  );
}

function CategorySection({ category, onEdit, onDelete, deletingId }) {
  const { page, setPage, totalPages, pageItems } = usePagination(category.products, 8);

  return (
    <div style={{ marginBottom: 'var(--space-7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', textTransform: 'capitalize', color: 'var(--color-text)' }}>
          {categoryLabels[category.category] || category.category}
        </h3>
        <Badge variant="neutral">{category.products.length} products</Badge>
      </div>

      {category.products.length === 0 ? (
        <EmptyState icon="bi-bag" title="No products in this category" />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="text-right">Price</th>
                    <th>Key Gift</th>
                    <th>Reviews</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p._id}>
                      <td data-label="Name">
                        <div className="dt-row-title">{p.name}</div>
                        {p.images && p.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {p.images.slice(0, 4).map((img, idx) => (
                              <img key={idx} src={img} alt={`${p.name} ${idx + 1}`} className="dt-thumb" style={{ width: 36, height: 36 }} />
                            ))}
                          </div>
                        )}
                        {p.shortDescription && <p className="dt-row-subtitle" style={{ marginTop: '0.3rem' }}>{p.shortDescription}</p>}
                      </td>
                      <td className="text-right" data-label="Price">
                        <div>${p.price}</div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', textDecoration: 'line-through' }}>
                            ${p.originalPrice}
                          </div>
                        )}
                        {p.discount && <div style={{ fontSize: '0.78rem', color: 'var(--color-success)' }}>{p.discount}% off</div>}
                      </td>
                      <td data-label="Key Gift">
                        {Array.isArray(p.keyGift) ? p.keyGift.join(', ') : p.keyGift}
                        {p.subcategory && <div className="dt-row-subtitle">{p.subcategory}</div>}
                      </td>
                      <td data-label="Reviews">
                        {p.reviews && p.reviews.length > 0 ? (
                          <div style={{ maxHeight: 90, overflowY: 'auto', maxWidth: 220 }}>
                            {p.reviews.map((review, index) => (
                              <div key={review._id || index} style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                                <strong>{review.rating}⭐</strong> {review.comment}
                                <div className="dt-row-subtitle">
                                  by {review.username}
                                  {review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString()}` : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="dt-row-subtitle">No reviews yet</span>
                        )}
                      </td>
                      <td className="col-actions" data-label="Actions">
                        <div className="dt-action-group">
                          <Button variant="secondary" size="sm" onClick={() => onEdit(p, category.category)} icon={<i className="bi bi-pencil" aria-hidden="true" />}>
                            Edit
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            loading={deletingId === p._id}
                            onClick={() => onDelete(p._id, p.name)}
                            icon={<i className="bi bi-trash3" aria-hidden="true" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={category.products.length} pageSize={8} />
        </>
      )}
    </div>
  );
}
