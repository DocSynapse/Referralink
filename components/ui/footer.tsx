/**
 * Footer Component - Professional footer with disclaimer
 * Sentra Healthcare Solution
 */

import React from 'react';

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface NavLink {
  href: string;
  label: string;
}

interface Copyright {
  text: string;
  license: string;
}

interface FooterProps {
  logo?: React.ReactNode;
  brandName: string;
  socialLinks?: SocialLink[];
  mainLinks?: NavLink[];
  legalLinks?: NavLink[];
  copyright: Copyright;
}

export const Footer: React.FC<FooterProps> = ({
  logo,
  brandName,
  socialLinks = [],
  mainLinks = [],
  legalLinks = [],
  copyright,
}) => {
  return (
    <footer className="bg-[#002147] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logo && <div className="text-[#E03D00]">{logo}</div>}
              <div>
                <div className="text-xl font-black text-white">{brandName}</div>
                <div className="text-xs text-white/60 font-semibold">Healthcare Intelligence Platform</div>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              Platform AI untuk manajemen rujukan medis yang cerdas. Menghubungkan fasilitas kesehatan dengan teknologi untuk pelayanan yang lebih baik.
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#E03D00] flex items-center justify-center transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Column */}
          {mainLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#E03D00] mb-4">Navigasi</h3>
              <ul className="space-y-2">
                {mainLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-white/80 hover:text-white transition-colors font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Column */}
          {legalLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#E03D00] mb-4">Legal</h3>
              <ul className="space-y-2">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-white/80 hover:text-white transition-colors font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
            <div className="text-center md:text-left">
              <div className="font-bold text-white/80">{copyright.text}</div>
              <div className="mt-1">{copyright.license}</div>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <span>Powered by</span>
              <span className="font-black text-[#E03D00]">AI</span>
              <span>•</span>
              <span>Made with ❤️ in Kediri</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
