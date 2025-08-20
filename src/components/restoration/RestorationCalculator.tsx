'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { MaterialDamage } from '@/types/database';

interface RestorationItem {
  id: string;
  name: string;
  category: 'structural' | 'flooring' | 'fixtures' | 'contents' | 'specialty';
  material: string;
  brand?: string;
  age?: number; // years
  originalValue: number;
  currentValue: number;
  damageType: string[];
  damageExtent: 'minor' | 'moderate' | 'severe' | 'total';
  restorationCost: number;
  replacementCost: number;
  sentimentalValue: 'none' | 'low' | 'medium' | 'high' | 'irreplaceable';
  timeline: {
    restoration: number; // days
    replacement: number; // days
  };
  riskFactors: {
    furtherDamage: 'none' | 'low' | 'medium' | 'high';
    healthConcerns: 'none' | 'low' | 'medium' | 'high';
    structuralImpact: 'none' | 'low' | 'medium' | 'high';
  };
  specialConsiderations: string[];
  viabilityScore?: number;
  recommendation?: 'restore' | 'replace' | 'evaluate' | 'dispose';
  reasoning?: string[];
}

interface RestorationCalculatorProps {
  claimId: string;
  items: RestorationItem[];
  onItemsUpdate: (items: RestorationItem[]) => Promise<void>;
  insuranceLimits?: {
    building?: number;
    contents?: number;
    additionalExpenses?: number;
  };
}

export function RestorationCalculator({
  claimId,
  items,
  onItemsUpdate,
  insuranceLimits
}: RestorationCalculatorProps) {
  const [selectedItem, setSelectedItem] = useState<RestorationItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'viability' | 'savings'>('viability');
  const [isCreating, setIsCreating] = useState(false);

  // Calculate restoration viability for all items
  const analyzedItems = useMemo(() => {
    return items.map(item => {
      const analysis = calculateRestorationViability(item);
      return {
        ...item,
        viabilityScore: analysis.score,
        recommendation: analysis.recommendation,
        reasoning: analysis.reasoning
      };
    });
  }, [items]);

  // Filter and sort items
  const displayItems = useMemo(() => {
    let filtered = analyzedItems;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          return b.currentValue - a.currentValue;
        case 'viability':
          return (b.viabilityScore || 0) - (a.viabilityScore || 0);
        case 'savings':
          return (b.replacementCost - b.restorationCost) - (a.replacementCost - a.restorationCost);
        default:
          return 0;
      }
    });
  }, [analyzedItems, filterCategory, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    const restoreItems = analyzedItems.filter(item => item.recommendation === 'restore');
    const replaceItems = analyzedItems.filter(item => item.recommendation === 'replace');
    
    return {
      totalItems: analyzedItems.length,
      restoreRecommended: restoreItems.length,
      replaceRecommended: replaceItems.length,
      totalRestorationCost: restoreItems.reduce((sum, item) => sum + item.restorationCost, 0),
      totalReplacementCost: replaceItems.reduce((sum, item) => sum + item.replacementCost, 0),
      potentialSavings: analyzedItems.reduce((sum, item) => {
        return sum + (item.recommendation === 'restore' ? item.replacementCost - item.restorationCost : 0);
      }, 0),
      restorationRatio: analyzedItems.length > 0 ? restoreItems.length / analyzedItems.length : 0
    };
  }, [analyzedItems]);

  // Handle item operations
  const handleCreateItem = useCallback(() => {
    setSelectedItem(null);
    setIsCreating(true);
    setShowItemModal(true);
  }, []);

  const handleEditItem = useCallback((item: RestorationItem) => {
    setSelectedItem(item);
    setIsCreating(false);
    setShowItemModal(true);
  }, []);

  const handleSaveItem = useCallback(async (itemData: Partial<RestorationItem>) => {
    let updatedItems: RestorationItem[];
    
    if (isCreating) {
      const newItem: RestorationItem = {
        id: `item-${Date.now()}`,
        name: '',
        category: 'contents',
        material: '',
        originalValue: 0,
        currentValue: 0,
        damageType: [],
        damageExtent: 'minor',
        restorationCost: 0,
        replacementCost: 0,
        sentimentalValue: 'none',
        timeline: { restoration: 7, replacement: 14 },
        riskFactors: {
          furtherDamage: 'none',
          healthConcerns: 'none',
          structuralImpact: 'none'
        },
        specialConsiderations: [],
        ...itemData
      };
      updatedItems = [...items, newItem];
    } else if (selectedItem) {
      updatedItems = items.map(item => 
        item.id === selectedItem.id ? { ...item, ...itemData } : item
      );
    } else {
      return;
    }
    
    await onItemsUpdate(updatedItems);
    setShowItemModal(false);
  }, [isCreating, selectedItem, items, onItemsUpdate]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    await onItemsUpdate(updatedItems);
  }, [items, onItemsUpdate]);

  // Bulk operations
  const applyRecommendations = useCallback(() => {
    // This would typically update the items with recommended actions
    console.log('Applying recommendations for', totals.restoreRecommended, 'restoration items');
  }, [totals.restoreRecommended]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restoration Calculator</h2>
          <p className="text-gray-600">Cost-benefit analysis for restore vs replace decisions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowAnalysisModal(true)}>
            View Analysis
          </Button>
          <Button onClick={handleCreateItem}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-gray-900">{totals.totalItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">{totals.restoreRecommended}</div>
            <div className="text-sm text-gray-600">Restore Recommended</div>
            <div className="text-xs text-gray-500">
              {(totals.restorationRatio * 100).toFixed(1)}% restoration rate
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ${totals.potentialSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Potential Savings</div>
            <div className="text-xs text-gray-500">vs. full replacement</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              ${(totals.totalRestorationCost + totals.totalReplacementCost).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Recommended Cost</div>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="structural">Structural</option>
              <option value="flooring">Flooring</option>
              <option value="fixtures">Fixtures</option>
              <option value="contents">Contents</option>
              <option value="specialty">Specialty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="viability">Viability Score</option>
              <option value="name">Name</option>
              <option value="value">Current Value</option>
              <option value="savings">Potential Savings</option>
            </select>
          </div>
        </div>
        
        {totals.totalItems > 0 && (
          <Button variant="outline" onClick={applyRecommendations}>
            Apply Recommendations
          </Button>
        )}
      </div>

      {/* Items List */}
      {displayItems.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Added</h3>
            <p className="text-gray-600 mb-4">
              Start by adding damaged items to perform restoration analysis.
            </p>
            <Button onClick={handleCreateItem}>Add First Item</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item) => (
            <RestorationItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal
          item={selectedItem}
          isCreating={isCreating}
          onSave={handleSaveItem}
          onClose={() => setShowItemModal(false)}
        />
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <AnalysisModal
          items={analyzedItems}
          totals={totals}
          insuranceLimits={insuranceLimits}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
}

// Restoration Item Card Component
function RestorationItemCard({
  item,
  onEdit,
  onDelete
}: {
  item: RestorationItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'restore': return 'bg-green-100 border-green-300 text-green-800';
      case 'replace': return 'bg-red-100 border-red-300 text-red-800';
      case 'evaluate': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'dispose': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSentimentalValueDisplay = (value: string) => {
    switch (value) {
      case 'irreplaceable': return '★★★★★';
      case 'high': return '★★★★☆';
      case 'medium': return '★★★☆☆';
      case 'low': return '★★☆☆☆';
      default: return '★☆☆☆☆';
    }
  };

  const savings = item.replacementCost - item.restorationCost;
  const savingsPercentage = item.replacementCost > 0 ? (savings / item.replacementCost) * 100 : 0;

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {item.category}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getRecommendationColor(item.recommendation)}`}>
                {item.recommendation || 'Pending'}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">{item.material}</span>
              {item.brand && <span className="text-sm text-gray-600">• {item.brand}</span>}
              {item.age && <span className="text-sm text-gray-600">• {item.age} years old</span>}
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit Item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete Item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div>
            <div className="text-sm font-medium text-gray-700">Current Value</div>
            <div className="text-lg font-semibold text-gray-900">
              ${item.currentValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Restoration Cost</div>
            <div className="text-lg font-semibold text-green-600">
              ${item.restorationCost.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Replacement Cost</div>
            <div className="text-lg font-semibold text-red-600">
              ${item.replacementCost.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Potential Savings</div>
            <div className="text-lg font-semibold text-blue-600">
              ${savings.toLocaleString()}
              {savingsPercentage > 0 && (
                <span className="text-sm text-gray-600 ml-1">
                  ({savingsPercentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-medium">Viability Score:</span>
              <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                (item.viabilityScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                (item.viabilityScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.viabilityScore?.toFixed(0) || '0'}/100
              </span>
            </div>
            <div>
              <span className="font-medium">Damage:</span>
              <span className="ml-1 capitalize">{item.damageExtent}</span>
            </div>
            <div>
              <span className="font-medium">Sentimental:</span>
              <span className="ml-1" title={item.sentimentalValue}>
                {getSentimentalValueDisplay(item.sentimentalValue)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>Restoration: {item.timeline.restoration}d</span>
            <span>•</span>
            <span>Replacement: {item.timeline.replacement}d</span>
          </div>
        </div>

        {item.reasoning && item.reasoning.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-1">Analysis</div>
            <ul className="text-sm text-gray-600 space-y-1">
              {item.reasoning.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

// Item Modal Component
function ItemModal({
  item,
  isCreating,
  onSave,
  onClose
}: {
  item: RestorationItem | null;
  isCreating: boolean;
  onSave: (data: Partial<RestorationItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<RestorationItem>>({
    name: item?.name || '',
    category: item?.category || 'contents',
    material: item?.material || '',
    brand: item?.brand || '',
    age: item?.age || undefined,
    originalValue: item?.originalValue || 0,
    currentValue: item?.currentValue || 0,
    damageType: item?.damageType || [],
    damageExtent: item?.damageExtent || 'minor',
    restorationCost: item?.restorationCost || 0,
    replacementCost: item?.replacementCost || 0,
    sentimentalValue: item?.sentimentalValue || 'none',
    timeline: item?.timeline || { restoration: 7, replacement: 14 },
    riskFactors: item?.riskFactors || {
      furtherDamage: 'none',
      healthConcerns: 'none',
      structuralImpact: 'none'
    },
    specialConsiderations: item?.specialConsiderations || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<RestorationItem>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addDamageType = (damageType: string) => {
    const currentTypes = formData.damageType || [];
    if (!currentTypes.includes(damageType)) {
      updateFormData({ damageType: [...currentTypes, damageType] });
    }
  };

  const removeDamageType = (damageType: string) => {
    const currentTypes = formData.damageType || [];
    updateFormData({ damageType: currentTypes.filter(t => t !== damageType) });
  };

  return (
    <Modal onClose={onClose} title={isCreating ? 'Add New Item' : 'Edit Item'} size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name"
              value={formData.name || ''}
              onChange={(e) => updateFormData({ name: e.target.value })}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.category || 'contents'}
                onChange={(e) => updateFormData({ category: e.target.value as any })}
              >
                <option value="structural">Structural</option>
                <option value="flooring">Flooring</option>
                <option value="fixtures">Fixtures</option>
                <option value="contents">Contents</option>
                <option value="specialty">Specialty</option>
              </select>
            </div>
            
            <Input
              label="Material"
              value={formData.material || ''}
              onChange={(e) => updateFormData({ material: e.target.value })}
              required
            />
            
            <Input
              label="Brand (Optional)"
              value={formData.brand || ''}
              onChange={(e) => updateFormData({ brand: e.target.value })}
            />
            
            <Input
              type="number"
              label="Age (Years)"
              value={formData.age || ''}
              onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
              min={0}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sentimental Value
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.sentimentalValue || 'none'}
                onChange={(e) => updateFormData({ sentimentalValue: e.target.value as any })}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="irreplaceable">Irreplaceable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Financial Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Original Value"
              value={formData.originalValue || ''}
              onChange={(e) => updateFormData({ originalValue: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              required
            />
            
            <Input
              type="number"
              label="Current Value"
              value={formData.currentValue || ''}
              onChange={(e) => updateFormData({ currentValue: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              required
            />
            
            <Input
              type="number"
              label="Restoration Cost"
              value={formData.restorationCost || ''}
              onChange={(e) => updateFormData({ restorationCost: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              required
            />
            
            <Input
              type="number"
              label="Replacement Cost"
              value={formData.replacementCost || ''}
              onChange={(e) => updateFormData({ replacementCost: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              required
            />
          </div>
        </div>

        {/* Damage Assessment */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Damage Assessment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Damage Extent
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.damageExtent || 'minor'}
                onChange={(e) => updateFormData({ damageExtent: e.target.value as any })}
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="total">Total Loss</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Damage Types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['water', 'fire', 'smoke', 'mould', 'impact', 'other'].map(type => (
                  <label key={type} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.damageType?.includes(type) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addDamageType(type);
                        } else {
                          removeDamageType(type);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Restoration Timeline (Days)"
              value={formData.timeline?.restoration || ''}
              onChange={(e) => updateFormData({ 
                timeline: { 
                  ...formData.timeline, 
                  restoration: parseInt(e.target.value) || 7,
                  replacement: formData.timeline?.replacement || 14
                }
              })}
              min={1}
            />
            
            <Input
              type="number"
              label="Replacement Timeline (Days)"
              value={formData.timeline?.replacement || ''}
              onChange={(e) => updateFormData({ 
                timeline: { 
                  ...formData.timeline, 
                  replacement: parseInt(e.target.value) || 14,
                  restoration: formData.timeline?.restoration || 7
                }
              })}
              min={1}
            />
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Further Damage Risk
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.riskFactors?.furtherDamage || 'none'}
                onChange={(e) => updateFormData({ 
                  riskFactors: { 
                    ...formData.riskFactors, 
                    furtherDamage: e.target.value as any 
                  }
                })}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Concerns
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.riskFactors?.healthConcerns || 'none'}
                onChange={(e) => updateFormData({ 
                  riskFactors: { 
                    ...formData.riskFactors, 
                    healthConcerns: e.target.value as any 
                  }
                })}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structural Impact
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.riskFactors?.structuralImpact || 'none'}
                onChange={(e) => updateFormData({ 
                  riskFactors: { 
                    ...formData.riskFactors, 
                    structuralImpact: e.target.value as any 
                  }
                })}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isCreating ? 'Add Item' : 'Update Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Analysis Modal Component
function AnalysisModal({
  items,
  totals,
  insuranceLimits,
  onClose
}: {
  items: RestorationItem[];
  totals: any;
  insuranceLimits?: any;
  onClose: () => void;
}) {
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { count: number; restoreCount: number; savings: number } } = {};
    
    items.forEach(item => {
      if (!breakdown[item.category]) {
        breakdown[item.category] = { count: 0, restoreCount: 0, savings: 0 };
      }
      breakdown[item.category].count++;
      if (item.recommendation === 'restore') {
        breakdown[item.category].restoreCount++;
        breakdown[item.category].savings += item.replacementCost - item.restorationCost;
      }
    });
    
    return breakdown;
  }, [items]);

  return (
    <Modal onClose={onClose} title="Restoration Analysis Report" size="large">
      <div className="space-y-6">
        {/* Executive Summary */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Executive Summary</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>Restoration Rate:</strong> {(totals.restorationRatio * 100).toFixed(1)}% 
                ({totals.restoreRecommended} of {totals.totalItems} items recommended for restoration)
              </p>
              <p className="mb-2">
                <strong>Cost Savings:</strong> ${totals.potentialSavings.toLocaleString()} potential savings 
                vs. full replacement approach
              </p>
              <p>
                <strong>Environmental Impact:</strong> Restoration approach reduces waste and supports 
                sustainable remediation practices
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category Analysis</h4>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restore Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(categoryBreakdown).map(([category, data]) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((data.restoreCount / data.count) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${data.savings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance Implications */}
        {insuranceLimits && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Insurance Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium text-green-800">Contents Limit</div>
                  <div className="text-green-600">
                    ${insuranceLimits.contents?.toLocaleString() || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Building Limit</div>
                  <div className="text-blue-600">
                    ${insuranceLimits.building?.toLocaleString() || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium text-purple-800">Additional Expenses</div>
                  <div className="text-purple-600">
                    ${insuranceLimits.additionalExpenses?.toLocaleString() || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">
                Prioritize restoration of high-value items with good viability scores to maximize cost savings
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">
                Consider client sentimental value when making restoration decisions, especially for irreplaceable items
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">
                Monitor items with medium viability scores closely during restoration process
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">
                Replace items with high health risks or structural concerns that cannot be safely restored
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Restoration Viability Calculation Algorithm
function calculateRestorationViability(item: RestorationItem): {
  score: number;
  recommendation: 'restore' | 'replace' | 'evaluate' | 'dispose';
  reasoning: string[];
} {
  let score = 50; // Base score
  const reasoning: string[] = [];

  // Cost-benefit analysis (30% weight)
  const costRatio = item.restorationCost / item.replacementCost;
  if (costRatio < 0.3) {
    score += 30;
    reasoning.push('Very cost-effective restoration (< 30% of replacement cost)');
  } else if (costRatio < 0.5) {
    score += 20;
    reasoning.push('Cost-effective restoration (< 50% of replacement cost)');
  } else if (costRatio < 0.7) {
    score += 10;
    reasoning.push('Moderately cost-effective restoration');
  } else if (costRatio < 0.9) {
    score -= 10;
    reasoning.push('Marginal cost benefit for restoration');
  } else {
    score -= 20;
    reasoning.push('Restoration cost approaches replacement cost');
  }

  // Damage extent (25% weight)
  switch (item.damageExtent) {
    case 'minor':
      score += 25;
      reasoning.push('Minor damage supports restoration approach');
      break;
    case 'moderate':
      score += 15;
      reasoning.push('Moderate damage, restoration feasible');
      break;
    case 'severe':
      score -= 10;
      reasoning.push('Severe damage complicates restoration');
      break;
    case 'total':
      score -= 25;
      reasoning.push('Total loss not suitable for restoration');
      break;
  }

  // Sentimental value (20% weight)
  switch (item.sentimentalValue) {
    case 'irreplaceable':
      score += 20;
      reasoning.push('Irreplaceable sentimental value strongly favors restoration');
      break;
    case 'high':
      score += 15;
      reasoning.push('High sentimental value supports restoration');
      break;
    case 'medium':
      score += 10;
      reasoning.push('Moderate sentimental value considered');
      break;
    case 'low':
      score += 5;
      break;
    case 'none':
      break;
  }

  // Risk factors (15% weight)
  const riskFactors = [
    item.riskFactors.furtherDamage,
    item.riskFactors.healthConcerns,
    item.riskFactors.structuralImpact
  ];

  const highRiskCount = riskFactors.filter(risk => risk === 'high').length;
  const mediumRiskCount = riskFactors.filter(risk => risk === 'medium').length;

  if (highRiskCount > 0) {
    score -= 15;
    reasoning.push(`High risk factors present (${highRiskCount})`);
  } else if (mediumRiskCount > 1) {
    score -= 10;
    reasoning.push(`Multiple medium risk factors present`);
  } else if (mediumRiskCount === 1) {
    score -= 5;
    reasoning.push('Some risk factors to consider');
  }

  // Age and condition (10% weight)
  if (item.age) {
    if (item.age < 5) {
      score += 10;
      reasoning.push('Relatively new item, good restoration candidate');
    } else if (item.age < 15) {
      score += 5;
      reasoning.push('Moderate age supports restoration');
    } else if (item.age > 25) {
      score -= 5;
      reasoning.push('Advanced age may limit restoration effectiveness');
    }
  }

  // Timeline consideration
  if (item.timeline.restoration < item.timeline.replacement) {
    score += 5;
    reasoning.push('Faster restoration timeline is advantageous');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine recommendation
  let recommendation: 'restore' | 'replace' | 'evaluate' | 'dispose';
  
  if (score >= 75) {
    recommendation = 'restore';
  } else if (score >= 50) {
    recommendation = 'evaluate';
  } else if (highRiskCount > 0 && item.riskFactors.healthConcerns === 'high') {
    recommendation = 'dispose';
    reasoning.push('High health risk requires disposal rather than restoration');
  } else {
    recommendation = 'replace';
  }

  // Special case for irreplaceable items
  if (item.sentimentalValue === 'irreplaceable' && item.damageExtent !== 'total') {
    recommendation = 'restore';
    reasoning.push('Irreplaceable nature overrides other factors');
  }

  return { score, recommendation, reasoning };
}