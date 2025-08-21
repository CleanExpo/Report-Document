'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { Room, HVACAssessment } from '@/types/database';

interface HVACAnalyzerProps {
  claimId: string;
  rooms: Room[];
  hvacAssessment?: HVACAssessment;
  onAssessmentUpdate: (assessment: HVACAssessment) => Promise<void>;
  damageTypes: string[];
}

interface HVACZone {
  id: string;
  name: string;
  rooms: string[]; // Room IDs
  returnAirLocation: { x: number; y: number };
  supplyVents: { id: string; roomId: string; x: number; y: number; contaminated: boolean }[];
  contaminationLevel: 'none' | 'low' | 'medium' | 'high' | 'severe';
  airflowDirection: 'supply' | 'return' | 'mixed';
  notes: string;
}

interface ContaminationPath {
  from: { type: 'room' | 'vent' | 'return'; id: string };
  to: { type: 'room' | 'vent' | 'return'; id: string };
  contaminationType: string[];
  severity: 'low' | 'medium' | 'high';
  likelihood: 'possible' | 'probable' | 'confirmed';
  timeframe: 'immediate' | 'hours' | 'days' | 'weeks';
}

export function HVACAnalyzer({
  claimId,
  rooms,
  hvacAssessment,
  onAssessmentUpdate,
  damageTypes
}: HVACAnalyzerProps) {
  const [zones, setZones] = useState<HVACZone[]>([]);
  const [contaminationPaths, setContaminationPaths] = useState<ContaminationPath[]>([]);
  const [selectedZone, setSelectedZone] = useState<HVACZone | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [systemType, setSystemType] = useState<HVACAssessment['systemType']>(
    hvacAssessment?.systemType || 'ducted'
  );
  const [contamination, setContamination] = useState(
    hvacAssessment?.contamination || {
      detected: false,
      type: [],
      extent: 'localized',
      affectedZones: []
    }
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [dragMode, setDragMode] = useState<'none' | 'supply' | 'return'>('none');

  // Initialize zones from rooms if available
  useEffect(() => {
    if (zones.length === 0 && rooms.length > 0) {
      // Group rooms by HVAC zone or create default zones
      const roomsByZone = rooms.reduce((acc, room) => {
        const zoneKey = room.ventilation.hvacZone || 'default';
        if (!acc[zoneKey]) {
          acc[zoneKey] = [];
        }
        acc[zoneKey].push(room.id);
        return acc;
      }, {} as { [key: string]: string[] });

      const initialZones: HVACZone[] = Object.entries(roomsByZone).map(([zoneName, roomIds], index) => ({
        id: `zone-${index}`,
        name: zoneName === 'default' ? `Zone ${index + 1}` : zoneName,
        rooms: roomIds,
        returnAirLocation: { x: 100 + index * 200, y: 50 },
        supplyVents: roomIds.map((roomId, ventIndex) => ({
          id: `vent-${roomId}-${ventIndex}`,
          roomId,
          x: 150 + index * 200 + (ventIndex % 3) * 50,
          y: 150 + Math.floor(ventIndex / 3) * 100,
          contaminated: false
        })),
        contaminationLevel: 'none',
        airflowDirection: 'mixed',
        notes: ''
      }));

      setZones(initialZones);
    }
  }, [rooms, zones.length]);

  // Draw HVAC system diagram
  useEffect(() => {
    if (canvasRef.current) {
      drawHVACDiagram();
    }
  }, [zones, contaminationPaths, contamination]);

  const drawHVACDiagram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw contamination paths first (behind other elements)
    contaminationPaths.forEach(path => {
      drawContaminationPath(ctx, path);
    });

    // Draw zones
    zones.forEach(zone => {
      drawZone(ctx, zone);
    });

    // Draw legend
    drawLegend(ctx);
  }, [zones, contaminationPaths]);

  const drawZone = (ctx: CanvasRenderingContext2D, zone: HVACZone) => {
    const zoneColor = getContaminationColor(zone.contaminationLevel);
    
    // Calculate zone boundary
    const zoneRooms = rooms.filter(room => zone.rooms.includes(room.id));
    const minX = Math.min(...zone.supplyVents.map(v => v.x)) - 30;
    const maxX = Math.max(...zone.supplyVents.map(v => v.x)) + 30;
    const minY = Math.min(zone.returnAirLocation.y, ...zone.supplyVents.map(v => v.y)) - 30;
    const maxY = Math.max(zone.returnAirLocation.y, ...zone.supplyVents.map(v => v.y)) + 30;

    // Draw zone boundary
    ctx.strokeStyle = zoneColor.border;
    ctx.fillStyle = zoneColor.background;
    ctx.lineWidth = 2;
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // Draw zone label
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zone.name, (minX + maxX) / 2, minY - 10);

    // Draw return air location
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(zone.returnAirLocation.x, zone.returnAirLocation.y, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', zone.returnAirLocation.x, zone.returnAirLocation.y + 3);

    // Draw supply vents
    zone.supplyVents.forEach(vent => {
      ctx.fillStyle = vent.contaminated ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.rect(vent.x - 8, vent.y - 8, 16, 16);
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw airflow direction
      if (zone.airflowDirection === 'supply' || zone.airflowDirection === 'mixed') {
        drawArrow(ctx, zone.returnAirLocation.x, zone.returnAirLocation.y, vent.x, vent.y, '#3b82f6');
      }
    });

    // Draw room labels
    zoneRooms.forEach((room, index) => {
      const vent = zone.supplyVents.find(v => v.roomId === room.id);
      if (vent) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, vent.x, vent.y + 25);
      }
    });
  };

  const drawContaminationPath = (ctx: CanvasRenderingContext2D, path: ContaminationPath) => {
    const fromPos = getPositionFromPath(path.from);
    const toPos = getPositionFromPath(path.to);
    
    if (!fromPos || !toPos) return;

    const color = getSeverityColor(path.severity);
    const lineStyle = path.likelihood === 'confirmed' ? [] : [5, 5];

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash(lineStyle);
    
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset line dash
    
    // Draw contamination icon at midpoint
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(midX, midY, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const headlen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX - Math.cos(angle) * 20, toY - Math.sin(angle) * 20);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX - Math.cos(angle) * 20, toY - Math.sin(angle) * 20);
    ctx.lineTo(toX - Math.cos(angle - Math.PI / 6) * headlen - Math.cos(angle) * 20, 
               toY - Math.sin(angle - Math.PI / 6) * headlen - Math.sin(angle) * 20);
    ctx.lineTo(toX - Math.cos(angle + Math.PI / 6) * headlen - Math.cos(angle) * 20, 
               toY - Math.sin(angle + Math.PI / 6) * headlen - Math.sin(angle) * 20);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendX = 20;
    const legendY = canvasSize.height - 120;
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX - 10, legendY - 10, 180, 110);
    ctx.strokeStyle = '#d1d5db';
    ctx.strokeRect(legendX - 10, legendY - 10, 180, 110);

    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', legendX, legendY);

    // Return air
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 20, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.fillText('Return Air', legendX + 25, legendY + 25);

    // Supply vent - clean
    ctx.fillStyle = '#10b981';
    ctx.fillRect(legendX + 5, legendY + 35, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.fillText('Supply Vent (Clean)', legendX + 25, legendY + 45);

    // Supply vent - contaminated
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(legendX + 5, legendY + 55, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.fillText('Supply Vent (Contaminated)', legendX + 25, legendY + 65);

    // Airflow
    drawArrow(ctx, legendX + 5, legendY + 80, legendX + 20, legendY + 80, '#3b82f6');
    ctx.fillStyle = '#374151';
    ctx.fillText('Airflow Direction', legendX + 25, legendY + 85);
  };

  // Helper functions
  const getContaminationColor = (level: HVACZone['contaminationLevel']) => {
    switch (level) {
      case 'none': return { background: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' };
      case 'low': return { background: 'rgba(234, 179, 8, 0.1)', border: '#eab308' };
      case 'medium': return { background: 'rgba(249, 115, 22, 0.1)', border: '#f97316' };
      case 'high': return { background: 'rgba(239, 68, 68, 0.1)', border: '#ef4444' };
      case 'severe': return { background: 'rgba(153, 27, 27, 0.2)', border: '#991b1b' };
    }
  };

  const getSeverityColor = (severity: ContaminationPath['severity']) => {
    switch (severity) {
      case 'low': return '#eab308';
      case 'medium': return '#f97316';
      case 'high': return '#ef4444';
    }
  };

  const getPositionFromPath = (pathElement: ContaminationPath['from'] | ContaminationPath['to']) => {
    if (pathElement.type === 'return') {
      const zone = zones.find(z => z.id === pathElement.id);
      return zone?.returnAirLocation;
    } else if (pathElement.type === 'vent') {
      for (const zone of zones) {
        const vent = zone.supplyVents.find(v => v.id === pathElement.id);
        if (vent) return { x: vent.x, y: vent.y };
      }
    } else if (pathElement.type === 'room') {
      for (const zone of zones) {
        const vent = zone.supplyVents.find(v => v.roomId === pathElement.id);
        if (vent) return { x: vent.x, y: vent.y };
      }
    }
    return null;
  };

  // Analyze contamination spread
  const analyzeContaminationSpread = useCallback(() => {
    const newPaths: ContaminationPath[] = [];
    
    // Find contaminated rooms/vents
    const contaminatedVents = zones.flatMap(zone => 
      zone.supplyVents.filter(vent => vent.contaminated)
    );

    // Simulate contamination spread through HVAC system
    contaminatedVents.forEach(vent => {
      const zone = zones.find(z => z.supplyVents.includes(vent));
      if (!zone) return;

      // Return air contamination
      newPaths.push({
        from: { type: 'vent', id: vent.id },
        to: { type: 'return', id: zone.id },
        contaminationType: contamination.type,
        severity: 'medium',
        likelihood: 'probable',
        timeframe: 'hours'
      });

      // Cross-contamination to other vents in same zone
      zone.supplyVents.forEach(otherVent => {
        if (otherVent.id !== vent.id && !otherVent.contaminated) {
          newPaths.push({
            from: { type: 'return', id: zone.id },
            to: { type: 'vent', id: otherVent.id },
            contaminationType: contamination.type,
            severity: zone.contaminationLevel === 'high' ? 'high' : 'low',
            likelihood: 'possible',
            timeframe: 'days'
          });
        }
      });
    });

    setContaminationPaths(newPaths);

    // Update zone contamination levels
    const updatedZones = zones.map(zone => {
      const contaminatedVentsInZone = zone.supplyVents.filter(v => v.contaminated).length;
      const totalVentsInZone = zone.supplyVents.length;
      const contaminationRatio = contaminatedVentsInZone / totalVentsInZone;

      let newLevel: HVACZone['contaminationLevel'] = 'none';
      if (contaminationRatio > 0.75) newLevel = 'severe';
      else if (contaminationRatio > 0.5) newLevel = 'high';
      else if (contaminationRatio > 0.25) newLevel = 'medium';
      else if (contaminationRatio > 0) newLevel = 'low';

      return { ...zone, contaminationLevel: newLevel };
    });

    setZones(updatedZones);
  }, [zones, contamination.type]);

  // Generate recommendations
  const generateRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    // System shutdown recommendation
    if (contamination.detected) {
      recommendations.push('Immediately shut down HVAC system to prevent further contamination spread (IICRC S520 12.2.1)');
    }

    // Sealing recommendations
    if (contamination.extent !== 'localized') {
      recommendations.push('Seal all supply and return vents in affected zones (AS/NZS 4849.1:2003)');
    }

    // Professional cleaning
    const highContaminationZones = zones.filter(z => 
      z.contaminationLevel === 'high' || z.contaminationLevel === 'severe'
    );
    if (highContaminationZones.length > 0) {
      recommendations.push('Professional HVAC cleaning required by qualified technicians (IICRC S520 12.2.2)');
    }

    // Air quality testing
    if (damageTypes.includes('mould')) {
      recommendations.push('Conduct air quality testing in all connected zones (WHO guidelines)');
    }

    return recommendations;
  }, [contamination, zones, damageTypes]);

  // Canvas click handler
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (dragMode === 'supply') {
      // Add supply vent
      const zone = zones[0]; // For simplicity, add to first zone
      if (zone) {
        const newVent = {
          id: `vent-${Date.now()}`,
          roomId: zone.rooms[0] || '',
          x,
          y,
          contaminated: false
        };
        
        const updatedZones = zones.map(z => 
          z.id === zone.id 
            ? { ...z, supplyVents: [...z.supplyVents, newVent] }
            : z
        );
        setZones(updatedZones);
        setDragMode('none');
      }
    } else if (dragMode === 'return') {
      // Move return air location
      const zone = zones[0]; // For simplicity, modify first zone
      if (zone) {
        const updatedZones = zones.map(z =>
          z.id === zone.id
            ? { ...z, returnAirLocation: { x, y } }
            : z
        );
        setZones(updatedZones);
        setDragMode('none');
      }
    } else {
      // Check if clicking on existing vent to toggle contamination
      for (const zone of zones) {
        for (const vent of zone.supplyVents) {
          const distance = Math.sqrt((x - vent.x) ** 2 + (y - vent.y) ** 2);
          if (distance <= 15) {
            const updatedZones = zones.map(z =>
              z.id === zone.id
                ? {
                    ...z,
                    supplyVents: z.supplyVents.map(v =>
                      v.id === vent.id ? { ...v, contaminated: !v.contaminated } : v
                    )
                  }
                : z
            );
            setZones(updatedZones);
            
            // Update contamination detection
            const hasContamination = updatedZones.some(z =>
              z.supplyVents.some(v => v.contaminated)
            );
            if (hasContamination && !contamination.detected) {
              setContamination(prev => ({ ...prev, detected: true }));
            }
            return;
          }
        }
      }
    }
  };

  // Save assessment
  const saveAssessment = useCallback(async () => {
    const assessment: HVACAssessment = {
      systemType,
      contamination,
      airflow: {
        direction: zones[0]?.airflowDirection || 'mixed',
        velocity: 0, // Would be measured
        pressure: 0  // Would be measured
      },
      recommendations: {
        shutdown: contamination.detected,
        cleaning: zones.some(z => z.contaminationLevel === 'high' || z.contaminationLevel === 'severe'),
        replacement: zones.some(z => z.contaminationLevel === 'severe'),
        testing: damageTypes.includes('mould') || damageTypes.includes('smoke')
      },
      standards: ['IICRC S520 12.2.1', 'IICRC S520 12.2.2', 'AS/NZS 4849.1:2003']
    };

    await onAssessmentUpdate(assessment);
  }, [systemType, contamination, zones, damageTypes, onAssessmentUpdate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HVAC Contamination Analysis</h2>
          <p className="text-gray-600">Map contamination spread through ventilation systems</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowAnalysisModal(true)}>
            View Analysis
          </Button>
          <Button onClick={analyzeContaminationSpread}>
            Analyze Spread
          </Button>
          <Button onClick={saveAssessment}>
            Save Assessment
          </Button>
        </div>
      </div>

      {/* System Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">System Type</h3>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as HVACAssessment['systemType'])}
            >
              <option value="ducted">Ducted System</option>
              <option value="split">Split System</option>
              <option value="evaporative">Evaporative Cooling</option>
              <option value="central">Central Air</option>
              <option value="other">Other</option>
            </select>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Contamination Status</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contamination.detected}
                  onChange={(e) => setContamination(prev => ({ 
                    ...prev, 
                    detected: e.target.checked 
                  }))}
                  className="mr-2"
                />
                Contamination Detected
              </label>
              {contamination.detected && (
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={contamination.extent}
                  onChange={(e) => setContamination(prev => ({ 
                    ...prev, 
                    extent: e.target.value as HVACAssessment['contamination']['extent']
                  }))}
                >
                  <option value="localized">Localized</option>
                  <option value="zone">Zone-wide</option>
                  <option value="system_wide">System-wide</option>
                </select>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Tools</h3>
            <div className="space-y-2">
              <Button
                variant={dragMode === 'supply' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDragMode(dragMode === 'supply' ? 'none' : 'supply')}
                className="w-full"
              >
                Add Supply Vent
              </Button>
              <Button
                variant={dragMode === 'return' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDragMode(dragMode === 'return' ? 'none' : 'return')}
                className="w-full"
              >
                Move Return Air
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowZoneModal(true)}
                className="w-full"
              >
                Configure Zones
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* HVAC Diagram */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">System Diagram</h3>
            <div className="text-sm text-gray-600">
              {dragMode !== 'none' && (
                <span className="text-blue-600">
                  {dragMode === 'supply' ? 'Click to add supply vent' : 'Click to move return air location'}
                </span>
              )}
              {dragMode === 'none' && 'Click vents to toggle contamination status'}
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </Card>

      {/* Zone Details */}
      {zones.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{zone.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    zone.contaminationLevel === 'none' ? 'bg-green-100 text-green-800' :
                    zone.contaminationLevel === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    zone.contaminationLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                    zone.contaminationLevel === 'high' ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {zone.contaminationLevel} contamination
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Rooms:</span> {
                      zone.rooms.map(roomId => 
                        rooms.find(r => r.id === roomId)?.name || roomId
                      ).join(', ')
                    }
                  </div>
                  <div>
                    <span className="font-medium">Supply Vents:</span> {zone.supplyVents.length} 
                    ({zone.supplyVents.filter(v => v.contaminated).length} contaminated)
                  </div>
                  <div>
                    <span className="font-medium">Airflow:</span> {zone.airflowDirection}
                  </div>
                  {zone.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> {zone.notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <HVACAnalysisModal
          zones={zones}
          contaminationPaths={contaminationPaths}
          recommendations={generateRecommendations()}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}

      {/* Zone Configuration Modal */}
      {showZoneModal && (
        <ZoneConfigModal
          zones={zones}
          rooms={rooms}
          onZonesUpdate={setZones}
          onClose={() => setShowZoneModal(false)}
        />
      )}
    </div>
  );
}

// HVAC Analysis Modal
function HVACAnalysisModal({
  zones,
  contaminationPaths,
  recommendations,
  onClose
}: {
  zones: HVACZone[];
  contaminationPaths: ContaminationPath[];
  recommendations: string[];
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} title="HVAC Contamination Analysis" size="large">
      <div className="space-y-6">
        {/* Summary */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Analysis Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{zones.length}</div>
              <div className="text-sm text-gray-600">Total Zones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {zones.filter(z => z.contaminationLevel !== 'none').length}
              </div>
              <div className="text-sm text-gray-600">Affected Zones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {zones.reduce((sum, z) => sum + z.supplyVents.filter(v => v.contaminated).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Contaminated Vents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contaminationPaths.length}</div>
              <div className="text-sm text-gray-600">Spread Paths</div>
            </div>
          </div>
        </div>

        {/* Contamination Paths */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contamination Spread Paths</h4>
          {contaminationPaths.length === 0 ? (
            <p className="text-gray-500 text-sm">No contamination paths identified</p>
          ) : (
            <div className="space-y-2">
              {contaminationPaths.map((path, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {path.from.type} → {path.to.type}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {path.contaminationType.join(', ')} | {path.severity} severity | {path.likelihood} | {path.timeframe}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      path.severity === 'high' ? 'bg-red-100 text-red-800' :
                      path.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {path.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-sm">No specific recommendations at this time</p>
          ) : (
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">{rec}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Zone Configuration Modal
function ZoneConfigModal({
  zones,
  rooms,
  onZonesUpdate,
  onClose
}: {
  zones: HVACZone[];
  rooms: Room[];
  onZonesUpdate: (zones: HVACZone[]) => void;
  onClose: () => void;
}) {
  const [editingZones, setEditingZones] = useState<HVACZone[]>([...zones]);

  const handleSave = () => {
    onZonesUpdate(editingZones);
    onClose();
  };

  const addZone = () => {
    const newZone: HVACZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${editingZones.length + 1}`,
      rooms: [],
      returnAirLocation: { x: 100, y: 100 },
      supplyVents: [],
      contaminationLevel: 'none',
      airflowDirection: 'mixed',
      notes: ''
    };
    setEditingZones([...editingZones, newZone]);
  };

  const updateZone = (index: number, updates: Partial<HVACZone>) => {
    const newZones = [...editingZones];
    newZones[index] = { ...newZones[index], ...updates };
    setEditingZones(newZones);
  };

  const removeZone = (index: number) => {
    setEditingZones(editingZones.filter((_, i) => i !== index));
  };

  return (
    <Modal onClose={onClose} title="Configure HVAC Zones" size="large">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">HVAC Zones ({editingZones.length})</h4>
          <Button onClick={addZone}>Add Zone</Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {editingZones.map((zone, index) => (
            <Card key={zone.id}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <Input
                    value={zone.name}
                    onChange={(e) => updateZone(index, { name: e.target.value })}
                    className="font-medium"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeZone(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Airflow Direction
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={zone.airflowDirection}
                      onChange={(e) => updateZone(index, { airflowDirection: e.target.value as any })}
                    >
                      <option value="supply">Supply</option>
                      <option value="return">Return</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contamination Level
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={zone.contaminationLevel}
                      onChange={(e) => updateZone(index, { contaminationLevel: e.target.value as any })}
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rooms in Zone
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {rooms.map((room) => (
                      <label key={room.id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={zone.rooms.includes(room.id)}
                          onChange={(e) => {
                            const newRooms = e.target.checked
                              ? [...zone.rooms, room.id]
                              : zone.rooms.filter(id => id !== room.id);
                            updateZone(index, { rooms: newRooms });
                          }}
                          className="mr-2"
                        />
                        {room.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={2}
                    value={zone.notes}
                    onChange={(e) => updateZone(index, { notes: e.target.value })}
                    placeholder="Additional notes about this zone..."
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Zones
          </Button>
        </div>
      </div>
    </Modal>
  );
}