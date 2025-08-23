import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Cores e contraste
        "placeholder:text-foreground text-foreground",
        // Borda simples e visível
        "border border-black dark:border-white/20",
        // Aparência geral
        "bg-transparent rounded-md px-3 py-1 h-9 w-full text-base md:text-sm",
        // Sem efeitos no foco
        "outline-none focus:outline-none",
        // Arquivo e disabled
        "file:text-foreground file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
