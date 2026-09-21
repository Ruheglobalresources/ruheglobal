import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return <Loader2 className={cn("animate-spin text-muted-foreground", sizes[size])} />;
};