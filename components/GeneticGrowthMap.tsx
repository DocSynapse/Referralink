/**
 * Genetic Growth Map - Visualisasi Jaringan Rujukan
 * Menampilkan "peta saraf" bagaimana satu link rujukan menyebar menjadi jaringan faskes yang luas
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, RefreshCw, ZoomIn, ZoomOut, Activity, Users, Building2 } from 'lucide-react';

// Network Node Interface
interface NetworkNode {
  id: string;
  label: string;
  type: 'origin' | 'primary' | 'secondary' | 'tertiary';
  faskes: string;
  patients: number;
  x: number;
  y: number;
  connections: string[];
}

// Generate mock network data
const generateNetworkData = (): NetworkNode[] => {
  const nodes: NetworkNode[] = [
    // Origin node (center)
    {
      id: 'origin',
      label: 'RSIA Melinda Kediri',
      type: 'origin',
      faskes: 'Rumah Sakit Ibu & Anak',
      patients: 1250,
      x: 400,
      y: 300,
      connections: ['p1', 'p2', 'p3', 'p4']
    },
    // Primary nodes (direct referrals)
    {
      id: 'p1',
      label: 'RS Baptis Kediri',
      type: 'primary',
      faskes: 'Rumah Sakit Umum',
      patients: 420,
      x: 250,
      y: 150,
      connections: ['s1', 's2']
    },
    {
      id: 'p2',
      label: 'RSUD Gambiran',
      type: 'primary',
      faskes: 'Rumah Sakit Daerah',
      patients: 380,
      x: 550,
      y: 150,
      connections: ['s3', 's4']
    },
    {
      id: 'p3',
      label: 'Puskesmas Balowerti',
      type: 'primary',
      faskes: 'Puskesmas',
      patients: 280,
      x: 200,
      y: 450,
      connections: ['s5']
    },
    {
      id: 'p4',
      label: 'Klinik Pratama Sehat',
      type: 'primary',
      faskes: 'Klinik',
      patients: 170,
      x: 600,
      y: 450,
      connections: ['s6']
    },
    // Secondary nodes
    {
      id: 's1',
      label: 'Klinik Bersalin Harapan',
      type: 'secondary',
      faskes: 'Klinik Bersalin',
      patients: 95,
      x: 150,
      y: 80,
      connections: ['t1']
    },
    {
      id: 's2',
      label: 'Praktek Bidan Siti',
      type: 'secondary',
      faskes: 'Praktek Mandiri',
      patients: 65,
      x: 280,
      y: 50,
      connections: []
    },
    {
      id: 's3',
      label: 'RS Bhayangkara',
      type: 'secondary',
      faskes: 'Rumah Sakit',
      patients: 125,
      x: 650,
      y: 80,
      connections: ['t2']
    },
    {
      id: 's4',
      label: 'Klinik Keluarga',
      type: 'secondary',
      faskes: 'Klinik',
      patients: 88,
      x: 580,
      y: 50,
      connections: []
    },
    {
      id: 's5',
      label: 'Posyandu Melati',
      type: 'secondary',
      faskes: 'Posyandu',
      patients: 52,
      x: 100,
      y: 520,
      connections: []
    },
    {
      id: 's6',
      label: 'Klinik dr. Ahmad',
      type: 'secondary',
      faskes: 'Klinik Pratama',
      patients: 78,
      x: 680,
      y: 520,
      connections: []
    },
    // Tertiary nodes
    {
      id: 't1',
      label: 'Bidan Desa A',
      type: 'tertiary',
      faskes: 'Bidan Desa',
      patients: 28,
      x: 80,
      y: 20,
      connections: []
    },
    {
      id: 't2',
      label: 'Praktek dr. Budi',
      type: 'tertiary',
      faskes: 'Praktek Dokter',
      patients: 35,
      x: 720,
      y: 20,
      connections: []
    }
  ];

  return nodes;
};

// Color mapping for node types
const getNodeColor = (type: NetworkNode['type']) => {
  switch (type) {
    case 'origin':
      return { fill: '#E03D00', stroke: '#B83000', glow: '#FF6B35' };
    case 'primary':
      return { fill: '#002147', stroke: '#001133', glow: '#0066CC' };
    case 'secondary':
      return { fill: '#4A90E2', stroke: '#2E5A8E', glow: '#6DB3FF' };
    case 'tertiary':
      return { fill: '#7FB3D5', stroke: '#5A8AB0', glow: '#A5D8FF' };
  }
};

// Get node size based on type and patients
const getNodeSize = (type: NetworkNode['type'], patients: number) => {
  const baseSize = {
    origin: 32,
    primary: 24,
    secondary: 18,
    tertiary: 14
  };
  const scaleFactor = Math.log10(patients + 1) / 4;
  return baseSize[type] * (1 + scaleFactor * 0.3);
};

interface GeneticGrowthMapProps {
  onClose: () => void;
}

export const GeneticGrowthMap: React.FC<GeneticGrowthMapProps> = ({ onClose }) => {
  const [nodes] = useState<NetworkNode[]>(generateNetworkData());
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate total stats
  const totalFaskes = nodes.length;
  const totalPatients = nodes.reduce((sum, node) => sum + node.patients, 0);
  const totalConnections = nodes.reduce((sum, node) => sum + node.connections.length, 0);

  // Pulse animation for connections
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002147] to-[#003875] text-white px-8 py-6 border-b border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Genetic Growth Map</h2>
              <p className="text-slate-200 text-sm">Visualisasi Jaringan Rujukan Real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.2))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Toggle Animation"
              >
                <Activity size={18} className={isAnimating ? 'animate-pulse' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={16} />
                <span className="text-xs uppercase tracking-wider opacity-80">Total Faskes</span>
              </div>
              <div className="text-2xl font-bold">{totalFaskes}</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} />
                <span className="text-xs uppercase tracking-wider opacity-80">Total Pasien</span>
              </div>
              <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={16} />
                <span className="text-xs uppercase tracking-wider opacity-80">Koneksi Aktif</span>
              </div>
              <div className="text-2xl font-bold">{totalConnections}</div>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="relative h-[calc(100%-240px)] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
            className="absolute inset-0"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
          >
            {/* Gradient Definitions */}
            <defs>
              {nodes.map((node) => {
                const colors = getNodeColor(node.type);
                return (
                  <radialGradient key={`gradient-${node.id}`} id={`gradient-${node.id}`}>
                    <stop offset="0%" stopColor={colors.fill} stopOpacity="1" />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.9" />
                  </radialGradient>
                );
              })}

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection Lines */}
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;

                return (
                  <motion.line
                    key={`line-${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={selectedNode?.id === node.id || selectedNode?.id === targetId ? '#E03D00' : '#94A3B8'}
                    strokeWidth={selectedNode?.id === node.id || selectedNode?.id === targetId ? 2.5 : 1.5}
                    strokeOpacity={0.4}
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 0.4,
                      strokeDashoffset: isAnimating ? [0, -10] : 0
                    }}
                    transition={{
                      pathLength: { duration: 1.5, ease: 'easeInOut' },
                      strokeDashoffset: isAnimating
                        ? { duration: 2, repeat: Infinity, ease: 'linear' }
                        : { duration: 0 }
                    }}
                  />
                );
              })
            )}

            {/* Network Nodes */}
            {nodes.map((node, index) => {
              const colors = getNodeColor(node.type);
              const size = getNodeSize(node.type, node.patients);
              const isSelected = selectedNode?.id === node.id;

              return (
                <motion.g
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', damping: 15 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setSelectedNode(node)}
                >
                  {/* Glow effect for origin node */}
                  {node.type === 'origin' && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={size + 8}
                      fill={colors.glow}
                      opacity={0.3}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={size + 6}
                      fill="none"
                      stroke="#E03D00"
                      strokeWidth="2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    />
                  )}

                  {/* Main node circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={`url(#gradient-${node.id})`}
                    stroke={colors.stroke}
                    strokeWidth="2"
                    filter={node.type === 'origin' ? 'url(#glow)' : undefined}
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring', damping: 15 }}
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + size + 18}
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize={node.type === 'origin' ? '13' : node.type === 'primary' ? '11' : '9'}
                    fontWeight={node.type === 'origin' ? '700' : '500'}
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Patient count badge */}
                  {node.type !== 'tertiary' && (
                    <g>
                      <rect
                        x={node.x - 20}
                        y={node.y - size - 20}
                        width="40"
                        height="16"
                        rx="8"
                        fill="white"
                        stroke={colors.stroke}
                        strokeWidth="1"
                      />
                      <text
                        x={node.x}
                        y={node.y - size - 9}
                        textAnchor="middle"
                        fill={colors.fill}
                        fontSize="10"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {node.patients}
                      </text>
                    </g>
                  )}
                </motion.g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
              Jenis Faskes
            </div>
            <div className="space-y-2">
              {[
                { type: 'origin' as const, label: 'Faskes Asal' },
                { type: 'primary' as const, label: 'Rujukan Primer' },
                { type: 'secondary' as const, label: 'Rujukan Sekunder' },
                { type: 'tertiary' as const, label: 'Rujukan Tersier' }
              ].map(({ type, label }) => {
                const colors = getNodeColor(type);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                    />
                    <span className="text-xs text-slate-600">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Info Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-white to-slate-50 border-t-2 border-slate-300 p-6 shadow-2xl"
            >
              <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nama Faskes</div>
                  <div className="text-lg font-bold text-slate-800">{selectedNode.label}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Jenis</div>
                  <div className="text-sm font-semibold text-slate-700">{selectedNode.faskes}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Pasien</div>
                  <div className="text-2xl font-bold text-[#E03D00]">
                    {selectedNode.patients.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Koneksi</div>
                  <div className="text-2xl font-bold text-[#002147]">{selectedNode.connections.length}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
