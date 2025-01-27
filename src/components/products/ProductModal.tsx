"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  brand: string;
  productName: string;
  colorCode: string;
  colorName: string;
  type: "POLISH" | "GEL";
  price: number;
  quantity: number;
  usageCount: number;
  lastUsed?: Date;
  averageUsesPerMonth?: number;
  estimatedDaysLeft?: number;
  minStockAlert: number;
};

type Usage = {
  id: string;
  date: string;
  note?: string;
};

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
};

const useProductUsages = (productId: string | undefined) => {
  const [usages, setUsages] = useState<Usage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsages = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/usage?productId=${productId}`);
      const data = await res.json();
      setUsages(data.usages);
    } catch (error) {
      console.error("Failed to fetch usages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { usages, isLoading, fetchUsages, setUsages };
};

export function ProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    type: "POLISH",
    quantity: 1,
    minStockAlert: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [usageNote, setUsageNote] = useState("");
  const {
    usages,
    isLoading: usagesLoading,
    fetchUsages,
    setUsages,
  } = useProductUsages(product?.id);

  useEffect(() => {
    if (isOpen && product?.id) {
      fetchUsages();
    }
  }, [isOpen, product?.id]);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        type: "POLISH",
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
      console.error("Failed to save product:", error);
      alert("商品の保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordUsage = async () => {
    if (!product?.id) return;

    try {
      const res = await fetch("/api/products/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          note: usageNote,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUsages([data.usage, ...usages]);
      setUsageNote("");
      setShowUsageForm(false);
      onSave({ ...product, quantity: product.quantity - 1 });
    } catch (error) {
      alert("使用記録の保存に失敗しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-lg font-semibold mb-4">
          {product ? "商品を編集" : "新規商品登録"}
        </h2>

        {product && product.quantity <= product.minStockAlert && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">
              在庫が少なくなっています（{product.quantity}個）
            </p>
            {product.estimatedDaysLeft !== null && (
              <p className="text-sm text-red-600 mt-1">
                推定残り日数: {product.estimatedDaysLeft}日
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ブランド"
              value={formData.brand || ""}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              required
            />
            <Input
              label="商品名"
              value={formData.productName || ""}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="カラーコード"
              type="color"
              value={formData.colorCode || "#000000"}
              onChange={(e) =>
                setFormData({ ...formData, colorCode: e.target.value })
              }
              required
            />
            <Input
              label="カラー名"
              value={formData.colorName || ""}
              onChange={(e) =>
                setFormData({ ...formData, colorName: e.target.value })
              }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "POLISH" | "GEL",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <option value="POLISH">POLISH</option>
                <option value="GEL">GEL</option>
              </select>
            </div>
            <Input
              label="価格"
              type="number"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value),
                })
              }
              required
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="在庫数"
                type="number"
                value={formData.quantity || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                required
                min="0"
              />
              {(formData.quantity ?? 0) <= (formData.minStockAlert ?? 5) && (
                <span className="absolute -top-1 right-0 text-xs text-red-500">
                  在庫要注意
                </span>
              )}
            </div>
            <Input
              label="最小在庫アラート"
              type="number"
              value={formData.minStockAlert || 5}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minStockAlert: parseInt(e.target.value),
                })
              }
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
            <Button type="submit" isLoading={isLoading}>
              {product ? "更新" : "登録"}
            </Button>
          </div>
        </form>

        {product && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">使用履歴</h3>
              <Button
                onClick={() => setShowUsageForm(true)}
                disabled={product.quantity <= 0}
              >
                使用記録
              </Button>
            </div>

            {showUsageForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="メモ"
                  value={usageNote}
                  onChange={(e) => setUsageNote(e.target.value)}
                  placeholder="使用内容のメモ"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button onClick={() => setShowUsageForm(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleRecordUsage}>記録</Button>
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {usagesLoading ? (
                <div className="text-center py-4 text-gray-500">
                  読み込み中...
                </div>
              ) : usages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  使用履歴がありません
                </div>
              ) : (
                usages.map((usage) => (
                  <div key={usage.id} className="p-3 border-b last:border-b-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(usage.date).toLocaleString()}
                      </span>
                      {usage.note && (
                        <span className="text-gray-700">{usage.note}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
