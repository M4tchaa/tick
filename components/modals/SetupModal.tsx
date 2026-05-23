"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scene } from "@/lib/types";
import { parseMinutesSeconds, formatTime } from "@/lib/utils";
import { Settings, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface SetupModalProps {
  scenes: Scene[];
  onAdd: (scene: Omit<Scene, "id">) => void;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: Scene[]) => void;
}

export function SetupModal({ scenes, onAdd, onUpdate, onDelete, onReorder }: SetupModalProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [advanceMode, setAdvanceMode] = useState<"manual" | "auto" | "">("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDuration("");
    setAdvanceMode("");
  };

  const handleSubmit = () => {
    if (!name || !duration || !advanceMode) return;

    const seconds = parseMinutesSeconds(duration);
    if (seconds <= 0) return;

    if (editingId) {
      onUpdate(editingId, {
        name,
        durationSeconds: seconds,
        advanceMode: advanceMode as "manual" | "auto",
      });
    } else {
      onAdd({
        name,
        durationSeconds: seconds,
        advanceMode: advanceMode as "manual" | "auto",
      });
    }

    resetForm();
  };

  const handleEdit = (scene: Scene) => {
    setEditingId(scene.id);
    setName(scene.name);
    setDuration(formatTime(scene.durationSeconds).slice(0, -3)); // Remove hours, keep mm:ss
    setAdvanceMode(scene.advanceMode);
  };

  const moveScene = (index: number, direction: "up" | "down") => {
    const newOrder = [...scenes];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    onReorder(newOrder);
  };

  const isFormValid = name.trim() && duration.trim() && advanceMode;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" aria-label="Open setup">
          <Settings className="h-4 w-4 mr-2" />
          Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono">Scene Setup</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="scene-name" className="font-mono text-sm">
              Scene Name
            </Label>
            <Input
              id="scene-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Opening, Q&A"
              className="font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scene-duration" className="font-mono text-sm">
              Duration (mm:ss)
            </Label>
            <Input
              id="scene-duration"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="10:00"
              className="font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-mono text-sm">Advance Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={advanceMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdvanceMode("manual")}
                className="flex-1 font-mono text-sm"
              >
                Manual
              </Button>
              <Button
                type="button"
                variant={advanceMode === "auto" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdvanceMode("auto")}
                className="flex-1 font-mono text-sm"
              >
                Auto
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full font-mono"
          >
            {editingId ? "Update Scene" : "Add Scene"}
          </Button>

          {editingId && (
            <Button variant="ghost" onClick={resetForm} className="w-full font-mono">
              Cancel Edit
            </Button>
          )}
        </div>

        {scenes.length > 0 && (
          <>
            <div className="border-t pt-4">
              <Label className="font-mono text-sm mb-2 block">Existing Scenes</Label>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className="flex items-center gap-2 py-2 px-2 rounded hover:bg-muted/50"
                    >
                      <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                      <span className="flex-1 font-mono text-sm truncate">{scene.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {Math.floor(scene.durationSeconds / 60)}m
                      </span>
                      <span className="text-xs font-mono bg-muted px-1 rounded">
                        {scene.advanceMode === "auto" ? "A" : "M"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveScene(index, "up")}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveScene(index, "down")}
                        disabled={index === scenes.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(scene)}
                        aria-label="Edit scene"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onDelete(scene.id)}
                        aria-label="Delete scene"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
