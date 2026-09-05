import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Edit,
  Power,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OperatorManagement() {
  const { user: currentAdmin } = useAuth();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOp, setSelectedOp] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    username: '',
    name: '',
    password: '',
    confirm_password: '',
    status: 'active',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'active',
  });
  const [resetForm, setResetForm] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch operators list
  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await api.getOperators();
      setOperators(data);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to load operators', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. ADD OPERATOR
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (addForm.password !== addForm.confirm_password) {
      setFormError('Passwords do not match.');
      return;
    }
    if (addForm.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createOperator({
        username: addForm.username.trim(),
        name: addForm.name.trim() || addForm.username.trim(),
        password: addForm.password,
        confirm_password: addForm.confirm_password,
        status: addForm.status,
      });
      showToast('Operator created successfully.', 'success');
      setShowAddModal(false);
      setAddForm({ username: '', name: '', password: '', confirm_password: '', status: 'active' });
      fetchOperators();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create operator.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. EDIT OPERATOR
  const openEditModal = (op) => {
    setSelectedOp(op);
    setEditForm({ name: op.name || op.username, status: op.status });
    setFormError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setSubmitting(true);
      await api.updateOperator(selectedOp.id, {
        name: editForm.name.trim(),
        status: editForm.status,
      });
      showToast('Operator updated successfully.', 'success');
      setShowEditModal(false);
      fetchOperators();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update operator.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. RESET PASSWORD
  const openResetModal = (op) => {
    setSelectedOp(op);
    setResetForm({ new_password: '', confirm_password: '' });
    setFormError('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (resetForm.new_password !== resetForm.confirm_password) {
      setFormError('Passwords do not match.');
      return;
    }
    if (resetForm.new_password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await api.resetOperatorPassword(selectedOp.id, {
        new_password: resetForm.new_password,
        confirm_password: resetForm.confirm_password,
      });
      showToast(`Password reset successfully for operator '${selectedOp.username}'.`, 'success');
      setShowResetModal(false);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. TOGGLE STATUS (ENABLE / DISABLE)
  const handleToggleStatus = async (op) => {
    if (op.username === 'admin') {
      showToast('Primary Administrator account cannot be disabled.', 'error');
      return;
    }
    const newStatus = op.status === 'active' ? 'disabled' : 'active';
    try {
      await api.updateOperatorStatus(op.id, newStatus);
      showToast(`Operator '${op.username}' is now ${newStatus.toUpperCase()}.`, 'success');
      fetchOperators();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update operator status', 'error');
    }
  };

  // 5. DELETE OPERATOR
  const openDeleteModal = (op) => {
    if (op.username === 'admin' || op.role === 'admin') {
      showToast('Primary Administrator account cannot be deleted.', 'error');
      return;
    }
    setSelectedOp(op);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      await api.deleteOperator(selectedOp.id);
      showToast(`Operator '${selectedOp.username}' deleted successfully.`, 'success');
      setShowDeleteModal(false);
      fetchOperators();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete operator', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 transition-all animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0B1D29] border-[#35D47A] text-[#35D47A]'
              : 'bg-[#0B1D29] border-[#FF6257] text-[#FF6257]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-[#EFFFFF]">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#102B3B]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-[#48D5FF]/10 text-[#48D5FF] flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#EFFFFF]">
              OPERATOR MANAGEMENT
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#48D5FF]/20 text-[#48D5FF] border border-[#48D5FF]/30 font-bold uppercase">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-[#89A7B7] mt-1">
            Manage authorized Polar Energy system operators, role credentials, and access statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchOperators}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] border border-[#102B3B] text-xs font-bold text-[#89A7B7] hover:text-[#EFFFFF] transition-colors cursor-pointer min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setFormError('');
              setShowAddModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#48D5FF] hover:to-[#35D47A] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#48D5FF]/20 cursor-pointer min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>ADD OPERATOR</span>
          </button>
        </div>
      </div>

      {/* Operator Table Card */}
      <div className="rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#102B3B] flex items-center justify-between">
          <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
            AUTHORIZED SYSTEM ACCOUNTS
          </h3>
          <span className="text-xs font-mono font-bold text-[#48D5FF]">
            {operators.length} TOTAL USERS
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-[#102B3B] bg-[#06131D]/60 text-[10px] font-extrabold uppercase tracking-wider text-[#89A7B7]">
                <th className="py-3.5 px-4">OPERATOR NAME</th>
                <th className="py-3.5 px-4">ROLE</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">CREATED DATE</th>
                <th className="py-3.5 px-4">LAST LOGIN</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102B3B]/60 text-xs">
              {loading && operators.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#89A7B7]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#48D5FF]" />
                    <span>Loading authorized operator directory...</span>
                  </td>
                </tr>
              ) : operators.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#89A7B7]">
                    No operator accounts found. Click "ADD OPERATOR" to create one.
                  </td>
                </tr>
              ) : (
                operators.map((op) => {
                  const isActive = op.status === 'active';
                  const isPrimaryAdmin = op.username === 'admin';

                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-[#0E2432]/50 transition-colors group"
                    >
                      {/* Operator Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              op.role === 'admin'
                                ? 'bg-gradient-to-tr from-[#299BD7] to-[#48D5FF] text-black shadow-md shadow-[#48D5FF]/20'
                                : 'bg-[#102B3B] text-[#48D5FF]'
                            }`}
                          >
                            {op.role === 'admin' ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#EFFFFF] font-mono">{op.username}</p>
                            <p className="text-[10px] text-[#89A7B7]">{op.name || op.station}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                            op.role === 'admin'
                              ? 'bg-[#48D5FF]/20 text-[#48D5FF] border border-[#48D5FF]/30'
                              : 'bg-[#299BD7]/20 text-[#299BD7] border border-[#299BD7]/30'
                          }`}
                        >
                          {op.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-[#35D47A]/20 text-[#35D47A] border border-[#35D47A]/30'
                              : 'bg-[#FF6257]/20 text-[#FF6257] border border-[#FF6257]/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#35D47A] pulse-active' : 'bg-[#FF6257]'
                            }`}
                          />
                          {op.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-[#89A7B7] font-mono text-[11px]">
                        {formatDate(op.created_at)}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-[#89A7B7] font-mono text-[11px]">
                        {op.last_login ? `${formatDate(op.last_login)} ${formatTime(op.last_login)}` : '--'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(op)}
                            title="Edit Operator Details"
                            className="p-1.5 rounded-lg bg-[#06131D] hover:bg-[#102B3B] text-[#89A7B7] hover:text-[#48D5FF] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => openResetModal(op)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg bg-[#06131D] hover:bg-[#102B3B] text-[#89A7B7] hover:text-[#FFD12A] transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Enable/Disable Toggle */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleToggleStatus(op)}
                              title={isActive ? 'Disable Operator' : 'Enable Operator'}
                              className={`p-1.5 rounded-lg bg-[#06131D] hover:bg-[#102B3B] transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-[#35D47A] hover:text-[#FF6257]'
                                  : 'text-[#FF6257] hover:text-[#35D47A]'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Operator */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => openDeleteModal(op)}
                              title="Delete Operator"
                              className="p-1.5 rounded-lg bg-[#06131D] hover:bg-[#FF6257]/20 text-[#89A7B7] hover:text-[#FF6257] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ADD OPERATOR MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[#06131D] border border-[#102B3B] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#102B3B]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#48D5FF]" />
                <h3 className="text-base font-black text-[#EFFFFF]">ADD NEW OPERATOR</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#89A7B7] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-[#FF6257]/15 border border-[#FF6257]/30 text-[#FF6257] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  OPERATOR USERNAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. polar_operator_01"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  FULL / DISPLAY NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alex Mercer"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  PASSWORD * (MIN 8 CHARACTERS)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  CONFIRM PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addForm.confirm_password}
                  onChange={(e) => setAddForm({ ...addForm, confirm_password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                    ROLE
                  </label>
                  <input
                    type="text"
                    disabled
                    value="OPERATOR"
                    className="w-full px-3 py-2.5 bg-[#0E2432] border border-[#102B3B] rounded-lg text-xs text-[#48D5FF] font-mono font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                    STATUS
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none cursor-pointer"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="disabled">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#102B3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] text-xs font-bold text-[#89A7B7] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#48D5FF] hover:to-[#35D47A] text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#48D5FF]/20 cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  {submitting ? 'CREATING...' : 'CREATE OPERATOR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT OPERATOR MODAL */}
      {/* ========================================================= */}
      {showEditModal && selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[#06131D] border border-[#102B3B] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#102B3B]">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#48D5FF]" />
                <h3 className="text-base font-black text-[#EFFFFF]">
                  EDIT OPERATOR: {selectedOp.username}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#89A7B7] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-[#FF6257]/15 border border-[#FF6257]/30 text-[#FF6257] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  FULL / DISPLAY NAME
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  ACCOUNT STATUS
                </label>
                <select
                  value={editForm.status}
                  disabled={selectedOp.username === 'admin'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="active">ACTIVE</option>
                  <option value="disabled">DISABLED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#102B3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] text-xs font-bold text-[#89A7B7] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#48D5FF] hover:to-[#35D47A] text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#48D5FF]/20 cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  {submitting ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RESET PASSWORD MODAL */}
      {/* ========================================================= */}
      {showResetModal && selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[#06131D] border border-[#102B3B] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#102B3B]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FFD12A]" />
                <h3 className="text-base font-black text-[#EFFFFF]">
                  RESET PASSWORD: {selectedOp.username}
                </h3>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-[#89A7B7] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-[#FF6257]/15 border border-[#FF6257]/30 text-[#FF6257] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  NEW PASSWORD * (MIN 8 CHARACTERS)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetForm.new_password}
                  onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
                  CONFIRM NEW PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetForm.confirm_password}
                  onChange={(e) => setResetForm({ ...resetForm, confirm_password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0B1D29] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#102B3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] text-xs font-bold text-[#89A7B7] transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FFD12A] to-[#35D47A] hover:from-[#35D47A] hover:to-[#48D5FF] text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#FFD12A]/20 cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  {submitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[#06131D] border border-[#FF6257]/40 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#FF6257]">
              <div className="p-2 rounded-xl bg-[#FF6257]/15 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#EFFFFF]">DELETE OPERATOR</h3>
                <p className="text-xs text-[#89A7B7]">
                  Account: <span className="font-mono text-[#FF6257] font-bold">{selectedOp.username}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-[#89A7B7] leading-relaxed">
              Are you sure you want to delete this operator? All access tokens and security permissions will be permanently revoked.
            </p>

            <div className="pt-3 border-t border-[#102B3B] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] text-xs font-bold text-[#89A7B7] transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-[#FF6257] hover:bg-[#FF6257]/80 text-white font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#FF6257]/20 cursor-pointer disabled:opacity-50 min-h-[40px]"
              >
                {submitting ? 'DELETING...' : 'DELETE OPERATOR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
