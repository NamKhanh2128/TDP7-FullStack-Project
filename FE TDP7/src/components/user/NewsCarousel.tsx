import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Activity, Info, BellRing } from "lucide-react";

// Dữ liệu giả lập cho tin tức
const newsItems = [
  {
    id: 1,
    title: "Họp tổ dân phố Quý 4",
    date: "28/12/2025",
    desc: "Tổng kết hoạt động năm 2025 và triển khai kế hoạch năm mới.",
    type: "Sự kiện",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: 2,
    title: "Lịch tiêm chủng mở rộng",
    date: "05/01/2026",
    desc: "Tiêm vắc-xin cho trẻ em dưới 5 tuổi tại trạm y tế phường.",
    type: "Y tế",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: 3,
    title: "Thu phí vệ sinh năm 2026",
    date: "01/01/2026",
    desc: "Thông báo mức thu phí vệ sinh môi trường mới áp dụng từ tháng 1.",
    type: "Thông báo",
    icon: BellRing,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    id: 4,
    title: "Làm căn cước công dân",
    date: "Hàng tuần",
    desc: "Công an phường hỗ trợ làm CCCD gắn chip vào thứ 7 hàng tuần.",
    type: "Hành chính",
    icon: Info,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export function NewsCarousel() {
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {newsItems.map((item) => {
            const Icon = item.icon;
            return (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="border shadow-sm hover:shadow-md transition-all h-full">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      
                      {/* Header Card */}
                      <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-xl ${item.bg} w-fit`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">
                          {item.type}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      {/* Footer Date */}
                      <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.date}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {/* Nút điều hướng (Chỉ hiện trên Desktop) */}
        <CarouselPrevious className="hidden md:flex -left-2" />
        <CarouselNext className="hidden md:flex -right-2" />
      </Carousel>
    </div>
  );
}