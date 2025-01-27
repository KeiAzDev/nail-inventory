'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Product = {
  id: string;
  brand: string;
  productName: string;
  colorCode: string;
  colorName: string;
  type: 'POLISH' | 'GEL';
  price: number;
  quantity: number;
  usageCount: number;
  lastUsed?: Date;
  averageUsesPerMonth?: number;
  estimatedDaysLeft?: number;
  minStockAlert: number;
};

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
};

export function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    type: 'POLISH',
    quantity: 1,
    minStockAlert: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        type: 'POLISH',
        quantity: 1,
        minStockAlert: 5,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('商品の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4">
          {product ? '商品を編集' : '新規商品登録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ブランド"
              value={formData.brand || ''}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              required
            />
            <Input
              label="商品名"
              value={formData.productName || ''}
              onChange={e => setFormData({ ...formData, productName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="カラーコード"
              type="color"
              value={formData.colorCode || '#000000'}
              onChange={e => setFormData({ ...formData, colorCode: e.target.value })}
              required
            />
            <Input
              label="カラー名"
              value={formData.colorName || ''}
              onChange={e => setFormData({ ...formData, colorName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                タイプ
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ 
                  ...formData, 
                  type: e.target.value as 'POLISH' | 'GEL'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <option value="POLISH">POLISH</option>
                <option value="GEL">GEL</option>
              </select>
            </div>
            <Input
              label="価格"
              type="number"
              value={formData.price || ''}
              onChange={e => setFormData({ 
                ...formData, 
                price: parseFloat(e.target.value) 
              })}
              required
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="在庫数"
              type="number"
              value={formData.quantity || 1}
              onChange={e => setFormData({ 
                ...formData, 
                quantity: parseInt(e.target.value) 
              })}
              required
              min="0"
            />
            <Input
              label="最小在庫アラート"
              type="number"
              value={formData.minStockAlert || 5}
              onChange={e => setFormData({ 
                ...formData, 
                minStockAlert: parseInt(e.target.value) 
              })}
              required
              min="1"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              {product ? '更新' : '登録'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}