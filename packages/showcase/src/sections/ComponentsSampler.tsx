import { useState } from 'react';
import {
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  ToggleGroup
} from '@elise/ui';

const ComponentsSampler = () => {
  const [progress, setProgress] = useState(35);
  return (
    <div className="w-full max-w-2xl space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-3 border border-border bg-surface rounded-lg p-4">
          <p className="text-sm text-mutedForeground">
            Este sampler muestra Tabs, Progress y toggles usando los wrappers del design system.
          </p>
        </TabsContent>
        <TabsContent value="details" className="mt-3 border border-border bg-surface rounded-lg p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-mutedForeground w-24">Progreso</span>
              <Progress value={progress} className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 15))}>
                +15%
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-mutedForeground">Toggles</span>
              <ToggleGroup type="multiple" className="flex gap-2">
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
