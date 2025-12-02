import { AspectRatio, AvatarImage } from '@elise/ui/aspect-ratio';
import { Avatar } from '@elise/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@elise/ui/card';
import { Label } from '@elise/ui/label';

const MediaCardDemo = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Avatar simple</CardTitle>
          <CardDescription>Avatar con fallback iniciales.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="Usuario" />
          </Avatar>
          <div>
            <p className="font-semibold">Alex Doe</p>
            <p className="text-sm text-muted-foreground">Diseñador</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aspect Ratio</CardTitle>
          <CardDescription>Contenedor 16:9 con placeholder.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label className="text-sm text-muted-foreground">Preview</Label>
          <AspectRatio ratio={16 / 9} className="rounded-sm bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaCardDemo;
