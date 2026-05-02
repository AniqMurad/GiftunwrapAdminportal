import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    image: '',
    description: ''
  });

  const [cardFormData, setCardFormData] = useState({
    name: '',
    design: '',
    image: '',
    description: ''
  });

  const [boxImageFile, setBoxImageFile] = useState(null);
  const [cardImageFile, setCardImageFile] = useState(null);

  const BOX_API_URL = 'http://localhost:5000/api/boxes';
  const CARD_API_URL = 'http://localhost:5000/api/cards';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boxesRes, cardsRes] = await Promise.all([
        axios.get(BOX_API_URL),
        axios.get(CARD_API_URL)
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
    const { name, value } = e.target;
    setBoxFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBoxImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBoxImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setBoxFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBoxSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', boxFormData.name);
      formData.append('size', boxFormData.size);
      formData.append('price', boxFormData.price);
      formData.append('capacity', boxFormData.capacity);
      formData.append('description', boxFormData.description);
      
      if (boxImageFile) {
        formData.append('image', boxImageFile);
      } else if (boxFormData.image) {
        formData.append('imageUrl', boxFormData.image);
      }

      if (editingItem) {
        await axios.put(`${BOX_API_URL}/${editingItem.id}`, formData);
        alert('Box updated successfully!');
      } else {
        await axios.post(BOX_API_URL, formData);
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
      const formData = new FormData();
      formData.append('name', cardFormData.name);
      formData.append('design', cardFormData.design);
      formData.append('description', cardFormData.description);
      
      if (cardImageFile) {
        formData.append('image', cardImageFile);
      } else if (cardFormData.image) {
        formData.append('imageUrl', cardFormData.image);
      }

      if (editingItem) {
        await axios.put(`${CARD_API_URL}/${editingItem.id}`, formData);
        alert('Card updated successfully!');
      } else {
        await axios.post(CARD_API_URL, formData);
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
      image: box.image,
      description: box.description || ''
    });
    setBoxImageFile(null);
    setActiveTab('boxes');
    setShowForm(true);
  };

  const handleEditCard = (card) => {
    setEditingItem(card);
    setCardFormData({
      name: card.name,
      design: card.design,
      image: card.image,
      description: card.description || ''
    });
    setCardImageFile(null);
    setActiveTab('cards');
    setShowForm(true);
  };

  const handleDeleteBox = async (id) => {
    if (window.confirm('Are you sure you want to delete this box?')) {
      try {
        await axios.delete(`${BOX_API_URL}/${id}`);
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
        await axios.delete(`${CARD_API_URL}/${id}`);
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
      await axios.patch(`${BOX_API_URL}/${id}/toggle-stock`);
      fetchData();
    } catch (error) {
      console.error('Error toggling box stock:', error);
      alert('Failed to toggle stock status');
    }
  };

  const toggleCardStock = async (id) => {
    try {
      await axios.patch(`${CARD_API_URL}/${id}/toggle-stock`);
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
      image: '',
      description: ''
    });
    setCardFormData({
      name: '',
      design: '',
      image: '',
      description: ''
    });
    setBoxImageFile(null);
    setCardImageFile(null);
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleBoxImageChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                {boxFormData.image && (
                  <img src={boxFormData.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleCardImageChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                {cardFormData.image && (
                  <img src={cardFormData.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
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
                    <img src={box.image} alt={box.name} className="h-12 w-12 object-cover rounded" />
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
                    <img src={card.image} alt={card.name} className="h-12 w-12 object-cover rounded" />
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
