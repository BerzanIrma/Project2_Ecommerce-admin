import { SizeForm } from "./components/size-form";

const SizeNewPage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm />
      </div>
    </div>
  );
};

export default SizeNewPage;


