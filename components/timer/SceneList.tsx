"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Scene } from "@/lib/types";
import { Check, Play } from "lucide-react";

interface SceneListProps {
  scenes: Scene[];
  activeIndex: number;
  completedSceneIds: Set<string>;
  onSelect: (index: number) => void;
}

export function SceneList({ scenes, activeIndex, completedSceneIds, onSelect }: SceneListProps) {
  if (scenes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 font-mono text-sm">
        No scenes yet. Click Setup to add scenes.
      </div>
    );
  }

  return (
    <ScrollArea className="h-32 w-full">
      <div className="space-y-1 py-2">
        {scenes.map((scene, index) => {
          const isActive = index === activeIndex;
          const isCompleted = completedSceneIds.has(scene.id);

          return (
            <Button
              key={scene.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start font-mono text-sm h-auto py-2 px-3"
              onClick={() => onSelect(index)}
              aria-label={`Select scene: ${scene.name}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="mr-2">
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Play className="h-4 w-4 fill-current" />
                ) : (
                  <span className="w-4" />
                )}
              </span>
              <span className="flex-1 text-left">{scene.name}</span>
              <span className="text-muted-foreground text-xs">
                {Math.floor(scene.durationSeconds / 60)}m
              </span>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
