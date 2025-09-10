import { SizeEditForm } from "./components/size-form";

const SizePage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeEditForm />
      </div>
    </div>
  );
};

export default SizePage;




