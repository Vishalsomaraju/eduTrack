import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--bg-base) px-6 text-center">
      <h1 className="font-syne text-8xl font-bold text-(--accent) sm:text-9xl">
        404
      </h1>
      <p className="mt-2 font-syne text-2xl font-semibold text-(--text-primary)">
        Page not found
      </p>
      <p className="mt-2 max-w-md text-sm text-(--text-muted)">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate("/login")}>Back to login</Button>
      </div>
    </div>
  );
}
