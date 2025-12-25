import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-6 bg-white/90 p-3 rounded-xl inline-block">
              <img src="/assets/logo.png" alt="Edufly Overseas" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Empowering students to achieve their global education dreams through expert guidance, personalized counseling, and comprehensive support services.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 font-heading">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about"><span className="hover:text-primary cursor-pointer transition-colors">About Us</span></Link></li>
              <li><Link href="/destinations"><span className="hover:text-primary cursor-pointer transition-colors">Destinations</span></Link></li>
              <li><Link href="/programs"><span className="hover:text-primary cursor-pointer transition-colors">Programs</span></Link></li>
              <li><Link href="/gallery"><span className="hover:text-primary cursor-pointer transition-colors">Gallery</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-primary cursor-pointer transition-colors">Contact</span></Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 font-heading">Our Services</h3>
            <ul className="space-y-3">
              <li><Link href="/counselling"><span className="hover:text-primary cursor-pointer transition-colors">Career Counselling</span></Link></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">University Admissions</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Visa Assistance</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Pre-departure Briefing</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Travel Arrangements</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 font-heading">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0 mt-1" size={18} />
                <span>123 Education Plaza, Knowledge Park, Mumbai, India - 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={18} />
                <span>info@eduflyoverseas.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Edufly Overseas. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-white">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
