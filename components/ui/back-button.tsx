import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({path="/"}: {path: string}) {

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = path;
      };
  return (
    <Button variant="ghost" size="icon" className="mr-2" onClick={handleBack}>
      <ArrowLeft className="h-5 w-5" />
      <span className="sr-only">Back to Home</span>
    </Button>
  );
}