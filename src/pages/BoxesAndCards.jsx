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
} from '../components/ui';

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
    size: '',
    price: '',
    capacity: '',
    imageFile: null,
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

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardFormData(prev => ({ ...prev, [name]: value }));
  };

  const buildBoxFormDataPayload = () => {
    const payload = new FormData();
    payload.append('name', boxFormData.name);
    payload.append('size', boxFormData.size);
    payload.append('price', boxFormData.price);
    payload.append('capacity', boxFormData.capacity);
    payload.append('color', boxFormData.color || '');
    payload.append('description', boxFormData.description || '');

    if (boxFormData.imageFile) {
      payload.append('image', boxFormData.imageFile);
    }

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

    if (!editingItem && !boxFormData.imageFile) {
      toast.error('Please select an image file.');
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
      size: box.size,
      price: box.price,
      capacity: box.capacity,
      imageFile: null,
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
    setBoxFormData({ name: '', size: '', price: '', capacity: '', imageFile: null, color: '#F5DEB3', description: '' });
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
              <Input label="Size" required placeholder="e.g., 15cm x 15cm x 10cm" name="size" value={boxFormData.size} onChange={handleBoxInputChange} />
            </div>
            <div className="field-row">
              <Input label="Price" type="number" required step="0.01" name="price" value={boxFormData.price} onChange={handleBoxInputChange} />
              <Input label="Capacity" required placeholder="e.g., 3-5 items" name="capacity" value={boxFormData.capacity} onChange={handleBoxInputChange} />
            </div>
            <div className="field-row">
              <ImageDropzone
                label="Image"
                required={!editingItem}
                files={boxFormData.imageFile ? [boxFormData.imageFile] : []}
                onFilesChange={(files) => setBoxFormData(prev => ({ ...prev, imageFile: files[0] || null }))}
                existingImages={!boxFormData.imageFile && editingItem?.image ? [editingItem.image] : []}
              />
              <div className="field">
                <span className="field-label">Color</span>
                <input type="color" name="color" className="input input-color" value={boxFormData.color} onChange={handleBoxInputChange} />
              </div>
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
                            <img src={box.image} alt={box.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </td>
                        <td data-label="Name">{box.name}</td>
                        <td data-label="Size">{box.size}</td>
                        <td data-label="Capacity">{box.capacity}</td>
                        <td data-label="Price">${box.price.toFixed(2)}</td>
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
