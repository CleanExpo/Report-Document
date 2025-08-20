'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { 
  IICRC_STANDARDS, 
  searchStandardsByKeywords, 
  searchStandardsByDamageType, 
  searchStandardsByScenario,
  type IICRCSection
} from '@/lib/standards/iicrc-standards';
import type { StandardReference } from '@/types/database';

interface IICRCCitationEngineProps {
  // Context information for intelligent suggestions
  damageTypes?: string[];
  scenario?: string;
  keywords?: string[];
  currentRecommendation?: string;
  
  // Current citations
  citations: StandardReference[];
  onCitationsChange: (citations: StandardReference[]) => void;
  
  // UI options
  showSuggestions?: boolean;
  compactMode?: boolean;
  autoSuggest?: boolean;
}

export function IICRCCitationEngine({
  damageTypes = [],
  scenario = '',
  keywords = [],
  currentRecommendation = '',
  citations,
  onCitationsChange,
  showSuggestions = true,
  compactMode = false,
  autoSuggest = true
}: IICRCCitationEngineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showStandardsBrowser, setShowStandardsBrowser] = useState(false);
  const [suggestions, setSuggestions] = useState<IICRCSection[]>([]);

  // Generate smart suggestions based on context
  const generateSuggestions = useCallback(() => {
    const allSuggestions: IICRCSection[] = [];
    
    // Search by damage types
    damageTypes.forEach(damageType => {
      const results = searchStandardsByDamageType(damageType);
      allSuggestions.push(...results);
    });
    
    // Search by scenario
    if (scenario) {
      const results = searchStandardsByScenario(scenario);
      allSuggestions.push(...results);
    }
    
    // Search by keywords
    if (keywords.length > 0) {
      const results = searchStandardsByKeywords(keywords);
      allSuggestions.push(...results);
    }
    
    // Extract keywords from current recommendation
    if (currentRecommendation) {
      const extractedKeywords = extractKeywordsFromText(currentRecommendation);
      if (extractedKeywords.length > 0) {
        const results = searchStandardsByKeywords(extractedKeywords);
        allSuggestions.push(...results);
      }
    }
    
    // Remove duplicates and sort by relevance
    const uniqueSuggestions = removeDuplicateSections(allSuggestions);
    const scoredSuggestions = scoreRelevance(uniqueSuggestions, damageTypes, scenario, keywords, currentRecommendation);
    
    setSuggestions(scoredSuggestions.slice(0, 8)); // Top 8 suggestions
  }, [damageTypes, scenario, keywords, currentRecommendation]);

  // Auto-generate suggestions when context changes
  useEffect(() => {
    if (autoSuggest) {
      generateSuggestions();
    }
  }, [autoSuggest, generateSuggestions]);

  // Search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const queryKeywords = searchQuery.toLowerCase().split(/\s+/);
    const results = searchStandardsByKeywords(queryKeywords);
    
    return scoreRelevance(results, damageTypes, scenario, queryKeywords, searchQuery).slice(0, 10);
  }, [searchQuery, damageTypes, scenario]);

  // Add citation from section
  const addCitationFromSection = useCallback((section: IICRCSection, standardCode: string) => {
    const newCitation: StandardReference = {
      standard: `IICRC ${standardCode}`,
      section: section.number,
      title: section.title,
      quotation: section.content,
      relevance: generateRelevanceExplanation(section, damageTypes, scenario, keywords),
      url: `https://www.iicrc.org/standards/${standardCode.toLowerCase()}`
    };
    
    // Check if citation already exists
    const exists = citations.some(c => 
      c.standard === newCitation.standard && c.section === newCitation.section
    );
    
    if (!exists) {
      onCitationsChange([...citations, newCitation]);
    }
  }, [citations, onCitationsChange, damageTypes, scenario, keywords]);

  // Remove citation
  const removeCitation = useCallback((index: number) => {
    const newCitations = citations.filter((_, i) => i !== index);
    onCitationsChange(newCitations);
  }, [citations, onCitationsChange]);

  // Edit citation
  const editCitation = useCallback((index: number, updatedCitation: StandardReference) => {
    const newCitations = [...citations];
    newCitations[index] = updatedCitation;
    onCitationsChange(newCitations);
  }, [citations, onCitationsChange]);

  if (compactMode) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">IICRC Citations ({citations.length})</h4>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCitationModal(true)}
          >
            Add Citation
          </Button>
        </div>
        
        {citations.length > 0 && (
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={index} className="text-sm border border-gray-200 rounded p-2">
                <div className="font-medium text-blue-600">
                  {citation.standard} {citation.section}: {citation.title}
                </div>
                <div className="text-gray-600 mt-1 line-clamp-2">
                  {citation.quotation}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showCitationModal && (
          <CitationModal
            suggestions={suggestions}
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onAddCitation={addCitationFromSection}
            onClose={() => setShowCitationModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">IICRC Citations</h3>
          <p className="text-sm text-gray-600">
            Add relevant IICRC standard citations to support your recommendations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowStandardsBrowser(true)}
          >
            Browse Standards
          </Button>
          <Button onClick={() => setShowCitationModal(true)}>
            Add Citation
          </Button>
        </div>
      </div>

      {/* Current Citations */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Current Citations ({citations.length})</h4>
        {citations.length === 0 ? (
          <Card>
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">No citations added yet</p>
              <p className="text-sm text-gray-500 mt-1">Add citations to support your recommendations with IICRC standards</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {citations.map((citation, index) => (
              <CitationCard
                key={index}
                citation={citation}
                onEdit={(updated) => editCitation(index, updated)}
                onRemove={() => removeCitation(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Suggested Citations
            <span className="text-sm font-normal text-gray-600 ml-2">
              Based on damage type and context
            </span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={`${suggestion.number}-${index}`}
                section={suggestion}
                onAdd={(section) => {
                  const standardCode = getStandardCodeFromSection(section);
                  addCitationFromSection(section, standardCode);
                }}
                isAdded={citations.some(c => c.section === suggestion.number)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Citation Modal */}
      {showCitationModal && (
        <CitationModal
          suggestions={suggestions}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onAddCitation={addCitationFromSection}
          onClose={() => setShowCitationModal(false)}
        />
      )}

      {/* Standards Browser */}
      {showStandardsBrowser && (
        <StandardsBrowser
          onAddCitation={addCitationFromSection}
          onClose={() => setShowStandardsBrowser(false)}
        />
      )}
    </div>
  );
}

// Citation Card Component
function CitationCard({
  citation,
  onEdit,
  onRemove
}: {
  citation: StandardReference;
  onEdit: (citation: StandardReference) => void;
  onRemove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCitation, setEditedCitation] = useState(citation);

  const handleSave = () => {
    onEdit(editedCitation);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCitation(citation);
    setIsEditing(false);
  };

  return (
    <Card>
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              label="Standard"
              value={editedCitation.standard}
              onChange={(e) => setEditedCitation(prev => ({ ...prev, standard: e.target.value }))}
            />
            <Input
              label="Section"
              value={editedCitation.section}
              onChange={(e) => setEditedCitation(prev => ({ ...prev, section: e.target.value }))}
            />
            <Input
              label="Title"
              value={editedCitation.title}
              onChange={(e) => setEditedCitation(prev => ({ ...prev, title: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quotation
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                value={editedCitation.quotation}
                onChange={(e) => setEditedCitation(prev => ({ ...prev, quotation: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-blue-600">
                {citation.standard} {citation.section}: {citation.title}
              </div>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Edit Citation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onRemove}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Remove Citation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-gray-700 mb-2">
              "{citation.quotation}"
            </div>
            <div className="text-sm text-gray-500">
              <strong>Relevance:</strong> {citation.relevance}
            </div>
            {citation.url && (
              <div className="mt-2">
                <a 
                  href={citation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Full Standard →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Suggestion Card Component
function SuggestionCard({
  section,
  onAdd,
  isAdded
}: {
  section: IICRCSection;
  onAdd: (section: IICRCSection) => void;
  isAdded: boolean;
}) {
  const standardCode = getStandardCodeFromSection(section);
  
  return (
    <Card>
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-sm text-blue-600">
            IICRC {standardCode} {section.number}: {section.title}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdd(section)}
            disabled={isAdded}
          >
            {isAdded ? 'Added' : 'Add'}
          </Button>
        </div>
        <div className="text-sm text-gray-600 line-clamp-2">
          {section.content}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {section.keywords.slice(0, 3).map((keyword, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Citation Modal Component
function CitationModal({
  suggestions,
  searchResults,
  searchQuery,
  onSearchQueryChange,
  onAddCitation,
  onClose
}: {
  suggestions: IICRCSection[];
  searchResults: IICRCSection[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onAddCitation: (section: IICRCSection, standardCode: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'search'>('suggestions');

  return (
    <Modal onClose={onClose} title="Add IICRC Citation" size="large">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Smart Suggestions ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Search Standards
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'suggestions' ? (
          <div>
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No suggestions available</p>
                <p className="text-sm text-gray-400">Try providing more context about damage type or scenario</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-blue-600">
                        IICRC {getStandardCodeFromSection(suggestion)} {suggestion.number}: {suggestion.title}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddCitation(suggestion, getStandardCodeFromSection(suggestion));
                          onClose();
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {suggestion.content}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.keywords.slice(0, 4).map((keyword, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Input
                placeholder="Search IICRC standards..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? 'No results found' : 'Enter a search term to find relevant standards'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-blue-600">
                        IICRC {getStandardCodeFromSection(result)} {result.number}: {result.title}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onAddCitation(result, getStandardCodeFromSection(result));
                          onClose();
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Standards Browser Component
function StandardsBrowser({
  onAddCitation,
  onClose
}: {
  onAddCitation: (section: IICRCSection, standardCode: string) => void;
  onClose: () => void;
}) {
  const [selectedStandard, setSelectedStandard] = useState<string>('S500');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionNumber: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionNumber)) {
        newSet.delete(sectionNumber);
      } else {
        newSet.add(sectionNumber);
      }
      return newSet;
    });
  };

  const currentStandard = IICRC_STANDARDS[selectedStandard as keyof typeof IICRC_STANDARDS];

  return (
    <Modal onClose={onClose} title="Browse IICRC Standards" size="large">
      <div className="flex h-96">
        {/* Standards List */}
        <div className="w-1/4 border-r border-gray-200 pr-4">
          <h4 className="font-medium text-gray-900 mb-3">Standards</h4>
          <div className="space-y-2">
            {Object.entries(IICRC_STANDARDS).map(([code, standard]) => (
              <button
                key={code}
                onClick={() => setSelectedStandard(code)}
                className={`w-full text-left p-2 rounded text-sm ${
                  selectedStandard === code
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{standard.code}</div>
                <div className="text-xs">{standard.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 pl-4 overflow-y-auto">
          <h4 className="font-medium text-gray-900 mb-3">
            {currentStandard.code}: {currentStandard.title}
          </h4>
          <div className="space-y-2">
            {currentStandard.sections.map((section) => (
              <div key={section.number}>
                <div className="flex justify-between items-start">
                  <button
                    onClick={() => toggleSection(section.number)}
                    className="flex-1 text-left p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="font-medium text-blue-600">
                      {section.number}: {section.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.content.substring(0, 100)}...
                    </div>
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddCitation(section, currentStandard.code)}
                    className="ml-2"
                  >
                    Add
                  </Button>
                </div>

                {/* Subsections */}
                {expandedSections.has(section.number) && section.subsections && (
                  <div className="ml-4 mt-2 space-y-1">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.number} className="flex justify-between items-start">
                        <div className="flex-1 p-2 bg-gray-50 rounded">
                          <div className="font-medium text-blue-600 text-sm">
                            {subsection.number}: {subsection.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {subsection.content}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddCitation(subsection, currentStandard.code)}
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Helper Functions
function extractKeywordsFromText(text: string): string[] {
  const keywords: string[] = [];
  const commonTerms = [
    'water', 'mould', 'mold', 'fire', 'smoke', 'hvac', 'contamination', 'category',
    'class', 'damage', 'restoration', 'remediation', 'cleaning', 'drying',
    'containment', 'moisture', 'humidity', 'ventilation', 'structural'
  ];
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  commonTerms.forEach(term => {
    if (words.includes(term)) {
      keywords.push(term);
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}

function removeDuplicateSections(sections: IICRCSection[]): IICRCSection[] {
  const seen = new Set<string>();
  return sections.filter(section => {
    const key = section.number;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function scoreRelevance(
  sections: IICRCSection[], 
  damageTypes: string[], 
  scenario: string, 
  keywords: string[], 
  currentText: string
): IICRCSection[] {
  return sections.map(section => ({
    ...section,
    _relevanceScore: calculateRelevanceScore(section, damageTypes, scenario, keywords, currentText)
  })).sort((a, b) => (b as any)._relevanceScore - (a as any)._relevanceScore);
}

function calculateRelevanceScore(
  section: IICRCSection,
  damageTypes: string[],
  scenario: string,
  keywords: string[],
  currentText: string
): number {
  let score = 0;
  
  // Damage type match
  damageTypes.forEach(type => {
    if (section.damageTypes.includes(type.toLowerCase())) {
      score += 10;
    }
  });
  
  // Scenario match
  if (scenario) {
    section.applicableScenarios.forEach(s => {
      if (s.toLowerCase().includes(scenario.toLowerCase()) || 
          scenario.toLowerCase().includes(s.toLowerCase())) {
        score += 8;
      }
    });
  }
  
  // Keyword match
  keywords.forEach(keyword => {
    section.keywords.forEach(k => {
      if (k.toLowerCase().includes(keyword.toLowerCase())) {
        score += 5;
      }
    });
    
    if (section.content.toLowerCase().includes(keyword.toLowerCase())) {
      score += 3;
    }
    
    if (section.title.toLowerCase().includes(keyword.toLowerCase())) {
      score += 7;
    }
  });
  
  return score;
}

function generateRelevanceExplanation(
  section: IICRCSection,
  damageTypes: string[],
  scenario: string,
  keywords: string[]
): string {
  const reasons: string[] = [];
  
  // Check damage type relevance
  const matchingDamageTypes = damageTypes.filter(type => 
    section.damageTypes.includes(type.toLowerCase())
  );
  if (matchingDamageTypes.length > 0) {
    reasons.push(`Applies to ${matchingDamageTypes.join(', ')} damage`);
  }
  
  // Check scenario relevance
  if (scenario) {
    const matchingScenarios = section.applicableScenarios.filter(s =>
      s.toLowerCase().includes(scenario.toLowerCase()) ||
      scenario.toLowerCase().includes(s.toLowerCase())
    );
    if (matchingScenarios.length > 0) {
      reasons.push(`Relevant to scenario: ${matchingScenarios[0]}`);
    }
  }
  
  // Check keyword relevance
  const matchingKeywords = keywords.filter(keyword =>
    section.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
  if (matchingKeywords.length > 0) {
    reasons.push(`Contains relevant keywords: ${matchingKeywords.join(', ')}`);
  }
  
  return reasons.length > 0 
    ? reasons.join('; ')
    : 'General standard guidance applicable to remediation practices';
}

function getStandardCodeFromSection(section: IICRCSection): string {
  // This is a simplified approach - in a real implementation,
  // you'd track which standard each section belongs to
  const allStandards = Object.entries(IICRC_STANDARDS);
  
  for (const [code, standard] of allStandards) {
    const findSection = (sections: IICRCSection[]): boolean => {
      for (const s of sections) {
        if (s.number === section.number && s.title === section.title) {
          return true;
        }
        if (s.subsections && findSection(s.subsections)) {
          return true;
        }
      }
      return false;
    };
    
    if (findSection(standard.sections)) {
      return code;
    }
  }
  
  return 'S500'; // Default fallback
}