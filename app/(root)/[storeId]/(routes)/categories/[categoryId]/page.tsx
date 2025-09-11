import { CategoryEditForm } from "./components/category-form";

const CategoryPage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryEditForm />
      </div>
    </div>
  );
};

export default CategoryPage;





