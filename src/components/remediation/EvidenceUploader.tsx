'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Upload, File, Camera, FileText, AlertCircle } from 'lucide-react'

interface Evidence {
  id: string
  type: 'photo' | 'document' | 'lab_result' | 'moisture_map' | 'thermal_image'
  file: File
  preview: string
  description: string
  location: string
  tags: string[]
  timestamp: Date
}

interface EvidenceUploaderProps {
  claimId: string
  onEvidenceAdded: (evidence: Evidence[]) => void
}

export default function EvidenceUploader({ claimId, onEvidenceAdded }: EvidenceUploaderProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [uploading, setUploading] = useState(false)

  const determineEvidenceType = (file: File): Evidence['type'] => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()
    
    if (mimeType.startsWith('image/')) {
      if (file.name.includes('thermal') || file.name.includes('flir')) {
        return 'thermal_image'
      }
      return 'photo'
    }
    
    if (file.name.includes('moisture') || file.name.includes('map')) {
      return 'moisture_map'
    }
    
    if (file.name.includes('lab') || file.name.includes('test') || file.name.includes('result')) {
      return 'lab_result'
    }
    
    return 'document'
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newEvidence = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      type: determineEvidenceType(file),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      description: '',
      location: '',
      tags: [],
      timestamp: new Date()
    }))
    
    setEvidence(prev => [...prev, ...newEvidence])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv']
    },
    multiple: true
  })

  const removeEvidence = (id: string) => {
    setEvidence(prev => {
      const item = prev.find(e => e.id === id)
      if (item?.preview) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter(e => e.id !== id)
    })
  }

  const updateEvidence = (id: string, updates: Partial<Evidence>) => {
    setEvidence(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ))
  }

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return
    setEvidence(prev => prev.map(e => 
      e.id === id 
        ? { ...e, tags: [...new Set([...e.tags, tag.trim()])] }
        : e
    ))
  }

  const removeTag = (id: string, tag: string) => {
    setEvidence(prev => prev.map(e => 
      e.id === id 
        ? { ...e, tags: e.tags.filter(t => t !== tag) }
        : e
    ))
  }

  const uploadEvidence = async () => {
    setUploading(true)
    try {
      // In production, this would upload to cloud storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onEvidenceAdded(evidence)
      
      // Clear evidence after successful upload
      evidence.forEach(e => {
        if (e.preview) URL.revokeObjectURL(e.preview)
      })
      setEvidence([])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'photo': return <Camera className="w-4 h-4" />
      case 'thermal_image': return <Camera className="w-4 h-4 text-red-500" />
      case 'moisture_map': return <FileText className="w-4 h-4 text-blue-500" />
      case 'lab_result': return <FileText className="w-4 h-4 text-green-500" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: Evidence['type']) => {
    switch (type) {
      case 'photo': return 'Photo'
      case 'thermal_image': return 'Thermal Image'
      case 'moisture_map': return 'Moisture Map'
      case 'lab_result': return 'Lab Result'
      default: return 'Document'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag and drop evidence files here</p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse (photos, documents, lab results)
            </p>
          </div>
        )}
      </div>

      {/* Evidence Grid */}
      {evidence.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Evidence Files ({evidence.length})
            </h3>
            <button
              onClick={uploadEvidence}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Preview or Icon */}
                <div className="relative h-32 bg-gray-100 rounded flex items-center justify-center">
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={item.description || 'Evidence'}
                      className="h-full w-full object-cover rounded cursor-pointer"
                      onClick={() => setSelectedEvidence(item)}
                    />
                  ) : (
                    <div className="text-center">
                      {getTypeIcon(item.type)}
                      <p className="text-xs text-gray-500 mt-1">{item.file.name}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeEvidence(item.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span className="text-sm font-medium">{getTypeLabel(item.type)}</span>
                  <span className="text-xs text-gray-500">
                    ({(item.file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>

                {/* Description */}
                <input
                  type="text"
                  placeholder="Add description..."
                  value={item.description}
                  onChange={e => updateEvidence(item.id, { description: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                />

                {/* Location */}
                <input
                  type="text"
                  placeholder="Location (e.g., Master Bedroom)"
                  value={item.location}
                  onChange={e => updateEvidence(item.id, { location: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                />

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-200 rounded-full flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(item.id, tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addTag(item.id, e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedEvidence && selectedEvidence.preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvidence(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedEvidence.preview}
              alt={selectedEvidence.description || 'Evidence'}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedEvidence(null)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Evidence Guidelines:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Photograph all affected areas from multiple angles</li>
              <li>Include moisture meter readings in photos when possible</li>
              <li>Label thermal images with temperature ranges</li>
              <li>Ensure lab results include chain of custody documentation</li>
              <li>Tag evidence with relevant IICRC categories (Cat 1/2/3, Class 1/2/3/4)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}