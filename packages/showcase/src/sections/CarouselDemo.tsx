import { Box } from "@calumet/elise-ui/box";
import { Button } from "@calumet/elise-ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@calumet/elise-ui/carousel";
import { Heading } from "@calumet/elise-ui/heading";
import { Text } from "@calumet/elise-ui/text";

const banners = [
  {
    title: "Legado EISI",
    detail: "Cincuenta años formando ingenieros de sistemas.",
    photo: "bg-[linear-gradient(135deg,#f5efe3,#d9c7a7_45%,#a8b8c8)]",
  },
  {
    title: "Admisiones 2027",
    detail: "Inscripciones abiertas hasta el 30 de noviembre.",
    photo: "bg-[linear-gradient(160deg,#fdfdfd,#c9d6df_50%,#e8dccb)]",
  },
  { title: "", detail: "", photo: "bg-[linear-gradient(200deg,#e9f0f5,#b7c9a8_55%,#f2e6d0)]" },
];

const items = [
  { title: "Slide 1", color: "bg-primary/10" },
  { title: "Slide 2", color: "bg-secondary/40" },
  { title: "Slide 3", color: "bg-muted" },
  { title: "Slide 4", color: "bg-accent" },
  { title: "Slide 5", color: "bg-primary/10" },
];

export default function CarouselDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Carousel className="w-full max-w-3xl overflow-hidden rounded-lg">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.photo}>
              <div className={`${banner.photo} relative aspect-[16/7]`}>
                {banner.title && (
                  <Box
                    background="scrim"
                    padding={8}
                    className="absolute inset-0 flex flex-col justify-end gap-2"
                  >
                    <Heading level={2}>{banner.title}</Heading>
                    <Text tone="muted">{banner.detail}</Text>
                    <div>
                      <Button variant="overlay">Ver más</Button>
                    </div>
                  </Box>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="overlay"
          size="icon-sm"
          className="top-auto right-18 bottom-6 left-auto translate-y-0"
        />
        <CarouselNext
          variant="overlay"
          size="icon-sm"
          className="top-auto right-8 bottom-6 translate-y-0"
        />
      </Carousel>

      <Carousel className="w-full max-w-sm">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.title}>
              <div
                className={`${item.color} flex aspect-square items-center justify-center rounded-md`}
              >
                <span className="text-2xl font-semibold">{item.title}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Carousel className="w-full max-w-sm" opts={{ align: "start" }}>
        <CarouselContent className="-ml-2">
          {items.map((item) => (
            <CarouselItem key={item.title} className="basis-1/3 pl-2">
              <div
                className={`${item.color} flex aspect-square items-center justify-center rounded-md`}
              >
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
