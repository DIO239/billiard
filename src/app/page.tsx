"use client";

import { useState } from "react";
import Navigation from "@/components/shared/Navigation/Navigation";
import Main from "@/components/layouts/Main/Main";
import { IProduct } from "@/types/product";

export default function HomePage() {
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  return (
    <>
      <Navigation 
        onFilteredProductsChange={setFilteredProducts}
        onLoadingChange={(loading) => {
          setProductsLoading(loading);
        }}
        onLoadingMoreChange={setLoadingMore}
      />
      <Main 
        filteredProducts={filteredProducts} 
        loading={productsLoading}
        loadingMore={loadingMore}
      />
    </>
  );
}