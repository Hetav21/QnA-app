import { LoaderCircle } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex pb-60 items-center justify-center h-lvh">
      <LoaderCircle className="animate-spin text-gray-500" size={64} />
    </div>
  );
};

export default Loader;
