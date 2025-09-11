import { ProductEditForm } from "./components/product-form";

const ProductPage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductEditForm />
      </div>
    </div>
  );
};

export default ProductPage;


