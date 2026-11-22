import { useState, useEffect } from 'react';
import {
  fetchBoxes,
  createBox,
  updateBox,
  deleteBox,
  toggleBoxStock as toggleBoxStockApi,
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
  toggleCardStock as toggleCardStockApi,
} from '../api';
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  ImageDropzone,
  Button,
  Badge,
  EmptyState,
  TableSkeleton,
  Pagination,
  usePagination,
  useToast,
  useConfirm,
} from '../components/UI';

const MAX_BOX_IMAGES = 10;
const BOX_SIZE_OPTIONS = ['small', 'medium', 'large'];

const emptySizeVariants = () => BOX_SIZE_OPTIONS.reduce((variants, size) => ({
  ...variants,
  [size]: { price: '', capacity: '' },
}), {});

const getBoxSizeVariants = (box) => {
  const variants = emptySizeVariants();

  if (Array.isArray(box?.sizeVariants) && box.sizeVariants.length > 0) {
    box.sizeVariants.forEach((variant) => {
      const size = String(variant.size || '').toLowerCase();
      if (variants[size]) {
        variants[size] = {
          price: variant.price ?? '',
          capacity: variant.capacity ?? '',
        };
      }
    });
    return variants;
  }

  const legacySize = BOX_SIZE_OPTIONS.find(size => String(box?.size || '').toLowerCase().includes(size)) || 'small';
  variants[legacySize] = { price: box?.price ?? '', capacity: box?.capacity ?? '' };
  return variants;
};

const configuredBoxVariants = (box) => {
  if (Array.isArray(box?.sizeVariants) && box.sizeVariants.length > 0) return box.sizeVariants;
  return box ? [{ size: box.size || 'small', price: box.price, capacity: box.capacity }] : [];
};

const getBoxImages = (box) => {
  if (Array.isArray(box?.images) && box.images.length > 0) {
    return box.images.filter(Boolean);
  }

  return box?.image ? [box.image] : [];
};

const BoxesAndCards = () => {
  const [boxes, setBoxes] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boxes'); // 'boxes' or 'cards'
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingBoxId, setDeletingBoxId] = useState(null);
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [togglingBoxId, setTogglingBoxId] = useState(null);
  const [togglingCardId, setTogglingCardId] = useState(null);

  const [boxFormData, setBoxFormData] = useState({
    name: '',
    sizeVariants: emptySizeVariants(),
    imageFiles: [],
    existingImages: [],
    color: '#F5DEB3',
    description: ''
  });

  const [cardFormData, setCardFormData] = useState({
    name: '',
    design: '',
    imageFile: null,
    color: '#F5F5F5',
    description: ''
  });

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchData();
  }, []);

  const boxPagination = usePagination(boxes, 8);
  const cardPagination = usePagination(cards, 8);

  const fetchData = async () => {
    try {
      const [boxesRes, cardsRes] = await Promise.all([
        fetchBoxes(),
        fetchCards()
      ]);
      setBoxes(boxesRes.data);
      setCards(cardsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load boxes and cards');
    } finally {
      setLoading(false);
    }
  };

  const handleBoxInputChange = (e) => {
    const { name, value } = e.target;
    setBoxFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBoxVariantChange = (size, field, value) => {
    setBoxFormData(prev => ({
      ...prev,
      sizeVariants: {
        ...prev.sizeVariants,
        [size]: { ...prev.sizeVariants[size], [field]: value },
      },
    }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardFormData(prev => ({ ...prev, [name]: value }));
  };

  const buildBoxFormDataPayload = () => {
    const payload = new FormData();
    payload.append('name', boxFormData.name);
    const sizeVariants = BOX_SIZE_OPTIONS.map(size => ({
      size,
      price: Number(boxFormData.sizeVariants[size].price),
      capacity: Number(boxFormData.sizeVariants[size].capacity),
    }));
    payload.append('sizeVariants', JSON.stringify(sizeVariants));
    payload.append('size', 'Small');
    payload.append('price', String(sizeVariants[0].price));
    payload.append('capacity', String(sizeVariants[0].capacity));
    payload.append('color', boxFormData.color || '');
    payload.append('description', boxFormData.description || '');

    payload.append('retainedImages', JSON.stringify(boxFormData.existingImages));
    boxFormData.imageFiles.forEach((file) => payload.append('images', file));

    return payload;
  };

  const buildCardFormDataPayload = () => {
    const payload = new FormData();
    payload.append('name', cardFormData.name);
    payload.append('design', cardFormData.design);
    payload.append('color', cardFormData.color || '');
    payload.append('description', cardFormData.description || '');

    if (cardFormData.imageFile) {
      payload.append('image', cardFormData.imageFile);
    }

    return payload;
  };

  const handleBoxSubmit = async (e) => {
    e.preventDefault();

    if (boxFormData.existingImages.length + boxFormData.imageFiles.length === 0) {
      toast.error('Please select at least one image file.');
      return;
    }

    if (boxFormData.existingImages.length + boxFormData.imageFiles.length > MAX_BOX_IMAGES) {
      toast.error(`You can upload up to ${MAX_BOX_IMAGES} images per box.`);
      return;
    }

    const invalidVariant = BOX_SIZE_OPTIONS.some((size) => {
      const variant = boxFormData.sizeVariants[size];
      return variant.price === '' || Number(variant.price) < 0 || !Number.isInteger(Number(variant.capacity)) || Number(variant.capacity) < 1;
    });
    if (invalidVariant) {
      toast.error('Enter a valid price and capacity for Small, Medium, and Large.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildBoxFormDataPayload();

      if (editingItem) {
        await updateBox(editingItem.id, payload);
        toast.success('Box updated successfully!');
      } else {
        await createBox(payload);
        toast.success('Box created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving box:', error);
      toast.error('Failed to save box');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();

    if (!editingItem && !cardFormData.imageFile) {
      toast.error('Please select an image file.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildCardFormDataPayload();

      if (editingItem) {
        await updateCard(editingItem.id, payload);
        toast.success('Card updated successfully!');
      } else {
        await createCard(payload);
        toast.success('Card created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBox = (box) => {
    setEditingItem(box);
    setBoxFormData({
      name: box.name,
      sizeVariants: getBoxSizeVariants(box),
      imageFiles: [],
      existingImages: getBoxImages(box),
      color: box.color || '#F5DEB3',
      description: box.description || ''
    });
    setActiveTab('boxes');
    setShowForm(true);
  };

  const handleEditCard = (card) => {
    setEditingItem(card);
    setCardFormData({
      name: card.name,
      design: card.design,
      imageFile: null,
      color: card.color || '#F5F5F5',
      description: card.description || ''
    });
    setActiveTab('cards');
    setShowForm(true);
  };

  const handleDeleteBox = async (id, name) => {
    const ok = await confirm({ title: 'Delete box?', message: `This will permanently remove "${name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;

    setDeletingBoxId(id);
    try {
      await deleteBox(id);
      toast.success('Box deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting box:', error);
      toast.error('Failed to delete box');
    } finally {
      setDeletingBoxId(null);
    }
  };

  const handleDeleteCard = async (id, name) => {
    const ok = await confirm({ title: 'Delete card?', message: `This will permanently remove "${name}".`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;

    setDeletingCardId(id);
    try {
      await deleteCard(id);
      toast.success('Card deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    } finally {
      setDeletingCardId(null);
    }
  };

  const toggleBoxStock = async (id) => {
    setTogglingBoxId(id);
    try {
      await toggleBoxStockApi(id);
      await fetchData();
    } catch (error) {
      console.error('Error toggling box stock:', error);
      toast.error('Failed to toggle stock status');
    } finally {
      setTogglingBoxId(null);
    }
  };

  const toggleCardStock = async (id) => {
    setTogglingCardId(id);
    try {
      await toggleCardStockApi(id);
      await fetchData();
    } catch (error) {
      console.error('Error toggling card stock:', error);
      toast.error('Failed to toggle stock status');
    } finally {
      setTogglingCardId(null);
    }
  };

  const resetForm = () => {
    setBoxFormData({ name: '', sizeVariants: emptySizeVariants(), imageFiles: [], existingImages: [], color: '#F5DEB3', description: '' });
    setCardFormData({ name: '', design: '', imageFile: null, color: '#F5F5F5', description: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Boxes & Cards"
        description="Gift box and greeting card options for the build-a-box flow."
        actions={
          <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : `Add New ${activeTab === 'boxes' ? 'Box' : 'Card'}`}
          </Button>
        }
      />

      <div className="tab-bar">
        <button type="button" className={`tab-btn ${activeTab === 'boxes' ? 'active' : ''}`} onClick={() => setActiveTab('boxes')}>
          Boxes ({boxes.length})
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
          Cards ({cards.length})
        </button>
      </div>

      {showForm && activeTab === 'boxes' && (
        <Card className="form-section">
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
            {editingItem ? 'Edit Box' : 'Add New Box'}
          </h2>
          <form onSubmit={handleBoxSubmit}>
            <div className="field-row">
              <Input label="Name" required name="name" value={boxFormData.name} onChange={handleBoxInputChange} />
              <div className="field">
                <span className="field-label">Color</span>
                <input type="color" name="color" className="input input-color" value={boxFormData.color} onChange={handleBoxInputChange} />
              </div>
            </div>
            <fieldset className="box-size-variants">
              <legend>Size options</legend>
              <p>Set a separate price and item capacity for each size.</p>
              <div className="box-size-variant-grid">
                {BOX_SIZE_OPTIONS.map(size => (
                  <div className="box-size-variant" key={size}>
                    <h3>{size}</h3>
                    <Input
                      label="Price"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={boxFormData.sizeVariants[size].price}
                      onChange={(event) => handleBoxVariantChange(size, 'price', event.target.value)}
                    />
                    <Input
                      label="Capacity"
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={boxFormData.sizeVariants[size].capacity}
                      onChange={(event) => handleBoxVariantChange(size, 'capacity', event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
            <div className="field-row box-media-row">
              <ImageDropzone
                label="Images"
                required={!editingItem}
                multiple
                maxFiles={Math.max(0, MAX_BOX_IMAGES - boxFormData.existingImages.length)}
                files={boxFormData.imageFiles}
                onFilesChange={(files) => setBoxFormData(prev => ({ ...prev, imageFiles: files }))}
                existingImages={boxFormData.existingImages}
                onRemoveExisting={(_, index) => setBoxFormData(prev => ({
                  ...prev,
                  existingImages: prev.existingImages.filter((__, imageIndex) => imageIndex !== index),
                }))}
                disabled={boxFormData.existingImages.length >= MAX_BOX_IMAGES}
                help={boxFormData.existingImages.length >= MAX_BOX_IMAGES
                  ? 'Remove an existing image before adding another.'
                  : `Upload up to ${MAX_BOX_IMAGES} images per gift box.`}
              />
            </div>
            <Textarea label="Description" name="description" rows="3" value={boxFormData.description} onChange={handleBoxInputChange} />
            <div className="form-actions">
              <Button type="submit" loading={submitting}>{editingItem ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {showForm && activeTab === 'cards' && (
        <Card className="form-section">
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
            {editingItem ? 'Edit Card' : 'Add New Card'}
          </h2>
          <form onSubmit={handleCardSubmit}>
            <div className="field-row">
              <Input label="Name" required name="name" value={cardFormData.name} onChange={handleCardInputChange} />
              <Input label="Design" required placeholder="e.g., Happy Birthday, Thank You" name="design" value={cardFormData.design} onChange={handleCardInputChange} />
            </div>
            <div className="field-row">
              <ImageDropzone
                label="Image"
                required={!editingItem}
                files={cardFormData.imageFile ? [cardFormData.imageFile] : []}
                onFilesChange={(files) => setCardFormData(prev => ({ ...prev, imageFile: files[0] || null }))}
                existingImages={!cardFormData.imageFile && editingItem?.image ? [editingItem.image] : []}
              />
              <div className="field">
                <span className="field-label">Color</span>
                <input type="color" name="color" className="input input-color" value={cardFormData.color} onChange={handleCardInputChange} />
              </div>
            </div>
            <Textarea label="Description" name="description" rows="3" value={cardFormData.description} onChange={handleCardInputChange} />
            <div className="form-actions">
              <Button type="submit" loading={submitting}>{editingItem ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="dt-wrap">
          <div className="dt-scroll">
            <table className="dt-table">
              <tbody>
                <TableSkeleton rows={6} columns={6} />
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'boxes' ? (
        boxes.length === 0 ? (
          <EmptyState icon="bi-gift" title="No boxes found" description="Boxes you add will appear here." />
        ) : (
          <>
            <div className="dt-wrap">
              <div className="dt-scroll">
                <table className="dt-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Capacity</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boxPagination.pageItems.map((box) => (
                      <tr key={box.id}>
                        <td data-label="Image">
                          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: box.color, overflow: 'hidden' }}>
                            <img src={getBoxImages(box)[0]} alt={box.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </td>
                        <td data-label="Name">{box.name}</td>
                        <td data-label="Size">{configuredBoxVariants(box).map(variant => String(variant.size).replace(/^./, char => char.toUpperCase())).join(', ')}</td>
                        <td data-label="Capacity">{configuredBoxVariants(box).map(variant => `${String(variant.size).slice(0, 1).toUpperCase()}: ${variant.capacity}`).join(' · ')}</td>
                        <td data-label="Price">From ${Math.min(...configuredBoxVariants(box).map(variant => Number(variant.price) || 0)).toFixed(2)}</td>
                        <td data-label="Status">
                          <Badge variant={box.inStock ? 'success' : 'danger'}>{box.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
                        </td>
                        <td className="col-actions" data-label="Actions">
                          <div className="dt-action-group">
                            <Button variant="secondary" size="sm" onClick={() => handleEditBox(box)}>Edit</Button>
                            <Button variant="secondary" size="sm" loading={togglingBoxId === box.id} onClick={() => toggleBoxStock(box.id)}>Toggle</Button>
                            <Button variant="danger-ghost" size="sm" loading={deletingBoxId === box.id} onClick={() => handleDeleteBox(box.id, box.name)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              page={boxPagination.page}
              totalPages={boxPagination.totalPages}
              onPageChange={boxPagination.setPage}
              totalItems={boxes.length}
              pageSize={8}
            />
          </>
        )
      ) : cards.length === 0 ? (
        <EmptyState icon="bi-postcard" title="No cards found" description="Greeting cards you add will appear here." />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Design</th>
                    <th>Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cardPagination.pageItems.map((card) => (
                    <tr key={card.id}>
                      <td data-label="Image">
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: card.color, overflow: 'hidden' }}>
                          <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td data-label="Name">{card.name}</td>
                      <td data-label="Design">{card.design}</td>
                      <td data-label="Status">
                        <Badge variant={card.inStock ? 'success' : 'danger'}>{card.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
                      </td>
                      <td className="col-actions" data-label="Actions">
                        <div className="dt-action-group">
                          <Button variant="secondary" size="sm" onClick={() => handleEditCard(card)}>Edit</Button>
                          <Button variant="secondary" size="sm" loading={togglingCardId === card.id} onClick={() => toggleCardStock(card.id)}>Toggle</Button>
                          <Button variant="danger-ghost" size="sm" loading={deletingCardId === card.id} onClick={() => handleDeleteCard(card.id, card.name)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={cardPagination.page}
            totalPages={cardPagination.totalPages}
            onPageChange={cardPagination.setPage}
            totalItems={cards.length}
            pageSize={8}
          />
        </>
      )}
    </div>
  );
};

export default BoxesAndCards;
