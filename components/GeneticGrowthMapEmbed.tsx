/**
 * Genetic Growth Map - Google Maps Style Embedded Visualization
 * Interactive pan/zoom map showing referral network growth
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Navigation, MapPin, Users, TrendingUp } from 'lucide-react';

// Geographic-style node data for Kediri area
interface MapNode {
  id: string;
  name: string;
  type: 'origin' | 'primary' | 'secondary' | 'tertiary';
  facility: string;
  patients: number;
  lat: number; // Simulated latitude
  lng: number; // Simulated longitude
  connections: string[];
}

const mapNodes: MapNode[] = [
  {
    id: 'origin',
    name: 'RSIA Melinda Kediri',
    type: 'origin',
    facility: 'RS Ibu & Anak',
    patients: 1250,
    lat: 50,
    lng: 50,
    connections: ['p1', 'p2', 'p3', 'p4']
  },
  {
    id: 'p1',
    name: 'RS Baptis Kediri',
    type: 'primary',
    facility: 'RS Umum',
    patients: 420,
    lat: 35,
    lng: 30,
    connections: ['s1', 's2']
  },
  {
    id: 'p2',
    name: 'RSUD Gambiran',
    type: 'primary',
    facility: 'RS Daerah',
    patients: 380,
    lat: 65,
    lng: 30,
    connections: ['s3', 's4']
  },
  {
    id: 'p3',
    name: 'Puskesmas Balowerti',
    type: 'primary',
    facility: 'Puskesmas',
    patients: 280,
    lat: 25,
    lng: 70,
    connections: ['s5']
  },
  {
    id: 'p4',
    name: 'Klinik Pratama Sehat',
    type: 'primary',
    facility: 'Klinik',
    patients: 170,
    lat: 75,
    lng: 70,
    connections: ['s6']
  },
  {
    id: 's1',
    name: 'Klinik Bersalin Harapan',
    type: 'secondary',
    facility: 'Klinik Bersalin',
    patients: 95,
    lat: 20,
    lng: 15,
    connections: ['t1']
  },
  {
    id: 's2',
    name: 'Praktek Bidan Siti',
    type: 'secondary',
    facility: 'Praktek Mandiri',
    patients: 65,
    lat: 38,
    lng: 10,
    connections: []
  },
  {
    id: 's3',
    name: 'RS Bhayangkara',
    type: 'secondary',
    facility: 'RS Umum',
    patients: 125,
    lat: 80,
    lng: 15,
    connections: ['t2']
  },
  {
    id: 's4',
    name: 'Klinik Keluarga',
    type: 'secondary',
    facility: 'Klinik',
    patients: 88,
    lat: 70,
    lng: 10,
    connections: []
  },
  {
    id: 's5',
    name: 'Posyandu Melati',
    type: 'secondary',
    facility: 'Posyandu',
    patients: 52,
    lat: 10,
    lng: 85,
    connections: []
  },
  {
    id: 's6',
    name: 'Klinik dr. Ahmad',
    type: 'secondary',
    facility: 'Klinik Pratama',
    patients: 78,
    lat: 85,
    lng: 85,
    connections: []
  },
  {
    id: 't1',
    name: 'Bidan Desa A',
    type: 'tertiary',
    facility: 'Bidan Desa',
    patients: 28,
    lat: 8,
    lng: 5,
    connections: []
  },
  {
    id: 't2',
    name: 'Praktek dr. Budi',
    type: 'tertiary',
    facility: 'Praktek Dokter',
    patients: 35,
    lat: 92,
    lng: 5,
    connections: []
  }
];

const getMarkerColor = (type: MapNode['type']) => {
  switch (type) {
    case 'origin':
      return { bg: '#E03D00', border: '#B83000', shadow: 'rgba(224, 61, 0, 0.4)' };
    case 'primary':
      return { bg: '#002147', border: '#001133', shadow: 'rgba(0, 33, 71, 0.4)' };
    case 'secondary':
      return { bg: '#4A90E2', border: '#2E5A8E', shadow: 'rgba(74, 144, 226, 0.4)' };
    case 'tertiary':
      return { bg: '#7FB3D5', border: '#5A8AB0', shadow: 'rgba(127, 179, 213, 0.4)' };
  }
};

const getMarkerSize = (type: MapNode['type']) => {
  switch (type) {
    case 'origin':
      return 16;
    case 'primary':
      return 12;
    case 'secondary':
      return 10;
    case 'tertiary':
      return 8;
  }
};

export const GeneticGrowthMapEmbed: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const totalFaskes = mapNodes.length;
  const totalPatients = mapNodes.reduce((sum, node) => sum + node.patients, 0);
  const totalConnections = mapNodes.reduce((sum, node) => sum + node.connections.length, 0);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full'} bg-slate-100 rounded-2xl overflow-hidden`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-200 overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background (Map-like) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#grid)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-major)" />
        </svg>

        {/* Panned/Zoomed Content */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            width: '100%',
            height: '100%',
            position: 'absolute'
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Connection Lines */}
            {mapNodes.map(node =>
              node.connections.map(targetId => {
                const target = mapNodes.find(n => n.id === targetId);
                if (!target) return null;

                return (
                  <motion.line
                    key={`line-${node.id}-${targetId}`}
                    x1={node.lng}
                    y1={node.lat}
                    x2={target.lng}
                    y2={target.lat}
                    stroke={selectedNode?.id === node.id || selectedNode?.id === targetId ? '#E03D00' : '#64748B'}
                    strokeWidth={selectedNode?.id === node.id || selectedNode?.id === targetId ? 0.4 : 0.25}
                    strokeOpacity={0.6}
                    strokeDasharray="1,1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                );
              })
            )}

            {/* Markers */}
            {mapNodes.map(node => {
              const colors = getMarkerColor(node.type);
              const size = getMarkerSize(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g key={node.id}>
                  {/* Pulse effect for origin */}
                  {node.type === 'origin' && (
                    <motion.circle
                      cx={node.lng}
                      cy={node.lat}
                      r={size * 0.15}
                      fill={colors.bg}
                      opacity={0.3}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={node.lng}
                      cy={node.lat}
                      r={size * 0.12}
                      fill="none"
                      stroke="#E03D00"
                      strokeWidth="0.2"
                    />
                  )}

                  {/* Marker Pin */}
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                  >
                    {/* Pin shape */}
                    <path
                      d={`M ${node.lng} ${node.lat - size * 0.15}
                          Q ${node.lng - size * 0.08} ${node.lat - size * 0.1}, ${node.lng - size * 0.08} ${node.lat}
                          Q ${node.lng - size * 0.08} ${node.lat + size * 0.05}, ${node.lng} ${node.lat + size * 0.15}
                          Q ${node.lng + size * 0.08} ${node.lat + size * 0.05}, ${node.lng + size * 0.08} ${node.lat}
                          Q ${node.lng + size * 0.08} ${node.lat - size * 0.1}, ${node.lng} ${node.lat - size * 0.15} Z`}
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth="0.15"
                      filter={`drop-shadow(0 0.2px 0.5px ${colors.shadow})`}
                    />

                    {/* Inner circle */}
                    <circle
                      cx={node.lng}
                      cy={node.lat - size * 0.06}
                      r={size * 0.05}
                      fill="white"
                      opacity="0.9"
                    />
                  </g>

                  {/* Label (visible on zoom) */}
                  {zoom > 1.2 && (
                    <text
                      x={node.lng}
                      y={node.lat + size * 0.2}
                      textAnchor="middle"
                      fontSize={node.type === 'origin' ? '1.2' : '0.9'}
                      fontWeight={node.type === 'origin' ? '700' : '500'}
                      fill="#1E293B"
                      className="pointer-events-none select-none"
                      style={{ textShadow: '0 0 2px white' }}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.3, 3))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
            title="Zoom In"
          >
            <ZoomIn size={18} className="text-slate-700" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
            title="Zoom Out"
          >
            <ZoomOut size={18} className="text-slate-700" />
          </button>
          <button
            onClick={resetView}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
            title="Reset View"
          >
            <Navigation size={18} className="text-slate-700" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} className="text-slate-700" /> : <Maximize2 size={18} className="text-slate-700" />}
          </button>
        </div>

        {/* Stats Overlay (Top Left) */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#E03D00] rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Network Growth</div>
              <div className="text-lg font-bold text-slate-800">Genetic Map</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-8">
              <span className="text-slate-600">Faskes:</span>
              <span className="font-bold text-slate-800">{totalFaskes}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-slate-600">Pasien:</span>
              <span className="font-bold text-[#E03D00]">{totalPatients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-slate-600">Koneksi:</span>
              <span className="font-bold text-[#002147]">{totalConnections}</span>
            </div>
          </div>
        </div>

        {/* Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">Legend</div>
          <div className="space-y-1.5">
            {[
              { type: 'origin' as const, label: 'Faskes Asal' },
              { type: 'primary' as const, label: 'Primer' },
              { type: 'secondary' as const, label: 'Sekunder' },
              { type: 'tertiary' as const, label: 'Tersier' }
            ].map(({ type, label }) => {
              const colors = getMarkerColor(type);
              return (
                <div key={type} className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: colors.bg }} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-slate-200">
          <div className="text-xs text-slate-600 space-y-0.5">
            <div>🖱️ <span className="font-semibold">Drag</span> to pan</div>
            <div>🔍 <span className="font-semibold">Scroll</span> to zoom</div>
            <div>📍 <span className="font-semibold">Click pin</span> for info</div>
          </div>
        </div>
      </div>

      {/* Selected Node Info Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white to-slate-50 border-t-2 border-slate-300 p-6 shadow-xl"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Nama Faskes</div>
              <div className="text-lg font-bold text-slate-800">{selectedNode.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Jenis</div>
              <div className="text-sm font-semibold text-slate-700">{selectedNode.facility}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Total Pasien</div>
              <div className="text-2xl font-bold text-[#E03D00]">{selectedNode.patients.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Koneksi</div>
              <div className="text-2xl font-bold text-[#002147]">{selectedNode.connections.length}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
