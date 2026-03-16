import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@calumet/elise-ui/carousel";

const items = [
  { title: "Slide 1", color: "bg-primary/10" },
  { title: "Slide 2", color: "bg-secondary/40" },
  { title: "Slide 3", color: "bg-muted" },
  { title: "Slide 4", color: "bg-accent" },
  { title: "Slide 5", color: "bg-primary/10" },
];

export default function CarouselDemo() {
  return (
    <div className="flex flex-col gap-8 w-full items-center">
      <Carousel className="w-full max-w-sm">
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem key={i}>
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
          {items.map((item, i) => (
            <CarouselItem key={i} className="basis-1/3 pl-2">
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
