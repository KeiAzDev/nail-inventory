"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/products/ProductModal";

interface Product {
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
  estimatedDaysLeft?: number;
  minStockAlert: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const storeId = localStorage.getItem("storeId");
      const response = await fetch(`/api/products?storeId=${storeId}`);
      const { products } = await response.json();
      setProducts(products || []);
      setFilteredProducts(products || []);
    } catch (error) {
      console.error("商品データの取得に失敗しました:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.colorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter((product) => product.type === filterType);
    }

    if (showLowStock) {
      filtered = filtered.filter(
        (product) => product.quantity <= product.minStockAlert
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterType, showLowStock, products]);

  const handleSave = async (data: Partial<Product>) => {
    const storeId = localStorage.getItem("storeId");
    if (!storeId) return;

    const url = selectedProduct
      ? `/api/products/${selectedProduct.id}`
      : "/api/products";

    const response = await fetch(url, {
      method: selectedProduct ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, storeId }),
    });

    if (!response.ok) {
      throw new Error("Failed to save product");
    }

    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">商品一覧</h1>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            商品登録
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="検索"
                placeholder="商品名、ブランド、カラー名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <option value="ALL">全て</option>
              <option value="POLISH">ポリッシュ</option>
              <option value="GEL">ジェル</option>
            </Select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-gray-700">在庫アラートのみ表示</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer ${
                product.quantity <= product.minStockAlert
                  ? "border-2 border-red-500"
                  : ""
              }`}
              onClick={() => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {product.productName}
                  </h3>
                  <p className="text-gray-600">{product.brand}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.type === "POLISH"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {product.type === "POLISH" ? "ポリッシュ" : "ジェル"}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700">
                  カラー: {product.colorName} ({product.colorCode})
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      在庫: {product.quantity}
                    </span>
                    {product.quantity <= product.minStockAlert && (
                      <span className="text-sm text-red-600 font-medium">
                        在庫低
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </span>
                </div>
                {product.estimatedDaysLeft !== null && (
                  <p className="text-sm text-gray-500">
                    推定残り日数: {product.estimatedDaysLeft}日
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  使用回数: {product.usageCount}回
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
