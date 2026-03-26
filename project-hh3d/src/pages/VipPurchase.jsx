import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const PACKAGES = [
  { months: 1, label: 'Goi 1 Thang', price: 99000 },
  { months: 3, label: 'Goi 3 Thang', price: 249000 },
  { months: 12, label: 'Goi 12 Thang', price: 799000 },
];

const METHODS = [
  { id: 'momo', label: 'Vi MoMo' },
  { id: 'bank', label: 'Chuyen khoan ngan hang' },
  { id: 'card', label: 'The ATM / The noi dia' },
];

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' VND';

export default function VipPurchase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBankQr, setShowBankQr] = useState(false);

  const selectedPackage = useMemo(
    () => PACKAGES.find((item) => item.months === selectedMonths) || PACKAGES[0],
    [selectedMonths]
  );

  const handlePayNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui long dang nhap de thanh toan VIP');
      navigate('/login');
      return;
    }

    if (!acceptedTerms) {
      alert('Vui long dong y dieu khoan thanh toan truoc khi tiep tuc.');
      return;
    }

    if (paymentMethod === 'momo' || paymentMethod === 'card') {
      alert('Phuong thuc nay dang bao tri. Vui long chon Chuyen khoan ngan hang.');
      return;
    }

    setShowBankQr(true);
  };

  const handleActivateVip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui long dang nhap de thanh toan VIP');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/me/vip/purchase', { months: selectedMonths });
      const nextUser = res?.data?.user || { ...(user || {}), is_vip: true, vip_expires_at: res?.data?.vip_expires_at };
      localStorage.setItem('user', JSON.stringify(nextUser));
      window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: { user: nextUser } }));
      alert(res?.data?.message || 'Thanh toan VIP thanh cong');
      navigate('/');
    } catch (error) {
      alert(error?.response?.data?.message || 'Khong the thanh toan VIP luc nay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-white">Trang Thanh Toan VIP</h1>
        <p className="text-gray-400 mt-2">Chon goi, chon phuong thuc thanh toan va xac nhan mua VIP.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {PACKAGES.map((pkg) => {
            const active = pkg.months === selectedMonths;
            return (
              <button
                key={pkg.months}
                type="button"
                onClick={() => setSelectedMonths(pkg.months)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-yellow-400 bg-yellow-500/10'
                    : 'border-gray-700 bg-[#111827] hover:border-yellow-500/50'
                }`}
              >
                <p className="text-white font-bold text-lg">{pkg.label}</p>
                <p className="text-yellow-300 mt-2 font-black">{formatVnd(pkg.price)}</p>
                <p className="text-gray-400 text-xs mt-2">Xem chat luong 4K va noi dung VIP</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 bg-[#111827] border border-gray-700 rounded-2xl p-5">
          <p className="text-white font-bold mb-3">Phuong thuc thanh toan</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {METHODS.map((method) => {
              const active = paymentMethod === method.id;
              const isMaintenance = method.id === 'momo' || method.id === 'card';
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setShowBankQr(false);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-gray-700 bg-[#0f172a] text-gray-300 hover:border-cyan-500/60'
                  }`}
                >
                  <p>{method.label}</p>
                  {isMaintenance && <p className="text-[11px] text-orange-300 mt-1">Dang bao tri</p>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-[#111827] border border-gray-700 rounded-2xl p-5">
          <p className="text-gray-300">Goi da chon: <span className="text-white font-bold">{selectedPackage.label}</span></p>
          <p className="text-gray-300 mt-1">Thanh toan: <span className="text-yellow-300 font-black">{formatVnd(selectedPackage.price)}</span></p>
          <p className="text-gray-300 mt-1">Phuong thuc: <span className="text-cyan-300 font-bold">{METHODS.find((m) => m.id === paymentMethod)?.label}</span></p>

          <label className="mt-4 flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
            />
            <span>Toi dong y dieu khoan thanh toan va kich hoat goi VIP ngay sau khi giao dich thanh cong.</span>
          </label>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={handlePayNow}
              disabled={loading || paymentMethod !== 'bank'}
              className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black transition disabled:opacity-60"
            >
              {paymentMethod === 'bank' ? 'Xac Nhan Thanh Toan' : 'Phuong thuc dang bao tri'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition"
            >
              Quay Lai
            </button>
          </div>

          {showBankQr && paymentMethod === 'bank' && (
            <div className="mt-6 border border-cyan-500/30 bg-cyan-500/5 rounded-2xl p-4">
              <p className="text-cyan-300 font-bold mb-2">QR Chuyen Khoan Ngan Hang</p>
              <p className="text-gray-300 text-sm mb-3">Vui long quet ma QR ben duoi de thanh toan {formatVnd(selectedPackage.price)}.</p>
              <div className="bg-white rounded-xl p-3 inline-block">
                <img
                  src="/image/vip-bank-qr.png"
                  alt="QR ngan hang thanh toan VIP"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleActivateVip}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition disabled:opacity-60"
                >
                  {loading ? 'Dang kich hoat...' : 'Toi da chuyen khoan, kich hoat VIP'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
