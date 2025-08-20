'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { Room, Damage, DamageFormData, RoomFormData } from '@/types/database';

interface DamageAssessmentGridProps {
  claimId: string;
  rooms: Room[];
  damages: Damage[];
  onRoomCreate: (room: RoomFormData) => Promise<void>;
  onRoomUpdate: (roomId: string, room: Partial<Room>) => Promise<void>;
  onRoomDelete: (roomId: string) => Promise<void>;
  onDamageCreate: (roomId: string, damage: DamageFormData) => Promise<void>;
  onDamageUpdate: (damageId: string, damage: Partial<Damage>) => Promise<void>;
  onDamageDelete: (damageId: string) => Promise<void>;
}

export function DamageAssessmentGrid({
  claimId,
  rooms,
  damages,
  onRoomCreate,
  onRoomUpdate,
  onRoomDelete,
  onDamageCreate,
  onDamageUpdate,
  onDamageDelete
}: DamageAssessmentGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDamage, setSelectedDamage] = useState<Damage | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'floor_plan'>('grid');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get damages for a specific room
  const getRoomDamages = useCallback((roomId: string) => {
    return damages.filter(damage => damage.roomId === roomId);
  }, [damages]);

  // Calculate severity color
  const getSeverityColor = (severity: Damage['severity']) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'moderate': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'severe': return 'bg-red-100 border-red-300 text-red-800';
      case 'catastrophic': return 'bg-red-200 border-red-500 text-red-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Calculate room damage summary
  const getRoomSummary = useCallback((room: Room) => {
    const roomDamages = getRoomDamages(room.id);
    const damageCount = roomDamages.length;
    const maxSeverity = roomDamages.reduce((max, damage) => {
      const severityLevels = { minor: 1, moderate: 2, severe: 3, catastrophic: 4 };
      return severityLevels[damage.severity] > severityLevels[max] ? damage.severity : max;
    }, 'minor' as Damage['severity']);
    
    return { damageCount, maxSeverity };
  }, [getRoomDamages]);

  // Handle room creation
  const handleCreateRoom = useCallback(() => {
    setSelectedRoom(null);
    setIsCreatingRoom(true);
    setShowRoomModal(true);
  }, []);

  // Handle room editing
  const handleEditRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    setIsCreatingRoom(false);
    setShowRoomModal(true);
  }, []);

  // Handle damage creation
  const handleCreateDamage = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setSelectedDamage(null);
      setShowDamageModal(true);
    }
  }, [rooms]);

  // Handle damage editing
  const handleEditDamage = useCallback((damage: Damage) => {
    const room = rooms.find(r => r.id === damage.roomId);
    if (room) {
      setSelectedRoom(room);
      setSelectedDamage(damage);
      setShowDamageModal(true);
    }
  }, [rooms]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Damage Assessment</h2>
          <p className="text-gray-600">Document damage by room and location</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('floor_plan')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'floor_plan'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Floor Plan
            </button>
          </div>
          <Button onClick={handleCreateRoom}>
            Add Room
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-gray-900">{rooms.length}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">{damages.length}</div>
            <div className="text-sm text-gray-600">Total Damages</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {damages.filter(d => d.severity === 'severe' || d.severity === 'catastrophic').length}
            </div>
            <div className="text-sm text-gray-600">Severe Damages</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(room => getRoomDamages(room.id).length === 0).length}
            </div>
            <div className="text-sm text-gray-600">Undamaged Rooms</div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <RoomGridView
          rooms={rooms}
          damages={damages}
          getRoomDamages={getRoomDamages}
          getRoomSummary={getRoomSummary}
          getSeverityColor={getSeverityColor}
          onEditRoom={handleEditRoom}
          onDeleteRoom={onRoomDelete}
          onCreateDamage={handleCreateDamage}
          onEditDamage={handleEditDamage}
          onDeleteDamage={onDamageDelete}
        />
      ) : (
        <FloorPlanView
          canvasRef={canvasRef}
          rooms={rooms}
          damages={damages}
          getRoomDamages={getRoomDamages}
          onEditRoom={handleEditRoom}
          onCreateDamage={handleCreateDamage}
        />
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <RoomModal
          room={selectedRoom}
          isCreating={isCreatingRoom}
          onSave={isCreatingRoom ? onRoomCreate : (data) => selectedRoom && onRoomUpdate(selectedRoom.id, data)}
          onClose={() => setShowRoomModal(false)}
        />
      )}

      {/* Damage Modal */}
      {showDamageModal && selectedRoom && (
        <DamageModal
          room={selectedRoom}
          damage={selectedDamage}
          onSave={selectedDamage 
            ? (data) => onDamageUpdate(selectedDamage.id, data)
            : (data) => onDamageCreate(selectedRoom.id, data)
          }
          onClose={() => setShowDamageModal(false)}
        />
      )}
    </div>
  );
}

// Room Grid View Component
function RoomGridView({
  rooms,
  damages,
  getRoomDamages,
  getRoomSummary,
  getSeverityColor,
  onEditRoom,
  onDeleteRoom,
  onCreateDamage,
  onEditDamage,
  onDeleteDamage
}: {
  rooms: Room[];
  damages: Damage[];
  getRoomDamages: (roomId: string) => Damage[];
  getRoomSummary: (room: Room) => { damageCount: number; maxSeverity: Damage['severity'] };
  getSeverityColor: (severity: Damage['severity']) => string;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => Promise<void>;
  onCreateDamage: (roomId: string) => void;
  onEditDamage: (damage: Damage) => void;
  onDeleteDamage: (damageId: string) => Promise<void>;
}) {
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  if (rooms.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Added</h3>
          <p className="text-gray-600 mb-4">Start by adding rooms to document damage locations.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {rooms.map((room) => {
        const { damageCount, maxSeverity } = getRoomSummary(room);
        const roomDamages = getRoomDamages(room.id);
        const isExpanded = expandedRooms.has(room.id);

        return (
          <Card key={room.id}>
            <div className="p-4">
              {/* Room Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {room.roomType} • {room.level} level
                  </p>
                  {room.dimensions && (
                    <p className="text-xs text-gray-500">
                      {room.dimensions.length}m × {room.dimensions.width}m × {room.dimensions.height}m
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEditRoom(room)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit Room"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Room"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Damage Summary */}
              <div className="flex justify-between items-center mb-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  damageCount === 0 
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : getSeverityColor(maxSeverity)
                }`}>
                  {damageCount === 0 ? 'No Damage' : `${damageCount} Damage${damageCount > 1 ? 's' : ''}`}
                </div>
                <button
                  onClick={() => toggleRoomExpansion(room.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {/* Damage List */}
              {isExpanded && (
                <div className="space-y-2 mb-3">
                  {roomDamages.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No damage recorded</p>
                  ) : (
                    roomDamages.map((damage) => (
                      <div key={damage.id} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(damage.severity)}`}>
                                {damage.severity}
                              </span>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {damage.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{damage.description}</p>
                            <p className="text-xs text-gray-500">
                              {damage.location.element} • {damage.location.position}
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => onEditDamage(damage)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit Damage"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteDamage(damage.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete Damage"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateDamage(room.id)}
                  className="flex-1"
                >
                  Add Damage
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Floor Plan View Component
function FloorPlanView({
  canvasRef,
  rooms,
  damages,
  getRoomDamages,
  onEditRoom,
  onCreateDamage
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  rooms: Room[];
  damages: Damage[];
  getRoomDamages: (roomId: string) => Damage[];
  onEditRoom: (room: Room) => void;
  onCreateDamage: (roomId: string) => void;
}) {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [roomLayouts, setRoomLayouts] = useState<{ [roomId: string]: { x: number; y: number; width: number; height: number } }>({});

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
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

      // Draw rooms
      rooms.forEach((room, index) => {
        const layout = roomLayouts[room.id] || {
          x: 50 + (index % 3) * 200,
          y: 50 + Math.floor(index / 3) * 150,
          width: 180,
          height: 120
        };

        const roomDamages = getRoomDamages(room.id);
        const hasDamage = roomDamages.length > 0;

        // Room background
        ctx.fillStyle = hasDamage ? '#fef2f2' : '#f9fafb';
        ctx.fillRect(layout.x, layout.y, layout.width, layout.height);

        // Room border
        ctx.strokeStyle = hasDamage ? '#ef4444' : '#6b7280';
        ctx.lineWidth = hasDamage ? 2 : 1;
        ctx.strokeRect(layout.x, layout.y, layout.width, layout.height);

        // Room label
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          room.name,
          layout.x + layout.width / 2,
          layout.y + layout.height / 2 - 10
        );

        // Damage count
        if (hasDamage) {
          ctx.fillStyle = '#dc2626';
          ctx.font = '12px sans-serif';
          ctx.fillText(
            `${roomDamages.length} damage${roomDamages.length > 1 ? 's' : ''}`,
            layout.x + layout.width / 2,
            layout.y + layout.height / 2 + 10
          );
        }

        // Store layout for click detection
        if (!roomLayouts[room.id]) {
          setRoomLayouts(prev => ({ ...prev, [room.id]: layout }));
        }
      });
    }
  }, [rooms, damages, getRoomDamages, roomLayouts]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked room
    for (const room of rooms) {
      const layout = roomLayouts[room.id];
      if (layout && 
          x >= layout.x && x <= layout.x + layout.width &&
          y >= layout.y && y <= layout.y + layout.height) {
        // Right click for room menu, left click for damage
        if (event.button === 2) {
          onEditRoom(room);
        } else {
          onCreateDamage(room.id);
        }
        break;
      }
    }
  };

  return (
    <Card>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Click on a room to add damage. Right-click to edit room details.
          </p>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="cursor-pointer"
            onClick={handleCanvasClick}
            onContextMenu={(e) => {
              e.preventDefault();
              handleCanvasClick(e);
            }}
          />
        </div>
        {rooms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Add rooms to see them on the floor plan</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Room Modal Component
function RoomModal({
  room,
  isCreating,
  onSave,
  onClose
}: {
  room: Room | null;
  isCreating: boolean;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<RoomFormData>>({
    name: room?.name || '',
    roomType: room?.roomType || 'living',
    level: room?.level || 'ground',
    dimensions: room?.dimensions || undefined,
    construction: room?.construction || {
      walls: { primary: '', condition: 'good' },
      floor: { primary: '', condition: 'good' },
      ceiling: { primary: '', condition: 'good' }
    },
    ventilation: room?.ventilation || {
      type: 'natural'
    },
    moisture: room?.moisture || {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title={isCreating ? 'Add New Room' : 'Edit Room'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Room Name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.roomType || 'living'}
              onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value as any }))}
            >
              <option value="living">Living Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="bathroom">Bathroom</option>
              <option value="kitchen">Kitchen</option>
              <option value="laundry">Laundry</option>
              <option value="office">Office</option>
              <option value="storage">Storage</option>
              <option value="hallway">Hallway</option>
              <option value="garage">Garage</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.level || 'ground'}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
            >
              <option value="basement">Basement</option>
              <option value="ground">Ground Level</option>
              <option value="upper">Upper Level</option>
              <option value="mezzanine">Mezzanine</option>
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dimensions (Optional)</h4>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              label="Length (m)"
              value={formData.dimensions?.length || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0, width: prev.dimensions?.width || 0, height: prev.dimensions?.height || 0 }
              }))}
              step={0.1}
              min={0}
            />
            <Input
              type="number"
              label="Width (m)"
              value={formData.dimensions?.width || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0, length: prev.dimensions?.length || 0, height: prev.dimensions?.height || 0 }
              }))}
              step={0.1}
              min={0}
            />
            <Input
              type="number"
              label="Height (m)"
              value={formData.dimensions?.height || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0, length: prev.dimensions?.length || 0, width: prev.dimensions?.width || 0 }
              }))}
              step={0.1}
              min={0}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isCreating ? 'Add Room' : 'Update Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Damage Modal Component
function DamageModal({
  room,
  damage,
  onSave,
  onClose
}: {
  room: Room;
  damage: Damage | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<DamageFormData>>({
    type: damage?.type || 'water',
    severity: damage?.severity || 'minor',
    description: damage?.description || '',
    cause: damage?.cause || '',
    location: damage?.location || {
      element: 'wall',
      position: ''
    },
    extent: damage?.extent || {
      affected: true,
      contaminated: false,
      structuralImpact: false
    },
    riskFactors: damage?.riskFactors || [],
    materials: damage?.materials || [],
    assessedBy: damage?.assessedBy || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving damage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title={damage ? 'Edit Damage' : `Add Damage to ${room.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Type
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.type || 'water'}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="water">Water</option>
              <option value="fire">Fire</option>
              <option value="mould">Mould</option>
              <option value="smoke">Smoke</option>
              <option value="structural">Structural</option>
              <option value="content">Content</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.severity || 'minor'}
              onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
            >
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="catastrophic">Catastrophic</option>
            </select>
          </div>
        </div>

        <Input
          label="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the damage observed..."
          required
        />

        <Input
          label="Cause"
          value={formData.cause || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, cause: e.target.value }))}
          placeholder="What caused this damage?"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Element
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.location?.element || 'wall'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, element: e.target.value as any, position: prev.location?.position || '' }
              }))}
            >
              <option value="wall">Wall</option>
              <option value="floor">Floor</option>
              <option value="ceiling">Ceiling</option>
              <option value="fixture">Fixture</option>
              <option value="content">Content</option>
              <option value="structure">Structure</option>
            </select>
          </div>
          
          <Input
            label="Position"
            value={formData.location?.position || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, position: e.target.value, element: prev.location?.element || 'wall' }
            }))}
            placeholder="e.g., north wall, center of room"
            required
          />
        </div>

        <Input
          label="Assessed By"
          value={formData.assessedBy || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, assessedBy: e.target.value }))}
          placeholder="Technician name"
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : damage ? 'Update Damage' : 'Add Damage'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}