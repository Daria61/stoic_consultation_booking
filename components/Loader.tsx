import { Spinner } from "./ui/spinner";

export const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <Spinner /> Loading...
    </div>
  );
};
