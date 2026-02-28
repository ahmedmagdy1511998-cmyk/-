import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const categories = [
  'مواد تعبئة',
  'مواد تنظيف',
  'أدوات جراحية',
  'مواد تخدير',
  'مواد تقويم',
  'قفازات ومستهلكات',
  'معدات',
  'أخرى'
];

const units = ['قطعة', 'علبة', 'زجاجة', 'أنبوب', 'كرتونة', 'حقنة', 'لفة'];

export const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'high' | 'normal'>('all');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 100,
    unit: 'قطعة',
    price: 0,
    supplier: ''
  });

  // حساب التنبيهات
  const alerts = useMemo(() => {
    const lowStock = inventory.filter(item => item.quantity <= item.minQuantity);
    const highStock = inventory.filter(item => item.quantity >= item.maxQuantity);
    return { lowStock, highStock };
  }, [inventory]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'low') matchesStatus = item.quantity <= item.minQuantity;
    else if (filterStatus === 'high') matchesStatus = item.quantity >= item.maxQuantity;
    else if (filterStatus === 'normal') matchesStatus = item.quantity > item.minQuantity && item.quantity < item.maxQuantity;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (item: InventoryItem) => {
    if (item.quantity <= item.minQuantity) return 'bg-red-100 text-red-700 border-red-300';
    if (item.quantity >= item.maxQuantity) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getStatusText = (item: InventoryItem) => {
    if (item.quantity <= item.minQuantity) return '⚠️ نقص';
    if (item.quantity >= item.maxQuantity) return '📦 زيادة';
    return '✓ طبيعي';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      setInventory(inventory.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, lastUpdated: new Date().toISOString() }
          : item
      ));
      setEditingItem(null);
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString()
      };
      setInventory([...inventory, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 100,
      unit: 'قطعة',
      price: 0,
      supplier: ''
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      unit: item.unit,
      price: item.price,
      supplier: item.supplier
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + change), lastUpdated: new Date().toISOString() }
        : item
    ));
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📦 إدارة المخزن</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <span>➕</span>
          إضافة صنف
        </button>
      </div>

      {/* التنبيهات */}
      {(alerts.lowStock.length > 0 || alerts.highStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                تنبيه: مواد تحتاج إعادة طلب ({alerts.lowStock.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-red-600 font-bold">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.highStock.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">📦</span>
                تنبيه: مواد تجاوزت الحد الأقصى ({alerts.highStock.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.highStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-yellow-600 font-bold">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-blue-600">{inventory.length}</div>
          <div className="text-sm text-gray-600">إجمالي الأصناف</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600">{totalValue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">قيمة المخزون (ج.م)</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-red-600">{alerts.lowStock.length}</div>
          <div className="text-sm text-gray-600">أصناف ناقصة</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-yellow-600">{alerts.highStock.length}</div>
          <div className="text-sm text-gray-600">أصناف زائدة</div>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white p-4 rounded-t-xl">
              <h3 className="text-xl font-bold">
                {editingItem ? '✏️ تعديل صنف' : '➕ إضافة صنف جديد'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصنف *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="مثال: قفازات طبية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية الحالية *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الوحدة (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="اسم المورد"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium"
                >
                  ✓ {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  ✕ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 بحث بالاسم أو المورد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="min-w-[150px]">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="low">⚠️ نقص</option>
              <option value="high">📦 زيادة</option>
              <option value="normal">✓ طبيعي</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول المخزون */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-l from-teal-600 to-teal-700 text-white">
              <tr>
                <th className="p-4 text-right">الصنف</th>
                <th className="p-4 text-center">الفئة</th>
                <th className="p-4 text-center">الكمية</th>
                <th className="p-4 text-center">الحد الأدنى/الأقصى</th>
                <th className="p-4 text-center">الحالة</th>
                <th className="p-4 text-center">السعر</th>
                <th className="p-4 text-center">تعديل الكمية</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    <span className="text-5xl block mb-3">📦</span>
                    لا توجد أصناف
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{item.name}</div>
                      {item.supplier && <div className="text-sm text-gray-500">المورد: {item.supplier}</div>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-lg text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-lg">
                      {item.quantity} <span className="text-sm text-gray-500">{item.unit}</span>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500">
                      {item.minQuantity} / {item.maxQuantity}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item)}`}>
                        {getStatusText(item)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {item.price.toLocaleString()} ج.م
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
