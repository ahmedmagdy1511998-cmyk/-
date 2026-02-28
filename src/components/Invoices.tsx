import React, { useState, useRef } from 'react';
import { Invoice, Patient, CenterSettings } from '../types';

interface InvoicesProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  patients: Patient[];
  centerSettings: CenterSettings;
}

export const Invoices: React.FC<InvoicesProps> = ({ invoices, setInvoices, patients, centerSettings }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    treatments: [{ name: '', cost: '' }],
  });

  const resetForm = () => {
    setFormData({
      patientId: '',
      treatments: [{ name: '', cost: '' }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const treatmentsList = formData.treatments.filter(t => t.name && t.cost);
    const total = treatmentsList.reduce((sum, t) => sum + parseFloat(t.cost), 0);
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: patient?.name || '',
      treatments: treatmentsList.map(t => ({ name: t.name, cost: parseFloat(t.cost) })),
      totalAmount: total,
      paidAmount: 0,
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setInvoices([...invoices, newInvoice]);
    setShowModal(false);
    resetForm();
  };

  const handleAddTreatment = () => {
    setFormData({
      ...formData,
      treatments: [...formData.treatments, { name: '', cost: '' }],
    });
  };

  const handleRemoveTreatment = (index: number) => {
    setFormData({
      ...formData,
      treatments: formData.treatments.filter((_, i) => i !== index),
    });
  };

  const handleTreatmentChange = (index: number, field: 'name' | 'cost', value: string) => {
    const updated = [...formData.treatments];
    updated[index][field] = value;
    setFormData({ ...formData, treatments: updated });
  };

  const handlePayment = () => {
    if (!selectedInvoice || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    const newPaidAmount = selectedInvoice.paidAmount + amount;
    const newStatus = newPaidAmount >= selectedInvoice.totalAmount ? 'paid' : 'partial';
    
    setInvoices(invoices.map(inv =>
      inv.id === selectedInvoice.id
        ? { ...inv, paidAmount: newPaidAmount, status: newStatus }
        : inv
    ));
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintModal(true);
  };

  const printInvoice = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - مركز الأسنان</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
          }
          .invoice-container {
            max-width: 700px;
            margin: 0 auto;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p {
            opacity: 0.9;
            font-size: 14px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-info div {
            text-align: center;
          }
          .invoice-info label {
            display: block;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 4px;
          }
          .invoice-info span {
            font-weight: bold;
            color: #1f2937;
          }
          .patient-info {
            padding: 25px 30px;
            border-bottom: 1px solid #e5e7eb;
          }
          .patient-info h3 {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .patient-info p {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
          }
          .services {
            padding: 25px 30px;
          }
          .services h3 {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 15px;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
          }
          .services-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: right;
            font-size: 13px;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
          }
          .services-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #f3f4f6;
          }
          .services-table tr:last-child td {
            border-bottom: none;
          }
          .totals {
            padding: 25px 30px;
            background: #f9fafb;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
          }
          .total-row.main {
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 10px;
            font-size: 20px;
            font-weight: bold;
            color: #ec4899;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
          }
          .status-paid {
            background: #d1fae5;
            color: #059669;
          }
          .status-partial {
            background: #fef3c7;
            color: #d97706;
          }
          .status-unpaid {
            background: #fee2e2;
            color: #dc2626;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.patientName.includes(searchTerm)
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'partial': return 'جزئي';
      case 'unpaid': return 'غير مدفوعة';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'unpaid': return 'status-unpaid';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-rose-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-white/20 p-3 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
              </span>
              الفواتير والمدفوعات
            </h1>
            <p className="text-rose-100 mt-2">
              الإيرادات: {totalRevenue.toLocaleString()} جنيه | المستحقات: {totalPending.toLocaleString()} جنيه
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-white text-rose-600 px-6 py-3 rounded-2xl font-bold hover:bg-rose-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إنشاء فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="relative">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="البحث باسم المريض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
            <div className={`p-4 text-white ${
              invoice.status === 'paid' ? 'bg-gradient-to-l from-green-500 to-emerald-400' :
              invoice.status === 'partial' ? 'bg-gradient-to-l from-yellow-500 to-amber-400' :
              'bg-gradient-to-l from-red-500 to-rose-400'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">فاتورة #{invoice.id.slice(-6)}</p>
                  <p className="text-xl font-bold">{invoice.totalAmount.toLocaleString()} جنيه</p>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {getStatusText(invoice.status)}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 font-bold">
                  {invoice.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{invoice.patientName}</p>
                  <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {invoice.treatments.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{t.name}</span>
                    <span className="font-medium">{t.cost.toLocaleString()} جنيه</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">المدفوع</p>
                  <p className="font-bold text-green-600">{invoice.paidAmount.toLocaleString()} جنيه</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">المتبقي</p>
                  <p className="font-bold text-red-600">{(invoice.totalAmount - invoice.paidAmount).toLocaleString()} جنيه</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {invoice.status !== 'paid' && (
                  <button
                    onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}
                    className="flex-1 bg-green-100 text-green-700 py-2 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    تسجيل دفعة
                  </button>
                )}
                <button
                  onClick={() => handlePrint(invoice)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  طباعة
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="p-2 bg-gray-100 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد فواتير</h3>
          <p className="text-gray-500">قم بإنشاء فاتورة جديدة</p>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-l from-rose-600 to-pink-500 p-6 text-white rounded-t-3xl">
              <h2 className="text-2xl font-bold">إنشاء فاتورة جديدة</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المريض *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all outline-none"
                  required
                >
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">الخدمات</label>
                  <button
                    type="button"
                    onClick={handleAddTreatment}
                    className="text-rose-600 text-sm font-medium hover:text-rose-700"
                  >
                    + إضافة خدمة
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.treatments.map((treatment, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="اسم الخدمة"
                        value={treatment.name}
                        onChange={(e) => handleTreatmentChange(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all outline-none"
                      />
                      <input
                        type="number"
                        placeholder="التكلفة"
                        value={treatment.cost}
                        onChange={(e) => handleTreatmentChange(index, 'cost', e.target.value)}
                        className="w-32 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white transition-all outline-none"
                      />
                      {formData.treatments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTreatment(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-rose-600">
                    {formData.treatments.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0).toLocaleString()} جنيه
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-l from-rose-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-rose-700 hover:to-pink-600 transition-all shadow-lg"
                >
                  إنشاء الفاتورة
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-l from-green-500 to-emerald-400 p-6 text-white rounded-t-3xl">
              <h2 className="text-2xl font-bold">تسجيل دفعة</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ الإجمالي:</span>
                  <span className="font-bold">{selectedInvoice.totalAmount.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المدفوع مسبقاً:</span>
                  <span className="font-bold text-green-600">{selectedInvoice.paidAmount.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">المتبقي:</span>
                  <span className="font-bold text-red-600">{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()} جنيه</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ الدفعة</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none text-lg"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-gradient-to-l from-green-500 to-emerald-400 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-500 transition-all shadow-lg"
                >
                  تأكيد الدفع
                </button>
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); setPaymentAmount(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-l from-blue-600 to-indigo-500 p-6 text-white rounded-t-3xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">معاينة الفاتورة</h2>
              <button
                onClick={() => { setShowPrintModal(false); setSelectedInvoice(null); }}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Print Content */}
            <div ref={printRef} className="p-6">
              <div className="invoice-container">
                <div className="header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '16px 16px 0 0' }}>
                  {centerSettings.logo ? (
                    <img src={centerSettings.logo} alt="شعار المركز" style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 10px', background: 'white', borderRadius: '12px', padding: '5px' }} />
                  ) : (
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🦷</span>
                  )}
                  <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>{centerSettings.centerName || 'مركز الأسنان'}</h1>
                  {centerSettings.phone && <p style={{ opacity: '0.9', fontSize: '14px', marginBottom: '3px' }}>📞 {centerSettings.phone}</p>}
                  {centerSettings.address && <p style={{ opacity: '0.9', fontSize: '14px' }}>📍 {centerSettings.address}</p>}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>رقم الفاتورة</label>
                    <span style={{ fontWeight: 'bold', color: '#1f2937' }}>#{selectedInvoice.id.slice(-6)}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>التاريخ</label>
                    <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>الحالة</label>
                    <span className={`status-badge ${getStatusClass(selectedInvoice.status)}`} style={{ padding: '5px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: selectedInvoice.status === 'paid' ? '#d1fae5' : selectedInvoice.status === 'partial' ? '#fef3c7' : '#fee2e2', color: selectedInvoice.status === 'paid' ? '#059669' : selectedInvoice.status === 'partial' ? '#d97706' : '#dc2626' }}>
                      {getStatusText(selectedInvoice.status)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '25px 30px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>بيانات المريض</h3>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{selectedInvoice.patientName}</p>
                </div>

                <div style={{ padding: '25px 30px' }}>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>الخدمات المقدمة</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#f3f4f6', padding: '12px', textAlign: 'right', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>الخدمة</th>
                        <th style={{ background: '#f3f4f6', padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>التكلفة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.treatments.map((t, i) => (
                        <tr key={i}>
                          <td style={{ padding: '15px 12px', borderBottom: '1px solid #f3f4f6' }}>{t.name}</td>
                          <td style={{ padding: '15px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'left', fontWeight: '500' }}>{t.cost.toLocaleString()} جنيه</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '25px 30px', background: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px' }}>
                    <span>الإجمالي</span>
                    <span style={{ fontWeight: 'bold' }}>{selectedInvoice.totalAmount.toLocaleString()} جنيه</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px', color: '#059669' }}>
                    <span>المدفوع</span>
                    <span style={{ fontWeight: 'bold' }}>{selectedInvoice.paidAmount.toLocaleString()} جنيه</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0 8px', fontSize: '20px', fontWeight: 'bold', color: '#ec4899', borderTop: '2px solid #e5e7eb', marginTop: '10px' }}>
                    <span>المتبقي</span>
                    <span>{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()} جنيه</span>
                  </div>
                </div>

                <div style={{ padding: '20px 30px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <p>شكراً لزيارتكم {centerSettings.centerName || 'مركز الأسنان'}</p>
                  <p style={{ marginTop: '5px' }}>نتمنى لكم دوام الصحة والعافية 🦷</p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={printInvoice}
                className="flex-1 bg-gradient-to-l from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                طباعة الفاتورة
              </button>
              <button
                onClick={() => { setShowPrintModal(false); setSelectedInvoice(null); }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
