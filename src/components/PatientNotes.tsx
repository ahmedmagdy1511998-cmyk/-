import React, { useState } from 'react';
import { Patient, PatientNote } from '../types';

interface PatientNotesProps {
  patients: Patient[];
  notes: PatientNote[];
  setNotes: React.Dispatch<React.SetStateAction<PatientNote[]>>;
}

export const PatientNotes: React.FC<PatientNotesProps> = ({ patients, notes, setNotes }) => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const patientNotes = notes.filter(n => n.patientId === selectedPatient).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAddNote = () => {
    if (!selectedPatient || !newNote.trim()) return;

    const note: PatientNote = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      note: newNote.trim(),
      createdAt: new Date().toISOString(),
      createdBy: 'المستخدم'
    };

    setNotes([...notes, note]);
    setNewNote('');
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;

    setNotes(notes.map(n =>
      n.id === editingNote.id ? { ...editingNote } : n
    ));
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      setNotes(notes.filter(n => n.id !== noteId));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📝 ملاحظات المرضى</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المرضى */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-700">اختر المريض</h3>

          <input
            type="text"
            placeholder="🔍 بحث عن مريض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-teal-500"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPatients.map(patient => {
              const noteCount = notes.filter(n => n.patientId === patient.id).length;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedPatient === patient.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{patient.gender === 'male' ? '👨' : '👩'}</span>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className={`text-sm ${selectedPatient === patient.id ? 'text-teal-100' : 'text-gray-500'}`}>
                          {patient.phone}
                        </p>
                      </div>
                    </div>
                    {noteCount > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedPatient === patient.id
                          ? 'bg-white text-teal-600'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {noteCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* الملاحظات */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {selectedPatientData ? (
            <div>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl">
                  {selectedPatientData.gender === 'male' ? '👨' : '👩'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedPatientData.name}</h3>
                  <p className="text-gray-500">{selectedPatientData.phone}</p>
                </div>
              </div>

              {/* إضافة ملاحظة جديدة */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✏️ إضافة ملاحظة جديدة
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="mt-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  ➕ إضافة الملاحظة
                </button>
              </div>

              {/* قائمة الملاحظات */}
              <div>
                <h4 className="font-bold text-gray-700 mb-4">📋 الملاحظات السابقة ({patientNotes.length})</h4>

                {patientNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl block mb-2">📝</span>
                    لا توجد ملاحظات لهذا المريض
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {patientNotes.map(note => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-4 border-r-4 border-teal-500">
                        {editingNote?.id === note.id ? (
                          <div>
                            <textarea
                              value={editingNote.note}
                              onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleUpdateNote}
                                className="bg-teal-600 text-white px-4 py-1 rounded-lg hover:bg-teal-700 text-sm"
                              >
                                ✓ حفظ
                              </button>
                              <button
                                onClick={() => setEditingNote(null)}
                                className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-400 text-sm"
                              >
                                ✕ إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                <span>🕐 {formatDate(note.createdAt)}</span>
                                <span className="mx-2">|</span>
                                <span>👤 {note.createdBy}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingNote(note)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  ✏️ تعديل
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  🗑️ حذف
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <span className="text-6xl block mb-4">👈</span>
              <p className="text-lg">اختر مريضاً من القائمة لعرض وإضافة الملاحظات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
