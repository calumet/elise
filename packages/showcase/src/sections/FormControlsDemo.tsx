import { useState } from 'react';
import { Label } from '@elise/ui/label';
import { RadioGroup, RadioGroupItem } from '@elise/ui/radio-group';
import { Switch } from '@elise/ui/switch';
import { Slider } from '@elise/ui/slider';

const FormControlsDemo = () => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<number[]>([40]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-sm border border-border bg-surface p-4">
        <Label className="text-sm font-semibold">Opciones</Label>
        <RadioGroup defaultValue="opt1">
          <label className="flex items-center gap-2 text-base">
            <RadioGroupItem value="opt1" />
            Opción 1
          </label>
          <label className="flex items-center gap-2 text-base">
            <RadioGroupItem value="opt2" />
            Opción 2
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-4 rounded-sm border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="switch-demo" className="text-base">Switch</Label>
          <Switch id="switch-demo" checked={enabled} onCheckedChange={(v) => setEnabled(v === true)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slider-demo" className="text-base">Slider</Label>
          <Slider id="slider-demo" value={volume} onValueChange={setVolume} max={100} step={5} />
          <p className="text-sm text-muted-foreground">Valor: {volume[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default FormControlsDemo;
