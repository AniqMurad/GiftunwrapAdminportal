import React, { useState, useEffect } from 'react';
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

const BoxesAndCards = () => {
  const [boxes, setBoxes] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boxes'); // 'boxes' or 'cards'
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boxesRes, cardsRes] = await Promise.all([
        fetchBoxes(),
        fetchCards()
      ]);
      setBoxes(boxesRes.data);
      setCards(cardsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleBoxInputChange = (e) => {
    const { name, value, files, type } = e.target;
    setBoxFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] || null) : value,
    }));
  };

  const handleCardInputChange = (e) => {
    const { name, value, files, type } = e.target;
    setCardFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] || null) : value,
    }));
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

    try {
      const payload = buildBoxFormDataPayload();

      if (editingItem) {
        await updateBox(editingItem.id, payload);
        alert('Box updated successfully!');
      } else {
        if (!boxFormData.imageFile) {
          alert('Please select an image file.');
          return;
        }

        await createBox(payload);
        alert('Box created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving box:', error);
      alert('Failed to save box');
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = buildCardFormDataPayload();

      if (editingItem) {
        await updateCard(editingItem.id, payload);
        alert('Card updated successfully!');
      } else {
        if (!cardFormData.imageFile) {
          alert('Please select an image file.');
          return;
        }

        await createCard(payload);
        alert('Card created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card');
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

  const handleDeleteBox = async (id) => {
    if (window.confirm('Are you sure you want to delete this box?')) {
      try {
        await deleteBox(id);
        alert('Box deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting box:', error);
        alert('Failed to delete box');
      }
    }
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(id);
        alert('Card deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('Failed to delete card');
      }
    }
  };

  const toggleBoxStock = async (id) => {
    try {
      await toggleBoxStockApi(id);
      fetchData();
    } catch (error) {
      console.error('Error toggling box stock:', error);
      alert('Failed to toggle stock status');
    }
  };

  const toggleCardStock = async (id) => {
    try {
      await toggleCardStockApi(id);
      fetchData();
    } catch (error) {
      console.error('Error toggling card stock:', error);
      alert('Failed to toggle stock status');
    }
  };

  const resetForm = () => {
    setBoxFormData({
      name: '',
      size: '',
      price: '',
      capacity: '',
      imageFile: null,
      color: '#F5DEB3',
      description: ''
    });
    setCardFormData({
      name: '',
      design: '',
      imageFile: null,
      color: '#F5F5F5',
      description: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="tw-scope p-8">Loading...</div>;
  }

  return (
    <div className="tw-scope p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Boxes & Cards</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : `Add New ${activeTab === 'boxes' ? 'Box' : 'Card'}`}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('boxes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boxes'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Boxes ({boxes.length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cards'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cards ({cards.length})
          </button>
        </div>
      </div>

      {/* Box Form */}
      {showForm && activeTab === 'boxes' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Box' : 'Add New Box'}
          </h2>
          <form onSubmit={handleBoxSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={boxFormData.name}
                  onChange={handleBoxInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size *</label>
                <input
                  type="text"
                  name="size"
                  value={boxFormData.size}
                  onChange={handleBoxInputChange}
                  required
                  placeholder="e.g., 15cm x 15cm x 10cm"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={boxFormData.price}
                  onChange={handleBoxInputChange}
                  required
                  step="0.01"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity *</label>
                <input
                  type="text"
                  name="capacity"
                  value={boxFormData.capacity}
                  onChange={handleBoxInputChange}
                  required
                  placeholder="e.g., 3-5 items"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image {editingItem ? '(optional)' : '*'}
                </label>
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleBoxInputChange}
                  required={!editingItem}
                  accept="image/*"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                {editingItem && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Current image:</span>
                    <img
                      src={editingItem.image}
                      alt={editingItem.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  name="color"
                  value={boxFormData.color}
                  onChange={handleBoxInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black h-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={boxFormData.description}
                onChange={handleBoxInputChange}
                rows="3"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Form */}
      {showForm && activeTab === 'cards' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Card' : 'Add New Card'}
          </h2>
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={cardFormData.name}
                  onChange={handleCardInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Design *</label>
                <input
                  type="text"
                  name="design"
                  value={cardFormData.design}
                  onChange={handleCardInputChange}
                  required
                  placeholder="e.g., Happy Birthday, Thank You"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image {editingItem ? '(optional)' : '*'}
                </label>
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleCardInputChange}
                  required={!editingItem}
                  accept="image/*"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                {editingItem && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Current image:</span>
                    <img
                      src={editingItem.image}
                      alt={editingItem.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  name="color"
                  value={cardFormData.color}
                  onChange={handleCardInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black h-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={cardFormData.description}
                onChange={handleCardInputChange}
                rows="3"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Boxes Table */}
      {activeTab === 'boxes' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boxes.map((box) => (
                <tr key={box.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 rounded" style={{ backgroundColor: box.color }}>
                      <img src={box.image} alt={box.name} className="h-full w-full object-cover rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{box.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{box.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{box.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${box.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      box.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {box.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditBox(box)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleBoxStock(box.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteBox(box.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards Table */}
      {activeTab === 'cards' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Design
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cards.map((card) => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 rounded" style={{ backgroundColor: card.color }}>
                      <img src={card.image} alt={card.name} className="h-full w-full object-cover rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{card.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{card.design}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      card.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {card.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleCardStock(card.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BoxesAndCards;
