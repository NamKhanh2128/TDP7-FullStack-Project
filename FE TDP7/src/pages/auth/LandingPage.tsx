import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Calendar, MessageSquare, ArrowRight, 
  Building2, Menu, ShieldCheck, CheckCircle2, HelpCircle, Phone, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- DATA ---
const SERVICES = [
  { icon: Users, title: "Thông tin cư dân", desc: "Tra cứu hồ sơ nhân khẩu số hóa." },
  { icon: FileText, title: "Thủ tục hành chính", desc: "Đăng ký tạm trú, tạm vắng online." },
  { icon: Calendar, title: "Đặt lịch tiện ích", desc: "Sân thể thao, nhà văn hóa." },
  { icon: MessageSquare, title: "Phản ánh & Góp ý", desc: "Kết nối trực tiếp với Ban quản lý." },
];

const STEPS = [
  { title: "Đăng ký", desc: "Tạo tài khoản" },
  { title: "Đăng nhập", desc: "Vào hệ thống" },
  { title: "Chọn dịch vụ", desc: "Gửi yêu cầu" },
  { title: "Chờ xử lý", desc: "BQL xét duyệt" },
  { title: "Nhận kết quả", desc: "Thông báo về App" },
];

const FAQS = [
  { question: "Làm thế nào để đăng ký tài khoản?", answer: "Bạn chỉ cần nhấn nút 'Đăng ký ngay', nhập số điện thoại và thông tin cá nhân. Hệ thống sẽ gửi mã OTP xác thực để hoàn tất." },
  { question: "Dữ liệu của tôi có được bảo mật không?", answer: "Tuyệt đối an toàn. Hệ thống sử dụng chuẩn mã hóa quốc tế và tuân thủ các quy định về bảo vệ dữ liệu cư dân của Nhà nước." },
  { question: "Tôi quên mật khẩu thì phải làm sao?", answer: "Bạn có thể sử dụng tính năng 'Quên mật khẩu' tại màn hình đăng nhập, hệ thống sẽ hỗ trợ lấy lại mật khẩu qua SMS hoặc Email." },
  { question: "Ứng dụng có thu phí sử dụng không?", answer: "Hệ thống hoàn toàn miễn phí dành cho mọi cư dân đang sinh sống tại địa bàn quản lý." },
];

// --- ANIMATION ---
const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.1 } } };

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50/50 text-foreground font-sans overflow-x-hidden selection:bg-[hsl(199,89%,48%)]/20"
      style={{
        '--primary': '199 89% 48%',
        '--gradient-start': 'hsl(199, 89%, 48%)',
        '--gradient-end': 'hsl(174, 58%, 65%)',
      } as React.CSSProperties}
    >
      
      {/* --- HEADER --- */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16">
        <div className="container mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 font-bold text-lg cursor-pointer hover:opacity-80 text-[hsl(199,89%,48%)]" 
            onClick={() => scrollToSection('home')}
          >
            <div className="bg-[hsl(199,89%,48%)]/10 p-1.5 rounded-md">
              <Building2 className="h-5 w-5" />
            </div>
            <span>DanCuSo</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-[hsl(199,89%,48%)] transition-colors">Trang chủ</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[hsl(199,89%,48%)] transition-colors">Tính năng</button>
            <button onClick={() => scrollToSection('process')} className="hover:text-[hsl(199,89%,48%)] transition-colors">Quy trình</button>
            {/* Nút Hỗ trợ đã được kích hoạt */}
            <button onClick={() => scrollToSection('support')} className="hover:text-[hsl(199,89%,48%)] transition-colors">Hỗ trợ</button>
          </nav>
          
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-600 hover:text-[hsl(199,89%,48%)]" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
            <Button 
              size="sm"
              className="bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,48%)]/90 text-white shadow-md border-0"
              onClick={() => navigate('/register')}
            >
              Đăng ký ngay
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        
        {/* --- HERO SECTION --- */}
        <section id="home" className="relative pt-12 pb-20 lg:pt-24 lg:pb-28 overflow-hidden scroll-mt-20">
          <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-[hsl(199,89%,48%)]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-[hsl(174,58%,65%)]/10 rounded-full blur-3xl -z-10" />

          <div className="container px-6 md:px-12 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <motion.div 
                initial="hidden" animate="visible" variants={staggerContainer}
                className="text-center lg:text-left space-y-6"
              >
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(199,89%,48%)]/10 text-[hsl(199,89%,48%)] text-xs font-semibold border border-[hsl(199,89%,48%)]/20 mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(199,89%,48%)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(199,89%,48%)]"></span>
                  </span>
                  Chuyển đổi số Quốc gia
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] text-slate-900">
                  Quản lý dân cư <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(199,89%,48%)] to-[hsl(174,58%,65%)]">
                    Thông minh & Tiện lợi
                  </span>
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-base text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Kết nối trực tuyến Cư dân và Ban quản lý. Giải quyết thủ tục hành chính nhanh chóng, minh bạch ngay trên thiết bị của bạn.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <Button 
                    size="lg" 
                    className="h-12 px-8 text-sm font-semibold text-white shadow-lg rounded-full border-0"
                    style={{ background: 'var(--gradient-primary, linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(174, 58%, 65%) 100%))' }}
                    onClick={() => navigate('/register')}
                  >
                    Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/login')}>
                    Truy cập hệ thống
                  </Button>
                </motion.div>

                <motion.div variants={fadeIn} className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">U{i}</div>
                     ))}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">400+ Hộ gia đình</p>
                    <p className="text-xs text-slate-500">Đã tin tưởng sử dụng</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="relative flex items-center justify-center"
              >
                 <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(199,89%,48%)]/20 to-[hsl(174,58%,65%)]/20 rounded-full blur-3xl scale-90 -z-10" />
                 <div className="relative bg-white border border-slate-100 shadow-2xl shadow-[hsl(199,89%,48%)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(199,89%,48%)]/10 to-[hsl(174,58%,65%)]/20 flex items-center justify-center mb-6 shadow-inner">
                        <Building2 className="w-12 h-12 text-[hsl(199,89%,48%)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Tổ Dân Phố Số 7</h3>
                    <p className="text-sm text-slate-500 mb-6">Phường La Khê, Quận Hà Đông</p>
                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[hsl(199,89%,48%)] font-bold text-lg">1,250</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Nhân khẩu</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[hsl(174,58%,65%)] font-bold text-lg">412</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Hộ dân</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-green-700">Hệ thống đang hoạt động</span>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 animate-bounce duration-[3000ms]">
                        <ShieldCheck className="w-6 h-6 text-[hsl(199,89%,48%)]" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 animate-bounce duration-[4000ms] delay-700">
                        <CheckCircle2 className="w-6 h-6 text-[hsl(174,58%,65%)]" />
                    </div>
                 </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-16 bg-white border-y border-slate-100 scroll-mt-16">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Tiện ích số hóa</h2>
              <p className="text-sm text-slate-500 mt-2">Mọi thứ bạn cần để quản lý cuộc sống.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES.map((s, i) => (
                <div key={i} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:shadow-[hsl(199,89%,48%)]/10 hover:border-[hsl(199,89%,48%)]/30 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-[hsl(199,89%,48%)]/5 flex items-center justify-center text-[hsl(199,89%,48%)] mb-4 group-hover:scale-110 transition-transform`}>
                    <s.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PROCESS STEPS --- */}
        <section id="process" className="py-20 container px-6 md:px-12 mx-auto scroll-mt-16">
          <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-900">Quy trình đơn giản</h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative">
                <div className="hidden md:block absolute top-4 left-[10%] w-[80%] h-0.5 bg-slate-100 -z-10" />
                {STEPS.map((step, idx) => (
                   <div key={idx} className="flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-[hsl(174,58%,65%)]/50 text-[hsl(199,89%,48%)] font-bold text-sm flex items-center justify-center mb-4 shadow-sm z-10">
                         {idx + 1}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                   </div>
                ))}
             </div>
          </div>
        </section>

        {/* --- SUPPORT / FAQ SECTION (MỚI) --- */}
        <section id="support" className="py-16 bg-slate-50 border-t border-slate-100 scroll-mt-16">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 text-[hsl(199,89%,48%)] font-semibold">
                  <HelpCircle className="w-5 h-5" />
                  <span>Hỗ trợ cư dân</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h2>
                <p className="text-slate-600 mb-6">
                  Giải đáp các thắc mắc phổ biến nhất để bạn có thể sử dụng hệ thống một cách dễ dàng.
                </p>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Hotline hỗ trợ</p>
                      <p className="font-bold text-slate-800">1900 1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email liên hệ</p>
                      <p className="font-bold text-slate-800">hotro@dancuso.vn</p>
                    </div>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b-slate-100">
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-[hsl(199,89%,48%)]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* --- CTA: SẴN SÀNG TRẢI NGHIỆM --- */}
        <section className="py-16 px-6 md:px-12 container mx-auto">
          <div 
            className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl shadow-[hsl(199,89%,48%)]/20 text-white"
            style={{ background: 'var(--gradient-primary, linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(174, 58%, 65%) 100%))' }}
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">Sẵn sàng trải nghiệm?</h2>
                <p className="text-white/90 text-sm md:text-base">
                  Tham gia cùng cộng đồng văn minh ngay hôm nay. Tiết kiệm thời gian và công sức cho gia đình bạn.
                </p>
                <div className="flex justify-center pt-2">
                  <Button className="bg-white text-[hsl(199,89%,48%)] hover:bg-slate-50 font-bold px-8 h-11 rounded-full border-0" onClick={() => navigate('/register')}>
                     Đăng ký tài khoản
                  </Button>
               </div>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-900/20 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="container px-6 md:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 DanCuSo. Nền tảng quản lý dân cư.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-[hsl(199,89%,48%)] transition-colors">Điều khoản</a>
             <a href="#" className="hover:text-[hsl(199,89%,48%)] transition-colors">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;