'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { ClaimSchema, type ClaimFormData, type FormStep, type FormState } from '@/types/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface ClaimIntakeFormProps {
  initialData?: Partial<ClaimFormData>;
  onSubmit: (data: ClaimFormData) => Promise<void>;
  onDraft?: (data: Partial<ClaimFormData>) => Promise<void>;
  onStepChange?: (step: FormStep) => void;
}

const STEPS: FormStep[] = ['property', 'insurance', 'client', 'damage', 'summary'];

const STEP_TITLES = {
  property: 'Property Information',
  insurance: 'Insurance Details',
  client: 'Client Information',
  damage: 'Damage Assessment',
  summary: 'Review & Submit'
};

export function ClaimIntakeForm({ 
  initialData = {}, 
  onSubmit, 
  onDraft, 
  onStepChange 
}: ClaimIntakeFormProps) {
  const [formState, setFormState] = useState<FormState<ClaimFormData>>({
    data: {
      claimNumber: '',
      claimDate: new Date(),
      incidentDate: new Date(),
      discoveryDate: new Date(),
      causeOfLoss: '',
      damageType: [],
      property: {
        address: {
          street: '',
          suburb: '',
          state: 'QLD',
          postcode: '',
          country: 'Australia'
        },
        propertyType: 'residential',
        constructionType: 'brick',
        storeys: 1,
        occupancyType: ''
      },
      insurance: {
        insurerName: '',
        policyNumber: '',
        coverageType: 'comprehensive',
        policyLimits: {}
      },
      client: {
        primaryContact: {
          name: '',
          email: '',
          phone: '',
          relationship: 'owner',
          preferredContact: 'email'
        },
        occupants: 1
      },
      ...initialData
    },
    errors: {},
    isValid: false,
    isDirty: false,
    isSubmitting: false,
    currentStep: 'property',
    completedSteps: []
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Validation for each step
  const validateStep = useCallback((step: FormStep, data: Partial<ClaimFormData>) => {
    const errors: { [key: string]: string[] } = {};
    
    switch (step) {
      case 'property':
        if (!data.property?.address?.street) errors.street = ['Street address is required'];
        if (!data.property?.address?.suburb) errors.suburb = ['Suburb is required'];
        if (!data.property?.address?.postcode) errors.postcode = ['Postcode is required'];
        if (data.property?.address?.postcode && !/^\d{4}$/.test(data.property.address.postcode)) {
          errors.postcode = ['Postcode must be 4 digits'];
        }
        if (!data.property?.occupancyType) errors.occupancyType = ['Occupancy type is required'];
        break;
        
      case 'insurance':
        if (!data.insurance?.insurerName) errors.insurerName = ['Insurer name is required'];
        if (!data.insurance?.policyNumber) errors.policyNumber = ['Policy number is required'];
        break;
        
      case 'client':
        if (!data.client?.primaryContact?.name) errors.primaryContactName = ['Primary contact name is required'];
        if (!data.client?.primaryContact?.email) errors.primaryContactEmail = ['Primary contact email is required'];
        if (data.client?.primaryContact?.email && !/\S+@\S+\.\S+/.test(data.client.primaryContact.email)) {
          errors.primaryContactEmail = ['Valid email is required'];
        }
        if (!data.client?.primaryContact?.phone) errors.primaryContactPhone = ['Primary contact phone is required'];
        break;
        
      case 'damage':
        if (!data.claimNumber) errors.claimNumber = ['Claim number is required'];
        if (!data.causeOfLoss) errors.causeOfLoss = ['Cause of loss is required'];
        if (!data.damageType || data.damageType.length === 0) {
          errors.damageType = ['At least one damage type is required'];
        }
        break;
    }
    
    return errors;
  }, []);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ClaimFormData>) => {
    setFormState(prev => {
      const newData = { ...prev.data, ...updates };
      const currentStep = STEPS[currentStepIndex];
      const stepErrors = validateStep(currentStep, newData);
      
      return {
        ...prev,
        data: newData,
        errors: { ...prev.errors, ...stepErrors },
        isDirty: true,
        isValid: Object.keys(stepErrors).length === 0
      };
    });
  }, [currentStepIndex, validateStep]);

  // Auto-save draft
  useEffect(() => {
    if (formState.isDirty && onDraft) {
      const timeoutId = setTimeout(() => {
        onDraft(formState.data);
      }, 2000); // Save after 2 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [formState.data, formState.isDirty, onDraft]);

  // Navigate to step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStepIndex(stepIndex);
      const step = STEPS[stepIndex];
      onStepChange?.(step);
    }
  }, [onStepChange]);

  // Next step
  const nextStep = useCallback(() => {
    const currentStep = STEPS[currentStepIndex];
    const stepErrors = validateStep(currentStep, formState.data);
    
    if (Object.keys(stepErrors).length === 0) {
      setFormState(prev => ({
        ...prev,
        completedSteps: [...(prev.completedSteps || []), currentStep],
        errors: { ...prev.errors, ...stepErrors }
      }));
      goToStep(currentStepIndex + 1);
    } else {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...stepErrors }
      }));
    }
  }, [currentStepIndex, formState.data, validateStep, goToStep]);

  // Previous step
  const prevStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    // Validate all steps
    let allErrors: { [key: string]: string[] } = {};
    for (const step of STEPS) {
      const stepErrors = validateStep(step, formState.data);
      allErrors = { ...allErrors, ...stepErrors };
    }
    
    if (Object.keys(allErrors).length > 0) {
      setFormState(prev => ({ ...prev, errors: allErrors }));
      return;
    }
    
    // Final validation with Zod schema
    const result = ClaimSchema.safeParse(formState.data);
    if (!result.success) {
      const zodErrors: { [key: string]: string[] } = {};
      result.error.errors.forEach(error => {
        const field = error.path.join('.');
        zodErrors[field] = [error.message];
      });
      setFormState(prev => ({ ...prev, errors: zodErrors }));
      return;
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(result.data);
    } catch (error) {
      console.error('Error submitting claim:', error);
      // Handle submission error
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.data, validateStep, onSubmit]);

  const currentStep = STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                } ${
                  formState.completedSteps?.includes(step) ? 'bg-green-600' : ''
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700">
                {STEP_TITLES[step]}
              </div>
              {index < STEPS.length - 1 && (
                <div 
                  className={`ml-4 w-12 h-0.5 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {STEP_TITLES[currentStep]}
          </h2>

          {/* Property Information Step */}
          {currentStep === 'property' && (
            <PropertyInformationStep 
              data={formState.data} 
              errors={formState.errors}
              onChange={updateFormData}
            />
          )}

          {/* Insurance Details Step */}
          {currentStep === 'insurance' && (
            <InsuranceDetailsStep 
              data={formState.data} 
              errors={formState.errors}
              onChange={updateFormData}
            />
          )}

          {/* Client Information Step */}
          {currentStep === 'client' && (
            <ClientInformationStep 
              data={formState.data} 
              errors={formState.errors}
              onChange={updateFormData}
            />
          )}

          {/* Damage Assessment Step */}
          {currentStep === 'damage' && (
            <DamageAssessmentStep 
              data={formState.data} 
              errors={formState.errors}
              onChange={updateFormData}
            />
          )}

          {/* Summary Step */}
          {currentStep === 'summary' && (
            <SummaryStep 
              data={formState.data} 
              onEdit={goToStep}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            {onDraft && (
              <Button
                variant="outline"
                onClick={() => onDraft(formState.data)}
                disabled={formState.isSubmitting}
              >
                Save Draft
              </Button>
            )}
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={formState.isSubmitting || !formState.isValid}
              >
                {formState.isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!formState.isValid}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Property Information Step Component
function PropertyInformationStep({ 
  data, 
  errors, 
  onChange 
}: {
  data: Partial<ClaimFormData>;
  errors: { [key: string]: string[] };
  onChange: (updates: Partial<ClaimFormData>) => void;
}) {
  const updateProperty = (updates: Partial<ClaimFormData['property']>) => {
    onChange({
      property: { ...data.property, ...updates }
    });
  };

  const updateAddress = (updates: Partial<ClaimFormData['property']['address']>) => {
    updateProperty({
      address: { ...data.property?.address, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              value={data.property?.address?.street || ''}
              onChange={(e) => updateAddress({ street: e.target.value })}
              error={errors.street?.[0]}
              required
            />
          </div>
          <Input
            label="Suburb"
            value={data.property?.address?.suburb || ''}
            onChange={(e) => updateAddress({ suburb: e.target.value })}
            error={errors.suburb?.[0]}
            required
          />
          <Input
            label="Postcode"
            value={data.property?.address?.postcode || ''}
            onChange={(e) => updateAddress({ postcode: e.target.value })}
            error={errors.postcode?.[0]}
            maxLength={4}
            pattern="[0-9]{4}"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.property?.address?.state || 'QLD'}
              onChange={(e) => updateAddress({ state: e.target.value })}
            >
              <option value="QLD">Queensland</option>
              <option value="NSW">New South Wales</option>
              <option value="VIC">Victoria</option>
              <option value="SA">South Australia</option>
              <option value="WA">Western Australia</option>
              <option value="TAS">Tasmania</option>
              <option value="NT">Northern Territory</option>
              <option value="ACT">Australian Capital Territory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.property?.propertyType || 'residential'}
              onChange={(e) => updateProperty({ propertyType: e.target.value as any })}
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="strata">Strata</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Construction Type
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.property?.constructionType || 'brick'}
              onChange={(e) => updateProperty({ constructionType: e.target.value as any })}
            >
              <option value="brick">Brick</option>
              <option value="timber">Timber</option>
              <option value="steel">Steel</option>
              <option value="concrete">Concrete</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          
          <Input
            label="Occupancy Type"
            value={data.property?.occupancyType || ''}
            onChange={(e) => updateProperty({ occupancyType: e.target.value })}
            error={errors.occupancyType?.[0]}
            placeholder="e.g., Single family dwelling, Office, Warehouse"
            required
          />
          
          <Input
            type="number"
            label="Number of Storeys"
            value={data.property?.storeys || 1}
            onChange={(e) => updateProperty({ storeys: parseInt(e.target.value) || 1 })}
            min={1}
            max={50}
          />
          
          <Input
            type="number"
            label="Year Built (Optional)"
            value={data.property?.yearBuilt || ''}
            onChange={(e) => updateProperty({ yearBuilt: parseInt(e.target.value) || undefined })}
            min={1800}
            max={new Date().getFullYear()}
          />
          
          <Input
            type="number"
            label="Floor Area (m²) (Optional)"
            value={data.property?.floorArea || ''}
            onChange={(e) => updateProperty({ floorArea: parseFloat(e.target.value) || undefined })}
            min={0}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

// Insurance Details Step Component
function InsuranceDetailsStep({ 
  data, 
  errors, 
  onChange 
}: {
  data: Partial<ClaimFormData>;
  errors: { [key: string]: string[] };
  onChange: (updates: Partial<ClaimFormData>) => void;
}) {
  const updateInsurance = (updates: Partial<ClaimFormData['insurance']>) => {
    onChange({
      insurance: { ...data.insurance, ...updates }
    });
  };

  const updatePolicyLimits = (updates: Partial<ClaimFormData['insurance']['policyLimits']>) => {
    updateInsurance({
      policyLimits: { ...data.insurance?.policyLimits, ...updates }
    });
  };

  const updateClaimHandler = (updates: Partial<ClaimFormData['insurance']['claimHandler']>) => {
    updateInsurance({
      claimHandler: { ...data.insurance?.claimHandler, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Insurance Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Insurer Name"
            value={data.insurance?.insurerName || ''}
            onChange={(e) => updateInsurance({ insurerName: e.target.value })}
            error={errors.insurerName?.[0]}
            required
          />
          
          <Input
            label="Policy Number"
            value={data.insurance?.policyNumber || ''}
            onChange={(e) => updateInsurance({ policyNumber: e.target.value })}
            error={errors.policyNumber?.[0]}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Type
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.insurance?.coverageType || 'comprehensive'}
              onChange={(e) => updateInsurance({ coverageType: e.target.value as any })}
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="basic">Basic</option>
              <option value="third_party">Third Party</option>
            </select>
          </div>
          
          <Input
            type="number"
            label="Excess Amount (Optional)"
            value={data.insurance?.excessAmount || ''}
            onChange={(e) => updateInsurance({ excessAmount: parseFloat(e.target.value) || undefined })}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Policy Limits */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Limits (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            label="Building Limit"
            value={data.insurance?.policyLimits?.building || ''}
            onChange={(e) => updatePolicyLimits({ building: parseFloat(e.target.value) || undefined })}
            min={0}
            step={0.01}
          />
          
          <Input
            type="number"
            label="Contents Limit"
            value={data.insurance?.policyLimits?.contents || ''}
            onChange={(e) => updatePolicyLimits({ contents: parseFloat(e.target.value) || undefined })}
            min={0}
            step={0.01}
          />
          
          <Input
            type="number"
            label="Additional Expenses Limit"
            value={data.insurance?.policyLimits?.additionalExpenses || ''}
            onChange={(e) => updatePolicyLimits({ additionalExpenses: parseFloat(e.target.value) || undefined })}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Claim Handler */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Handler (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Name"
            value={data.insurance?.claimHandler?.name || ''}
            onChange={(e) => updateClaimHandler({ name: e.target.value })}
          />
          
          <Input
            type="email"
            label="Email"
            value={data.insurance?.claimHandler?.email || ''}
            onChange={(e) => updateClaimHandler({ email: e.target.value })}
          />
          
          <Input
            label="Phone"
            value={data.insurance?.claimHandler?.phone || ''}
            onChange={(e) => updateClaimHandler({ phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// Client Information Step Component
function ClientInformationStep({ 
  data, 
  errors, 
  onChange 
}: {
  data: Partial<ClaimFormData>;
  errors: { [key: string]: string[] };
  onChange: (updates: Partial<ClaimFormData>) => void;
}) {
  const updateClient = (updates: Partial<ClaimFormData['client']>) => {
    onChange({
      client: { ...data.client, ...updates }
    });
  };

  const updatePrimaryContact = (updates: Partial<ClaimFormData['client']['primaryContact']>) => {
    updateClient({
      primaryContact: { ...data.client?.primaryContact, ...updates }
    });
  };

  const updateSecondaryContact = (updates: Partial<ClaimFormData['client']['secondaryContact']>) => {
    updateClient({
      secondaryContact: { ...data.client?.secondaryContact, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            value={data.client?.primaryContact?.name || ''}
            onChange={(e) => updatePrimaryContact({ name: e.target.value })}
            error={errors.primaryContactName?.[0]}
            required
          />
          
          <Input
            type="email"
            label="Email"
            value={data.client?.primaryContact?.email || ''}
            onChange={(e) => updatePrimaryContact({ email: e.target.value })}
            error={errors.primaryContactEmail?.[0]}
            required
          />
          
          <Input
            label="Phone"
            value={data.client?.primaryContact?.phone || ''}
            onChange={(e) => updatePrimaryContact({ phone: e.target.value })}
            error={errors.primaryContactPhone?.[0]}
            required
          />
          
          <Input
            label="Mobile (Optional)"
            value={data.client?.primaryContact?.mobile || ''}
            onChange={(e) => updatePrimaryContact({ mobile: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to Property
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.client?.primaryContact?.relationship || 'owner'}
              onChange={(e) => updatePrimaryContact({ relationship: e.target.value as any })}
            >
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="property_manager">Property Manager</option>
              <option value="strata_manager">Strata Manager</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.client?.primaryContact?.preferredContact || 'email'}
              onChange={(e) => updatePrimaryContact({ preferredContact: e.target.value as any })}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Secondary Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary Contact (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            value={data.client?.secondaryContact?.name || ''}
            onChange={(e) => updateSecondaryContact({ name: e.target.value })}
          />
          
          <Input
            type="email"
            label="Email"
            value={data.client?.secondaryContact?.email || ''}
            onChange={(e) => updateSecondaryContact({ email: e.target.value })}
          />
          
          <Input
            label="Phone"
            value={data.client?.secondaryContact?.phone || ''}
            onChange={(e) => updateSecondaryContact({ phone: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to Property
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.client?.secondaryContact?.relationship || 'owner'}
              onChange={(e) => updateSecondaryContact({ relationship: e.target.value as any })}
            >
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="property_manager">Property Manager</option>
              <option value="strata_manager">Strata Manager</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Occupancy Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Number of Occupants"
            value={data.client?.occupants || 1}
            onChange={(e) => updateClient({ occupants: parseInt(e.target.value) || 1 })}
            min={0}
            required
          />
        </div>
        
        {/* Note: Vulnerable occupants and pets would be added in a more advanced implementation */}
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Additional occupancy details (vulnerable occupants, pets, etc.) 
            can be added during the detailed assessment phase.
          </p>
        </div>
      </div>
    </div>
  );
}

// Damage Assessment Step Component
function DamageAssessmentStep({ 
  data, 
  errors, 
  onChange 
}: {
  data: Partial<ClaimFormData>;
  errors: { [key: string]: string[] };
  onChange: (updates: Partial<ClaimFormData>) => void;
}) {
  const damageTypes = ['water', 'fire', 'mould', 'smoke', 'storm', 'impact'] as const;

  const toggleDamageType = (type: string) => {
    const currentTypes = data.damageType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onChange({ damageType: newTypes });
  };

  return (
    <div className="space-y-6">
      {/* Claim Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Claim Number"
            value={data.claimNumber || ''}
            onChange={(e) => onChange({ claimNumber: e.target.value })}
            error={errors.claimNumber?.[0]}
            required
          />
          
          <Input
            type="date"
            label="Claim Date"
            value={data.claimDate ? new Date(data.claimDate).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange({ claimDate: new Date(e.target.value) })}
            required
          />
          
          <Input
            type="date"
            label="Incident Date"
            value={data.incidentDate ? new Date(data.incidentDate).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange({ incidentDate: new Date(e.target.value) })}
            required
          />
          
          <Input
            type="date"
            label="Discovery Date"
            value={data.discoveryDate ? new Date(data.discoveryDate).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange({ discoveryDate: new Date(e.target.value) })}
            required
          />
        </div>
      </div>

      {/* Cause of Loss */}
      <div>
        <Input
          label="Cause of Loss"
          value={data.causeOfLoss || ''}
          onChange={(e) => onChange({ causeOfLoss: e.target.value })}
          error={errors.causeOfLoss?.[0]}
          placeholder="e.g., Burst water pipe, Kitchen fire, Storm damage"
          required
        />
      </div>

      {/* Damage Types */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Damage Types</h3>
        {errors.damageType?.[0] && (
          <p className="text-red-600 text-sm mb-2">{errors.damageType[0]}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {damageTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.damageType?.includes(type) || false}
                onChange={() => toggleDamageType(type)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority and Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Priority</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.priority || 'medium'}
              onChange={(e) => onChange({ priority: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={data.status || 'intake'}
              onChange={(e) => onChange({ status: e.target.value as any })}
            >
              <option value="intake">Intake</option>
              <option value="assessment">Assessment</option>
              <option value="investigation">Investigation</option>
              <option value="reporting">Reporting</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary Step Component
function SummaryStep({ 
  data, 
  onEdit 
}: {
  data: Partial<ClaimFormData>;
  onEdit: (stepIndex: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Property Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Property Information</h3>
          <button 
            onClick={() => onEdit(0)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Address:</strong> {data.property?.address?.street}, {data.property?.address?.suburb}, {data.property?.address?.state} {data.property?.address?.postcode}</p>
          <p><strong>Type:</strong> {data.property?.propertyType} ({data.property?.constructionType})</p>
          <p><strong>Storeys:</strong> {data.property?.storeys}</p>
          <p><strong>Occupancy:</strong> {data.property?.occupancyType}</p>
        </div>
      </div>

      {/* Insurance Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Insurance Details</h3>
          <button 
            onClick={() => onEdit(1)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Insurer:</strong> {data.insurance?.insurerName}</p>
          <p><strong>Policy:</strong> {data.insurance?.policyNumber}</p>
          <p><strong>Coverage:</strong> {data.insurance?.coverageType}</p>
          {data.insurance?.excessAmount && (
            <p><strong>Excess:</strong> ${data.insurance.excessAmount.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Client Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
          <button 
            onClick={() => onEdit(2)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Primary Contact:</strong> {data.client?.primaryContact?.name}</p>
          <p><strong>Email:</strong> {data.client?.primaryContact?.email}</p>
          <p><strong>Phone:</strong> {data.client?.primaryContact?.phone}</p>
          <p><strong>Occupants:</strong> {data.client?.occupants}</p>
        </div>
      </div>

      {/* Damage Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Damage Assessment</h3>
          <button 
            onClick={() => onEdit(3)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Claim Number:</strong> {data.claimNumber}</p>
          <p><strong>Cause of Loss:</strong> {data.causeOfLoss}</p>
          <p><strong>Damage Types:</strong> {data.damageType?.join(', ')}</p>
          <p><strong>Priority:</strong> {data.priority}</p>
          <p><strong>Incident Date:</strong> {data.incidentDate ? new Date(data.incidentDate).toLocaleDateString() : ''}</p>
        </div>
      </div>
    </div>
  );
}