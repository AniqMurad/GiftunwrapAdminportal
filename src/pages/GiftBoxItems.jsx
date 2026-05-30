import React, { useState, useEffect } from 'react';
import {
  fetchGiftBoxItems,
  createGiftBoxItem,
  updateGiftBoxItem,
  deleteGiftBoxItem,
  toggleGiftBoxItemStock,
} from '../api';

const GiftBoxItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'chocolates-snacks',
    imageFile: null,
    description: '',
    colorVariants: []
  });

  const categories = [
    'chocolates-snacks',
    'flowers',
    'customised-items',
    'jewellery-accessories',
    'fragrances',
    'clothing',
    'shoes',
    'beauty-personal-care'
  ];

  const categoryLabels = {
    'chocolates-snacks': 'Chocolates & Snacks',
    'flowers': 'Flowers',
    'customised-items': 'Customised Items',
    'jewellery-accessories': 'Jewellery & Accessories',
    'fragrances': 'Fragrances',
    'clothing': 'Clothing',
    'shoes': 'Shoes',
    'beauty-personal-care': 'Beauty & Personal Care'
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetchGiftBoxItems();
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] || null) : value
    }));
  };

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { color: '', imageFile: null }]
    }));
  };

  const removeColorVariant = (idx) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== idx)
    }));
  };

  const handleColorVariantChange = (idx, field, value) => {
    setFormData(prev => {
      const variants = [...prev.colorVariants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...prev, colorVariants: variants };
    });
  };

  const buildMultipartFormData = () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('price', formData.price);
    payload.append('category', formData.category);
    payload.append('description', formData.description || '');

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    const colorVariantsMeta = formData.colorVariants.map(v => ({ color: v.color }));
    payload.append('colorVariants', JSON.stringify(colorVariantsMeta));

    formData.colorVariants.forEach((variant, idx) => {
      if (variant.imageFile) {
        payload.append(`colorImage_${idx}`, variant.imageFile);
      }
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = buildMultipartFormData();

      if (editingItem) {
        await updateGiftBoxItem(editingItem.id, payload);
        alert('Item updated successfully!');
      } else {
        if (!formData.imageFile) {
          alert('Please select an image file.');
          return;
        }

        await createGiftBoxItem(payload);
        alert('Item created successfully!');
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      imageFile: null,
      description: item.description || '',
      colorVariants: (item.colorVariants || []).map(v => ({
        color: v.color,
        existingImage: v.image,
        imageFile: null
      }))
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteGiftBoxItem(id);
        alert('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const toggleStock = async (id) => {
    try {
      await toggleGiftBoxItemStock(id);
      fetchItems();
    } catch (error) {
      console.error('Error toggling stock:', error);
      alert('Failed to toggle stock status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'chocolates-snacks',
      imageFile: null,
      description: '',
      colorVariants: []
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gift Box Items</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image {editingItem ? '(optional)' : '*'}
                </label>
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleInputChange}
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Color Variants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Color Variants (optional)</label>
                <button
                  type="button"
                  onClick={addColorVariant}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium"
                >
                  + Add Color
                </button>
              </div>
              <div className="space-y-3">
                {formData.colorVariants.map((variant, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Color {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeColorVariant(idx)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color Name *</label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => handleColorVariantChange(idx, 'color', e.target.value)}
                          placeholder="e.g. Red, Blue, Black…"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Image {variant.existingImage ? '(upload to replace)' : '*'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorVariantChange(idx, 'imageFile', e.target.files?.[0] || null)}
                          className="w-full border border-gray-300 px-3 py-1.5 rounded-lg text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
                        />
                        {variant.existingImage && !variant.imageFile && (
                          <div className="mt-1 flex items-center gap-2">
                            <img src={variant.existingImage} alt={variant.color} className="h-8 w-10 object-cover rounded border" />
                            <span className="text-xs text-gray-400">Current</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                Category
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
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={item.image} alt={item.name} style={{width: '60px', height: '60px'}} className="h-10 w-10 object-cover rounded" />
                  {item.colorVariants?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.colorVariants.map((v, i) => (
                        <img
                          key={i}
                          src={v.image}
                          alt={v.color}
                          title={v.color}
                          style={{ width: '50px', height: '50px' }}
                          className="h-6 w-6 object-cover rounded-full border border-gray-300"
                        />
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{categoryLabels[item.category] || item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">PKR {item.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStock(item.id)}
                    className="text-yellow-600 hover:text-yellow-900 mr-4"
                  >
                    Toggle Stock
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default GiftBoxItems;
