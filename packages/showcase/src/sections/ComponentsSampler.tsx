import { Button } from "@calumet/elise-ui/button";
import { Progress } from "@calumet/elise-ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@calumet/elise-ui/tabs";
import { Toggle, ToggleGroup } from "@calumet/elise-ui/toggle-group";
import { useState } from "react";

const ComponentsSampler = () => {
  const [progress, setProgress] = useState(35);
  return (
    <div className="w-full max-w-2xl">
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm text-muted-foreground">
            Este sampler muestra Tabs, Progress y toggles usando los wrappers del design system.
          </p>
        </TabsContent>
        <TabsContent value="details">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base text-muted-foreground w-24">Progreso</span>
              <Progress value={progress} className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.min(100, p + 15))}
              >
                +15%
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base text-muted-foreground">Toggles</span>
              <ToggleGroup type="multiple">
                <Toggle value="bold">B</Toggle>
                <Toggle value="italic">I</Toggle>
                <Toggle value="underline">U</Toggle>
              </ToggleGroup>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentsSampler;
