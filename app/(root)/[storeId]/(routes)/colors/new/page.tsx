import { ColorForm } from "./components/color-form";

const ColorNewPage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm />
      </div>
    </div>
  );
};

export default ColorNewPage;


