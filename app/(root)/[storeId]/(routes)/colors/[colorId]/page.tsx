import { ColorEditForm } from "./components/color-form";

const ColorPage = async () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorEditForm />
      </div>
    </div>
  );
};

export default ColorPage;


