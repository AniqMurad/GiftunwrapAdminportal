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

// API functions
const fetchProducts = () => axios.get('https://giftunwrapbackend.vercel.app/api/products');
const deleteProductById = (productId) => axios.delete(`https://giftunwrapbackend.vercel.app/api/products/${productId}`);
const updateProductById = (productId, productData, images) => {
  const formData = new FormData();
  formData.append('products', JSON.stringify([productData])); // products field should be an array stringified

  images.forEach((image) => {
    formData.append('images', image);
  });

  return axios.put(`https://giftunwrapbackend.vercel.app/api/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
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
      setCategories(response.data);
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

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      keyGift: product.keyGift,
      subcategory: product.subcategory || '',
      shortDescription: product.shortDescription || '',
      longDescription: product.longDescription || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
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
    let productDataToSend = { ...editFormData };

    if (newImages.length === 0) {
      productDataToSend.images = currentImagesToRetain;
    }

    setSavingEdit(true);
    try {
      await updateProductById(editingProduct, productDataToSend, newImages);
      await getProducts();
      setEditingProduct(null);
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
            key={cat._id}
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
          maxFiles={4}
          files={newImages}
          onFilesChange={setNewImages}
          existingImages={newImages.length === 0 ? currentImagesToRetain : []}
          onRemoveExisting={handleRemoveExistingImage}
          help={newImages.length > 0 ? 'New images will replace the current ones on save.' : 'Upload new images to replace the current ones, or leave as-is to keep them.'}
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
          {category.category}
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
                        {p.keyGift}
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
                          <Button variant="secondary" size="sm" onClick={() => onEdit(p)} icon={<i className="bi bi-pencil" aria-hidden="true" />}>
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
