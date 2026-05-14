import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import { School, Info, BookOpen, MessageCircle, ExternalLink, Menu, X, Landmark, GraduationCap, MapPin, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'botpress'>('chat');

  const navItems = [
    { name: 'สนง.ศึกษาธิการจังหวัด', icon: <Landmark size={18} />, url: 'https://www.pyopeo.com/' },
    { name: 'สป.ศธ.', icon: <School size={18} />, url: 'https://ops.moe.go.th/' },
    { name: 'คุรุสภา', icon: <GraduationCap size={18} />, url: 'https://www.ksp.or.th/' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-2 rounded-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-brand-primary leading-tight">สำนักงานศึกษาธิการจังหวัดพะเยา</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">PHAYAO PROVINCIAL EDUCATION OFFICE</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-brand-primary leading-tight">ศึกษาธิการจังหวัดพะเยา</h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors py-2"
                >
                  {item.icon}
                  {item.name}
                </a>
              ))}
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                AI Online
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar - Info */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
              <Info className="text-brand-accent" size={24} />
              พะเยา เอ็ดดูบอท
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              ระบบแชทบอทอัจฉริยะ (AI-Powered) พัฒนาขึ้นโดยสำนักงานศึกษาธิการจังหวัดพะเยา เพื่อให้บริการข้อมูลความรู้ และตอบข้อสงสัยทางการศึกษาได้อย่างรวดเร็วตลอด 24 ชั่วโมง
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-brand-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">ที่อยู่</h4>
                  <p className="text-xs text-slate-500">เลขที่ 588 หมู่ 11 ถ.สนามกีฬา ต.บ้านต๋อม อ.เมือง จ.พะเยา 56000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-brand-primary">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">โทรศัพท์</h4>
                  <p className="text-xs text-slate-500">054-079-873</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-brand-primary">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">ช่องทางออนไลน์</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    <a href="https://www.pyopeo.com" target="_blank" className="text-xs text-brand-accent hover:underline flex items-center gap-1">
                      www.pyopeo.com <ExternalLink size={10} />
                    </a>
                    <a href="https://www.facebook.com/PhayaoProvincialEducationOffice" target="_blank" className="text-xs text-brand-accent hover:underline flex items-center gap-1">
                      Facebook: ศึกษาธิการจังหวัดพะเยา <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bot Toggle */}
          <section className="bg-gradient-to-br from-[#003366] to-[#004d99] p-6 rounded-3xl text-white shadow-xl">
            <h3 className="font-bold mb-2">เลือกใช้แชทบอท</h3>
            <p className="text-blue-100 text-xs mb-4">เรากำลังพัฒนาระบบ AI ให้ทันสมัยยิ่งขึ้น คุณสามารถเลือกใช้งานได้ทั้ง 2 ระบบ</p>
            <div className="flex bg-white/10 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'chat' ? "bg-white text-[#003366] shadow-lg" : "hover:bg-white/10"
                )}
              >
                Gemini AI (แนะนำ)
              </button>
              <button 
                onClick={() => setActiveTab('botpress')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'botpress' ? "bg-white text-[#003366] shadow-lg" : "hover:bg-white/10"
                )}
              >
                Botpress v3
              </button>
            </div>
          </section>

          <footer className="pt-4 px-2">
            <p className="text-[10px] text-slate-400">© 2024 Phayao Provincial Education Office. Built with Gemini AI.</p>
          </footer>
        </div>

        {/* Right Content - Chat Interface */}
        <div className="lg:col-span-8 min-h-[600px] h-[calc(100vh-12rem)] max-h-[800px]">
          {activeTab === 'chat' ? (
            <ChatInterface />
          ) : (
            <div className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              <iframe 
                src="https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/05/07/13/20260507131733-7T803S4S.json"
                className="w-full h-full border-none"
                title="Phayao Education Botpress"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
