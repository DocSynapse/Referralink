/**
 * Genetic Growth Map - Real Kediri Map with Leaflet + OpenStreetMap
 * Interactive map showing referral network growth over actual Kediri geography
 */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, TrendingUp, MapPin, Users, Activity } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Kediri City Center Coordinates
const KEDIRI_CENTER: [number, number] = [-7.822840, 112.011864];

// Healthcare facilities in Kediri with real/approximate coordinates
interface HealthFacility {
  id: string;
  name: string;
  type: 'origin' | 'primary' | 'secondary' | 'tertiary';
  facility: string;
  patients: number;
  coordinates: [number, number]; // [lat, lng]
  connections: string[];
  address?: string;
}

const healthFacilities: HealthFacility[] = [
  {
    id: 'origin',
    name: 'RSIA Melinda Kediri',
    type: 'origin',
    facility: 'RS Ibu & Anak',
    patients: 1250,
    coordinates: [-7.822840, 112.011864], // Center of Kediri
    connections: ['p1', 'p2', 'p3', 'p4'],
    address: 'Jl. Brawijaya, Kediri'
  },
  {
    id: 'p1',
    name: 'RS Baptis Kediri',
    type: 'primary',
    facility: 'RS Umum',
    patients: 420,
    coordinates: [-7.810500, 111.995000], // North-West
    connections: ['s1', 's2'],
    address: 'Jl. Brigjen Katamso, Kediri'
  },
  {
    id: 'p2',
    name: 'RSUD Gambiran',
    type: 'primary',
    facility: 'RS Daerah',
    patients: 380,
    coordinates: [-7.835000, 111.995000], // South-West
    connections: ['s3', 's4'],
    address: 'Jl. Pahlawan Kusuma Bangsa, Kediri'
  },
  {
    id: 'p3',
    name: 'Puskesmas Balowerti',
    type: 'primary',
    facility: 'Puskesmas',
    patients: 280,
    coordinates: [-7.810000, 112.025000], // North-East
    connections: ['s5'],
    address: 'Kec. Kota, Kediri'
  },
  {
    id: 'p4',
    name: 'Klinik Pratama Sehat',
    type: 'primary',
    facility: 'Klinik',
    patients: 170,
    coordinates: [-7.835000, 112.025000], // South-East
    connections: ['s6'],
    address: 'Kec. Pesantren, Kediri'
  },
  {
    id: 's1',
    name: 'Klinik Bersalin Harapan',
    type: 'secondary',
    facility: 'Klinik Bersalin',
    patients: 95,
    coordinates: [-7.805000, 111.985000],
    connections: ['t1'],
    address: 'Kec. Mojoroto, Kediri'
  },
  {
    id: 's2',
    name: 'Praktek Bidan Siti',
    type: 'secondary',
    facility: 'Praktek Mandiri',
    patients: 65,
    coordinates: [-7.815000, 111.990000],
    connections: [],
    address: 'Kec. Mojoroto, Kediri'
  },
  {
    id: 's3',
    name: 'RS Bhayangkara',
    type: 'secondary',
    facility: 'RS Umum',
    patients: 125,
    coordinates: [-7.840000, 111.990000],
    connections: ['t2'],
    address: 'Jl. Kombes Pol. M. Duryat, Kediri'
  },
  {
    id: 's4',
    name: 'Klinik Keluarga',
    type: 'secondary',
    facility: 'Klinik',
    patients: 88,
    coordinates: [-7.838000, 111.998000],
    connections: [],
    address: 'Kec. Pesantren, Kediri'
  },
  {
    id: 's5',
    name: 'Posyandu Melati',
    type: 'secondary',
    facility: 'Posyandu',
    patients: 52,
    coordinates: [-7.808000, 112.030000],
    connections: [],
    address: 'Kec. Kota, Kediri'
  },
  {
    id: 's6',
    name: 'Klinik dr. Ahmad',
    type: 'secondary',
    facility: 'Klinik Pratama',
    patients: 78,
    coordinates: [-7.838000, 112.030000],
    connections: [],
    address: 'Kec. Pesantren, Kediri'
  },
  {
    id: 't1',
    name: 'Bidan Desa A',
    type: 'tertiary',
    facility: 'Bidan Desa',
    patients: 28,
    coordinates: [-7.802000, 111.978000],
    connections: [],
    address: 'Desa Bandar Lor, Kediri'
  },
  {
    id: 't2',
    name: 'Praktek dr. Budi',
    type: 'tertiary',
    facility: 'Praktek Dokter',
    patients: 35,
    coordinates: [-7.845000, 111.985000],
    connections: [],
    address: 'Kec. Pesantren, Kediri'
  }
];

// Custom marker icons with pin-style design
const createCustomIcon = (type: HealthFacility['type']) => {
  const colors: Record<HealthFacility['type'], string> = {
    origin: '#E03D00',
    primary: '#002147',
    secondary: '#4A90E2',
    tertiary: '#7FB3D5'
  };

  const sizes: Record<HealthFacility['type'], number> = {
    origin: 40,
    primary: 32,
    secondary: 28,
    tertiary: 24
  };

  const color = colors[type];
  const size = sizes[type];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${size * 0.6}px;
          height: ${size * 0.8}px;
          background: ${color};
          border: 3px solid white;
          border-radius: ${size * 0.3}px ${size * 0.3}px 0 0;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: ${size * 0.15}px solid transparent;
          border-right: ${size * 0.15}px solid transparent;
          border-top: ${size * 0.25}px solid ${color};
        "></div>
        <div style="
          position: absolute;
          bottom: ${size * 0.35}px;
          left: 50%;
          transform: translateX(-50%);
          width: ${size * 0.25}px;
          height: ${size * 0.25}px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

// Get line color and weight based on connection type
const getConnectionStyle = (fromType: HealthFacility['type']) => {
  switch (fromType) {
    case 'origin':
      return { color: '#E03D00', weight: 3, opacity: 0.7 };
    case 'primary':
      return { color: '#002147', weight: 2.5, opacity: 0.6 };
    case 'secondary':
      return { color: '#4A90E2', weight: 2, opacity: 0.5 };
    case 'tertiary':
      return { color: '#7FB3D5', weight: 1.5, opacity: 0.4 };
  }
};

export const GeneticGrowthMapLeaflet: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate totals
  const totalFaskes = healthFacilities.length;
  const totalPatients = healthFacilities.reduce((sum, f) => sum + f.patients, 0);
  const totalConnections = healthFacilities.reduce((sum, f) => sum + f.connections.length, 0);

  // Generate connection lines
  const connections = healthFacilities.flatMap(facility =>
    facility.connections.map(targetId => {
      const target = healthFacilities.find(f => f.id === targetId);
      if (!target) return null;

      return {
        positions: [facility.coordinates, target.coordinates] as [number, number][],
        style: getConnectionStyle(facility.type),
        id: `${facility.id}-${targetId}`
      };
    }).filter(Boolean)
  ) as Array<{ positions: [number, number][]; style: any; id: string }>;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full'} bg-slate-100 rounded-2xl overflow-hidden`}>
      {/* Map Container */}
      <div className="relative w-full h-[600px]">
        <MapContainer
          center={KEDIRI_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Connection Lines */}
          {connections.map(conn => (
            <Polyline
              key={conn.id}
              positions={conn.positions}
              pathOptions={{
                color: conn.style.color,
                weight: conn.style.weight,
                opacity: conn.style.opacity,
                dashArray: '10, 10'
              }}
            />
          ))}

          {/* Healthcare Facility Markers */}
          {healthFacilities.map(facility => (
            <Marker
              key={facility.id}
              position={facility.coordinates}
              icon={createCustomIcon(facility.type)}
              eventHandlers={{
                click: () => setSelectedFacility(facility)
              }}
            >
              <Popup className="sentra-popup">
                <div className="min-w-[260px] p-1">
                  <div className="bg-[#002147] p-3 rounded-t-lg mb-3">
                    <div className="text-xs font-black text-[#E03D00] mb-1">
                      SENTRA FASKES
                    </div>
                    <h3 className="font-black text-lg text-white leading-tight">{facility.name}</h3>
                    {facility.address && (
                      <p className="text-xs text-white/80 mt-1 font-bold">{facility.address}</p>
                    )}
                  </div>
                  <div className="space-y-2 px-1">
                    <div className="bg-white border-2 border-[#002147] px-3 py-2 rounded-lg">
                      <div className="text-xs font-black text-[#002147]">KATEGORI</div>
                      <div className="text-sm font-black text-[#E03D00]">{facility.facility}</div>
                    </div>
                    <div className="bg-[#E03D00] px-3 py-2 rounded-lg">
                      <div className="text-xs font-black text-white">PASIEN</div>
                      <div className="text-2xl font-black text-white tabular-nums">{facility.patients.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#002147] px-3 py-2 rounded-lg">
                      <div className="text-xs font-black text-white">RUJUKAN</div>
                      <div className="text-2xl font-black text-[#E03D00] tabular-nums">{facility.connections.length}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Stats Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-[1000] bg-[#002147] rounded-2xl p-5 shadow-2xl border-4 border-[#E03D00]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-[#E03D00] rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp size={28} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <div className="text-xs text-[#E03D00] font-extrabold">SENTRA NETWORK</div>
              <div className="text-3xl font-black text-white">KEDIRI</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-sm font-extrabold text-white mb-1">FASKES</div>
              <div className="text-4xl font-black text-[#E03D00]">{totalFaskes}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-sm font-extrabold text-white mb-1">PASIEN</div>
              <div className="text-4xl font-black text-[#E03D00]">{totalPatients.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-sm font-extrabold text-white mb-1">RUJUKAN</div>
              <div className="text-4xl font-black text-[#E03D00]">{totalConnections}</div>
            </div>
          </div>
        </div>

        {/* Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-2xl p-4 shadow-2xl border-4 border-[#002147]">
          <div className="text-sm font-black text-[#002147] mb-3">TINGKAT RUJUKAN</div>
          <div className="space-y-2">
            {[
              { type: 'origin' as const, label: 'FASKES ASAL', color: '#E03D00' },
              { type: 'primary' as const, label: 'TIER 1 - PRIMER', color: '#002147' },
              { type: 'secondary' as const, label: 'TIER 2 - SEKUNDER', color: '#4A90E2' },
              { type: 'tertiary' as const, label: 'TIER 3 - TERSIER', color: '#7FB3D5' }
            ].map(({ type, label, color }) => (
              <div key={type} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 3px 10px ${color}80`
                  }}
                />
                <span className="text-xs font-extrabold" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-[#E03D00] rounded-2xl px-4 py-3 shadow-2xl border-4 border-[#002147]">
          <div className="text-xs font-black text-white mb-2">CARA PAKAI</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🖱️</span>
              <span className="text-white font-bold text-sm">DRAG PETA</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔍</span>
              <span className="text-white font-bold text-sm">SCROLL ZOOM</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📍</span>
              <span className="text-white font-bold text-sm">KLIK DETAIL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Facility Info Panel */}
      {selectedFacility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#002147] border-t-8 border-[#E03D00] p-7 shadow-2xl"
        >
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="text-sm font-black text-[#E03D00] mb-2">
                DETAIL FASKES SENTRA
              </div>
              <div className="text-3xl font-black text-white">{selectedFacility.name}</div>
              {selectedFacility.address && (
                <div className="text-sm text-white/80 mt-2 font-bold flex items-center gap-2">
                  <MapPin size={16} className="text-[#E03D00]" />
                  {selectedFacility.address}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-5">
              <div className="bg-white rounded-xl p-5 border-4 border-[#E03D00]/30">
                <div className="text-xs font-black text-[#002147] mb-2">KATEGORI</div>
                <div className="text-lg font-black text-[#E03D00]">{selectedFacility.facility}</div>
              </div>

              <div className="bg-[#E03D00] rounded-xl p-5 border-4 border-white/20">
                <div className="text-xs font-black text-white mb-2 flex items-center gap-1">
                  <Users size={14} strokeWidth={3} />
                  TOTAL PASIEN
                </div>
                <div className="text-4xl font-black text-white tabular-nums">{selectedFacility.patients.toLocaleString()}</div>
              </div>

              <div className="bg-white rounded-xl p-5 border-4 border-[#E03D00]/30">
                <div className="text-xs font-black text-[#002147] mb-2 flex items-center gap-1">
                  <Activity size={14} strokeWidth={3} />
                  RUJUKAN AKTIF
                </div>
                <div className="text-4xl font-black text-[#E03D00] tabular-nums">{selectedFacility.connections.length}</div>
              </div>

              <div className="bg-green-500 rounded-xl p-5 border-4 border-white/20">
                <div className="text-xs font-black text-white mb-2">STATUS</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-lg font-black text-white">AKTIF</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
