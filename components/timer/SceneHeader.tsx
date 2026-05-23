"use client";

interface SceneHeaderProps {
  name: string;
  index: number;
  total: number;
}

export function SceneHeader({ name, index, total }: SceneHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <h1 className="text-2xl font-bold font-mono text-foreground">{name}</h1>
      <p className="text-sm font-mono text-muted-foreground mt-1">
        Scene {index + 1} of {total}
      </p>
    </div>
  );
}
