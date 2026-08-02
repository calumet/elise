import { Checkbox } from "@calumet/elise-ui/checkbox";
import { Label } from "@calumet/elise-ui/label";
import { OTPField } from "@calumet/elise-ui/otp-field";
import { RadioGroup, RadioGroupItem } from "@calumet/elise-ui/radio-group";
import { Slider } from "@calumet/elise-ui/slider";
import { Switch } from "@calumet/elise-ui/switch";
import { useState } from "react";

const TEMAS = ["Claro", "Oscuro"];

const FormControlsDemo = () => {
  const [marcadas, setMarcadas] = useState<string[]>(["Claro"]);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<number[]>([40]);
  const [range, setRange] = useState<number[]>([20, 80]);
  const [otp, setOtp] = useState("");
  const [otpDone, setOtpDone] = useState("");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-sm border border-border bg-card p-4">
        <Label className="text-sm font-semibold">Opciones</Label>
        {/* El rótulo se enlaza con `htmlFor`, porque la opción es un button y
            no un input suelto dentro del label. */}
        <RadioGroup defaultValue="opt1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="opt1" id="opt1" />
            <Label htmlFor="opt1" className="text-base font-normal">
              Opción 1
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="opt2" id="opt2" />
            <Label htmlFor="opt2" className="text-base font-normal">
              Opción 2
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3 rounded-sm border border-border bg-card p-4">
        <Label className="text-sm font-semibold">Casilla de tres estados</Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="todas"
            checked={
              marcadas.length === TEMAS.length
                ? true
                : marcadas.length === 0
                  ? false
                  : "indeterminate"
            }
            onCheckedChange={(v) => setMarcadas(v === true ? [...TEMAS] : [])}
          />
          <Label htmlFor="todas" className="text-base">
            Todas
          </Label>
        </div>
        <div className="space-y-2 pl-6">
          {TEMAS.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Checkbox
                id={t}
                checked={marcadas.includes(t)}
                onCheckedChange={(v) =>
                  setMarcadas((prev) => (v === true ? [...prev, t] : prev.filter((x) => x !== t)))
                }
              />
              <Label htmlFor={t} className="text-base font-normal">
                {t}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-sm border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="switch-demo" className="text-base">
            Switch
          </Label>
          <Switch
            id="switch-demo"
            checked={enabled}
            onCheckedChange={(v) => setEnabled(v === true)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slider-demo" className="text-base">
            Slider
          </Label>
          <Slider id="slider-demo" value={volume} onValueChange={setVolume} max={100} step={5} />
          <p className="text-sm text-muted-foreground">Valor: {volume[0]}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="range-demo" className="text-base">
            Slider de rango
          </Label>
          <Slider
            id="range-demo"
            data-testid="range-slider"
            value={range}
            onValueChange={setRange}
            max={100}
            step={5}
          />
          <p className="text-sm text-muted-foreground">Rango: {range.join(" – ")}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-sm border border-border bg-card p-4 sm:col-span-2">
        <Label className="text-sm font-semibold">Código OTP</Label>
        <OTPField length={6} value={otp} onChange={setOtp} onComplete={setOtpDone} />
        <p className="text-sm text-muted-foreground" data-testid="otp-readout">
          Valor: <code>{JSON.stringify(otp)}</code>
          {otpDone ? (
            <>
              {" "}
              · onComplete: <code>{JSON.stringify(otpDone)}</code>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
};

export default FormControlsDemo;
