/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React,{ useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormStep from './FormStep';
import styles from './styles.module.css';

// Import validation schema
import { formSchema } from './validationSchema';

const InteractiveFormWizard = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    trigger,
    watch
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  });

  const steps = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      fields: ['personalInfo.fullName', 'personalInfo.email']
    },
    {
      id: 'caseDetails', 
      title: 'Case Details',
      fields: ['caseDetails.caseType', 'caseDetails.description']
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      fields: ['documents']
    }
  ];

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await trigger(fields);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.progressBar}>
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}
            onClick={() => index <= currentStep && setCurrentStep(index)}
          >
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepTitle}>{step.title}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {currentStep === 0 && (
          <FormStep title="Personal Information">
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input 
                {...register('personalInfo.fullName')} 
                className={errors.personalInfo?.fullName ? styles.error : ''}
              />
              {errors.personalInfo?.fullName && (
                <p className={styles.errorMessage}>
                  {errors.personalInfo.fullName.message}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email"
                {...register('personalInfo.email')}
                className={errors.personalInfo?.email ? styles.error : ''}
              />
              {errors.personalInfo?.email && (
                <p className={styles.errorMessage}>
                  {errors.personalInfo.email.message}
                </p>
              )}
            </div>
          </FormStep>
        )}

        {currentStep === 1 && (
          <FormStep title="Case Details">
            {/* Similar structure for case details */}
          </FormStep>
        )}

        {currentStep === 2 && (
          <FormStep title="Documents">
            {/* Document upload fields */}
          </FormStep>
        )}

        <div className={styles.navigationButtons}>
          {currentStep > 0 && (
            <button 
              type="button" 
              onClick={prevStep}
              className={styles.secondaryButton}
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className={styles.primaryButton}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InteractiveFormWizard;