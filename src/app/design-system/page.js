"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DesignSystemPage() {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans pb-32">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="border-b pb-8">
          <h1 className="text-4xl font-black tracking-tight">SalesPush Design System</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Hệ thống quy chuẩn giao diện (UI Foundation) bao gồm Typography, Colors, và Component cơ bản.
          </p>
        </header>

        {/* 1. Typography */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">1. Typography</h2>
            <p className="text-sm text-muted-foreground">Phông chữ và cấp độ văn bản.</p>
          </div>
          <div className="grid gap-6 p-6 rounded-2xl glass">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Heading 1 - text-4xl font-black</h1>
              <p className="text-muted-foreground mt-1">Dùng cho tiêu đề trang chính, Hero section.</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Heading 2 - text-3xl font-bold</h2>
              <p className="text-muted-foreground mt-1">Dùng cho tiêu đề các section lớn.</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Heading 3 - text-2xl font-semibold</h3>
              <p className="text-muted-foreground mt-1">Dùng cho tiêu đề card, modal.</p>
            </div>
            <div>
              <h4 className="text-xl font-medium tracking-tight">Heading 4 - text-xl font-medium</h4>
              <p className="text-muted-foreground mt-1">Dùng cho tiêu đề phụ hoặc nổi bật.</p>
            </div>
            <div>
              <p className="leading-7">
                <strong>Paragraph (Body Text):</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <strong>Muted / Small:</strong> Dùng cho các ghi chú nhỏ, trạng thái hoặc thông tin phụ trợ.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Colors */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">2. Colors & Tokens</h2>
            <p className="text-sm text-muted-foreground">Hệ màu chủ đạo và trạng thái.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-background border shadow-sm">
              <div className="h-16 rounded-md bg-primary mb-3"></div>
              <div className="font-semibold text-sm">Primary</div>
              <div className="text-xs text-muted-foreground">bg-primary</div>
            </div>
            <div className="p-4 rounded-xl bg-background border shadow-sm">
              <div className="h-16 rounded-md bg-secondary mb-3"></div>
              <div className="font-semibold text-sm">Secondary</div>
              <div className="text-xs text-muted-foreground">bg-secondary</div>
            </div>
            <div className="p-4 rounded-xl bg-background border shadow-sm">
              <div className="h-16 rounded-md bg-destructive mb-3"></div>
              <div className="font-semibold text-sm">Destructive</div>
              <div className="text-xs text-muted-foreground">bg-destructive</div>
            </div>
            <div className="p-4 rounded-xl bg-background border shadow-sm">
              <div className="h-16 rounded-md bg-muted mb-3"></div>
              <div className="font-semibold text-sm">Muted</div>
              <div className="text-xs text-muted-foreground">bg-muted</div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">3. Buttons</h2>
            <p className="text-sm text-muted-foreground">Hành động của người dùng.</p>
          </div>
          <div className="flex flex-wrap gap-4 p-6 rounded-2xl glass items-center">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* 4. Badges */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">4. Badges</h2>
            <p className="text-sm text-muted-foreground">Trạng thái, nhãn.</p>
          </div>
          <div className="flex flex-wrap gap-4 p-6 rounded-2xl glass items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* 5. Inputs & Forms */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">5. Inputs & Select</h2>
            <p className="text-sm text-muted-foreground">Nhập liệu và form.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl glass">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input type="email" placeholder="Email của bạn..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Phân loại khách
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại khách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Nóng (Hot)</SelectItem>
                  <SelectItem value="warm">Ấm (Warm)</SelectItem>
                  <SelectItem value="cold">Lạnh (Cold)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* 6. Cards */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">6. Cards & Containers</h2>
            <p className="text-sm text-muted-foreground">Chứa thông tin độc lập.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>SalesPush Card</CardTitle>
                <CardDescription>Sử dụng class 'glass' để có hiệu ứng mờ ảo.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Nội dung của thẻ. Phù hợp cho Smart Card, Dashboard widgets.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Huỷ</Button>
                <Button>Xác nhận</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Không dùng hiệu ứng glass (mặc định của shadcn).</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card bình thường dùng nền trắng/đen tuỳ theo mode của giao diện.</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Chi tiết</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 7. Dialog & Sheet */}
        <section className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold tracking-tight">7. Overlays (Dialog / Sheet)</h2>
            <p className="text-sm text-muted-foreground">Modal, Bottom Sheet, Sidebar.</p>
          </div>
          <div className="flex gap-4 p-6 rounded-2xl glass">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Mở Dialog (Modal)</Button>
              </DialogTrigger>
              <DialogContent className="glass sm:rounded-2xl border-white/20">
                <DialogHeader>
                  <DialogTitle>Xác nhận xoá khách hàng?</DialogTitle>
                  <DialogDescription>
                    Hành động này không thể hoàn tác. Khách hàng sẽ bị xoá vĩnh viễn khỏi danh sách.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Huỷ</Button>
                  <Button variant="destructive">Xoá ngay</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Mở Bottom Sheet</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="glass h-[50vh] rounded-t-3xl border-white/20">
                <SheetHeader>
                  <SheetTitle>Cập nhật trạng thái</SheetTitle>
                  <SheetDescription>
                    Vuốt hoặc nhập thông tin ghi chú cho khách hàng này.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Input placeholder="Ghi chú sau cuộc gọi..." />
                  <Button className="w-full mt-4">Lưu cập nhật</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

      </div>
    </div>
  );
}
