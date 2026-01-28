/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { 
  ArrowLeft, Palette, MousePointer2, Type, 
  CheckSquare, Sliders, Layout, Layers, Info
} from 'lucide-react';

// Import All Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';

import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/switch/switch.js';
import '@material/web/slider/slider.js';

import '@material/web/chips/chip-set.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/chips/suggestion-chip.js';

import '@material/web/progress/linear-progress.js';
import '@material/web/progress/circular-progress.js';

import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

import '@material/web/divider/divider.js';
import '@material/web/elevation/elevation.js';

interface ComponentShowcaseProps {
  onBack: () => void;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 md:p-16 space-y-20 font-sans pb-40">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-[#002147] font-display">Material 3 Showcase.</h1>
          <p className="text-xl text-slate-500 font-medium">Eksplorasi seluruh library komponen @material/web.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 font-bold hover:bg-[#FF4500] hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} /> Back to App
        </button>
      </header>

      <main className="max-w-6xl mx-auto space-y-24">

        {/* 1. BUTTONS */}
        <section className="space-y-8">
          <SectionHeader number="1" icon={<MousePointer2 />} title="Common Buttons" description="Lima varian tombol untuk hierarki aksi yang berbeda." />
          <div className="flex flex-wrap gap-6 items-center bg-slate-50 p-10 rounded-[32px] border border-slate-100">
            <div className="flex flex-col items-center gap-2">
              <md-elevated-button>Elevated</md-elevated-button>
              <span className="text-[10px] font-bold text-slate-400 uppercase">1.1 Elevated</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <md-filled-button>Filled</md-filled-button>
              <span className="text-[10px] font-bold text-slate-400 uppercase">1.2 Filled</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <md-filled-tonal-button>Tonal</md-filled-tonal-button>
              <span className="text-[10px] font-bold text-slate-400 uppercase">1.3 Tonal</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <md-outlined-button>Outlined</md-outlined-button>
              <span className="text-[10px] font-bold text-slate-400 uppercase">1.4 Outlined</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <md-text-button>Text</md-text-button>
              <span className="text-[10px] font-bold text-slate-400 uppercase">1.5 Text Only</span>
            </div>
          </div>
        </section>

        {/* 2. TEXT FIELDS */}
        <section className="space-y-8">
          <SectionHeader number="2" icon={<Type />} title="Text Input" description="Input field dengan validasi, ikon, dan supporting text." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[32px] border border-slate-100">
            <div className="space-y-2">
              <md-outlined-text-field 
                label="Outlined Field" 
                supporting-text="Helping text goes here"
                suffix-text="IDR"
              >
                <md-icon slot="leading-icon">person</md-icon>
              </md-outlined-text-field>
              <span className="text-[10px] font-bold text-slate-400 uppercase block text-center">2.1 Outlined</span>
            </div>
            
            <div className="space-y-2">
              <md-filled-text-field 
                label="Filled Field" 
                error
                error-text="This field is required"
              >
                <md-icon slot="leading-icon">email</md-icon>
              </md-filled-text-field>
              <span className="text-[10px] font-bold text-slate-400 uppercase block text-center">2.2 Filled</span>
            </div>
          </div>
        </section>

        {/* 3. SELECTION CONTROLS */}
        <section className="space-y-8">
          <SectionHeader number="3" icon={<CheckSquare />} title="Selection & Range" description="Checkbox, Radio, Switch, dan Sliders." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 p-10 rounded-[32px] border border-slate-100">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <md-checkbox checked></md-checkbox>
                <md-checkbox></md-checkbox>
                <md-checkbox indeterminate></md-checkbox>
                <span className="text-sm font-bold text-slate-600 ml-4">3.1 Checkboxes</span>
              </div>
              <div className="flex items-center gap-4">
                <md-switch selected></md-switch>
                <md-switch></md-switch>
                <span className="text-sm font-bold text-slate-600 ml-4">3.2 Switches</span>
              </div>
              <div className="flex items-center gap-4">
                <md-radio name="group" checked></md-radio>
                <md-radio name="group"></md-radio>
                <span className="text-sm font-bold text-slate-600 ml-4">3.3 Radio Buttons</span>
              </div>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400">3.4 Continuous Slider</span>
                <md-slider min="0" max="100" value="50" labeled></md-slider>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400">3.5 Range Slider</span>
                <md-slider range value-start="20" value-end="80" ticks step="10"></md-slider>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CHIPS */}
        <section className="space-y-8">
          <SectionHeader number="4" icon={<Sliders />} title="Chips" description="Kapsul informasi untuk filter, input, atau aksi cepat." />
          <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">4.1 Filter Chips</span>
              <md-chip-set>
                <md-filter-chip label="Cardiology" selected></md-filter-chip>
                <md-filter-chip label="Neurology"></md-filter-chip>
                <md-filter-chip label="Pediatrics"></md-filter-chip>
              </md-chip-set>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">4.2 Input & Assist Chips</span>
              <md-chip-set>
                <md-input-chip label="dr. Ferdi Iskandar">
                  <md-icon slot="icon">person</md-icon>
                </md-input-chip>
                <md-assist-chip label="Set Reminder">
                  <md-icon slot="icon">alarm</md-icon>
                </md-assist-chip>
                <md-suggestion-chip label="Add to Referral"></md-suggestion-chip>
              </md-chip-set>
            </div>
          </div>
        </section>

        {/* 5. COMMUNICATION & CONTAINMENT */}
        <section className="space-y-8">
          <SectionHeader number="5" icon={<Layers />} title="Containment & Feedback" description="Elevasi, Progress, dan Lists." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Elevation Demo */}
            <div className="bg-white p-10 rounded-[32px] border border-slate-100 relative group flex items-center justify-center h-48">
              <md-elevation></md-elevation>
              <p className="text-slate-400 font-bold uppercase tracking-widest group-hover:text-[#002147] transition-colors text-center">
                5.1 Surface with <br/> Dynamic Elevation
              </p>
            </div>
            
            {/* Progress Demo */}
            <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 flex flex-col justify-center gap-10">
              <div className="space-y-2">
                <md-linear-progress indeterminate></md-linear-progress>
                <span className="text-[10px] font-bold text-slate-400 uppercase block text-center">5.2 Linear Progress</span>
              </div>
              <div className="flex items-center gap-10 justify-center">
                <div className="flex flex-col items-center gap-2">
                  <md-circular-progress indeterminate></md-circular-progress>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">5.3 Circular</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <md-circular-progress value="0.7"></md-circular-progress>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">5.4 Static</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <md-circular-progress four-color indeterminate></md-circular-progress>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">5.5 4-Color</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Branding ... */}
    </div>
  );
};

// Helper Components
interface SectionHeaderProps {
  number: string;
  icon: React.ReactElement;
  title: string;
  description: string;
}

const SectionHeader = ({ number, icon, title, description }: SectionHeaderProps) => (
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-2xl bg-[#002147] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0 relative overflow-hidden">
      <div className="absolute top-0 left-0 bg-white/10 px-1.5 py-0.5 text-[8px] font-black">{number}</div>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <div>
      <h3 className="text-2xl font-black text-[#002147] tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium">{description}</p>
    </div>
  </div>
);
