import { useState, useRef } from 'react';
import apiClient from "@/services/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants";
import { GetApiResponse } from "@/types/restapi";
import './submitDR.css';

// Type definitions for DNS Dig Request
export interface DNSDigRequestPayload {
  domain: string;                // required
  total_duration: number;        // required (in minutes)
  minute_dig_every: number;      // required (in minutes)
  email?: string;                // optional
}

export interface DNSDigResponseData {
  success?: boolean;
  task_ids?: string[];
  domains_count?: number;
  domains?: string[];
  mode?: string;
  priority?: number;
  user_request_info?: {
    total_expected_run: number;
    total_duration: number;
    minute_dig_every: number;
  };
  [key: string]: any;
}

// Duration options from 30 minutes to 1 day
export interface DurationOption {
  label: string;
  value: number; // in minutes
}

export const DURATION_OPTIONS: DurationOption[] = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '6 hours', value: 360 },
  { label: '12 hours', value: 720 },
  { label: '1 day', value: 1440 },
];

// Generate dig interval options based on selected duration
export function getDigIntervalOptions(totalDurationMinutes: number): DurationOption[] {
  const options: DurationOption[] = [];
  
  // Generate options from 10 minutes up to (but not including) the total duration
  const intervals = [
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
    { label: '5 hours', value: 300 },
  ];

  // Only include intervals that are less than the total duration
  for (const interval of intervals) {
    if (interval.value < totalDurationMinutes) {
      options.push(interval);
    }
  }

  return options;
}

// Hook for submitting DNS Dig Request
export function useSubmitDNSDig() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRemark, setErrorRemark] = useState<string | null>(null);
  const [response, setResponse] = useState<DNSDigResponseData | null>(null);
  const [statusVisible, setStatusVisible] = useState<boolean>(false);

  const submitDigRequest = async (payload: DNSDigRequestPayload) => {
    try {
      setLoading(true);
      setError(null);
      setErrorRemark(null);
      setResponse(null);
      setStatusVisible(false);

      const url = API_BASE_URL + API_ENDPOINTS.POST_DNS_DIG_REQUEST;
      console.log('Submitting DNS Dig request to URL:', url);
      console.log('Payload:', payload);

      const apiResponse = await apiClient.request(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const result: GetApiResponse<DNSDigResponseData> = await apiResponse.json();

      // Show status container
      setStatusVisible(true);

      if (result.status === 'good' && result.data) {
        setResponse(result.data);
        return result.data;
      } else if (result.status === 'error') {
        // Handle error status from API
        setError('error');
        setErrorRemark(result.remark || 'Task creation failed');
        throw new Error(result.remark || 'Failed to submit DNS dig request');
      } else {
        throw new Error(result.remark || 'Failed to submit DNS dig request');
      }
    } catch (err) {
      setStatusVisible(true);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (!error) {
        setError('error');
        setErrorRemark(errorMessage);
      }
      console.error('Error submitting DNS dig request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetStatus = () => {
    setStatusVisible(false);
    setError(null);
    setErrorRemark(null);
    setResponse(null);
  };

  return { submitDigRequest, loading, error, errorRemark, response, statusVisible, resetStatus };
}

// Component for DNS Dig Request Form
export function DNSDigRequestForm() {
  const [domain, setDomain] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [minuteDigEvery, setMinuteDigEvery] = useState<number | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  
  const { submitDigRequest, loading, error, errorRemark, response, statusVisible, resetStatus } = useSubmitDNSDig();
  
  // Reference to the submit section for auto-scrolling
  const submitSectionRef = useRef<HTMLDivElement>(null);

  // Get available dig interval options based on selected duration
  const digIntervalOptions = totalDuration ? getDigIntervalOptions(totalDuration) : [];

  // Reset minute_dig_every when total_duration changes
  const handleDurationChange = (value: string) => {
    const durationValue = parseInt(value);
    setTotalDuration(durationValue);
    setMinuteDigEvery(null); // Reset dig interval when duration changes
    setIsConfirmed(false); // Reset confirmation when duration changes
  };

  const handleConfirmProceed = () => {
    // Validate required fields before confirming
    if (!domain.trim()) {
      alert('Domain is required');
      return;
    }
    if (!totalDuration) {
      alert('Please select a total duration');
      return;
    }
    if (!minuteDigEvery) {
      alert('Please select dig interval');
      return;
    }
    setIsConfirmed(true);
    
    // Scroll to the submit section after a short delay to allow state to update
    setTimeout(() => {
      if (submitSectionRef.current) {
        submitSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if form is confirmed
    if (!isConfirmed) {
      alert('Please confirm your settings by clicking "Confirm & Proceed" first');
      return;
    }

    // Validate required fields
    if (!domain.trim()) {
      alert('Domain is required');
      return;
    }

    if (!totalDuration) {
      alert('Please select a total duration');
      return;
    }

    if (!minuteDigEvery) {
      alert('Please select dig interval');
      return;
    }

    // Build payload
    const payload: DNSDigRequestPayload = {
      domain: domain.trim(),
      total_duration: totalDuration,
      minute_dig_every: minuteDigEvery,
    };

    // Add email if provided
    if (email.trim()) {
      payload.email = email.trim();
    }

    try {
      await submitDigRequest(payload);
      // Success - status container will show automatically
    } catch (err) {
      // Error is already handled in the hook and shown in status container
    }
  };

  return (
    <div className="dns-dig-form-wrapper">
      <form onSubmit={handleSubmit}>
        {/* Schedule Information Section */}
        <div className="schedule-section">
          <h2 className="schedule-section-title">Schedule Information</h2>
          
          <div className="form-grid">
            {/* Domain Input */}
            <div className="form-group">
              <label htmlFor="domain" className="form-label">Domain Name:</label>
              <input
                id="domain"
                type="text"
                className="form-input"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setIsConfirmed(false);
                }}
                placeholder="post-to-me.com"
                required
              />
            </div>

            {/* Total Duration Dropdown */}
            <div className="form-group">
              <label htmlFor="total-duration" className="form-label">Total Duration</label>
              <select
                id="total-duration"
                className="form-select"
                value={totalDuration ?? ''}
                onChange={(e) => handleDurationChange(e.target.value)}
                required
              >
                <option value="">Run For?</option>
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="helper-text">How long this automated dig will be?</span>
            </div>

            {/* Minute Dig Every Dropdown */}
            <div className="form-group">
              <label htmlFor="minute-dig-every" className="form-label">Dig Frequency:</label>
              <select
                id="minute-dig-every"
                className="form-select"
                value={minuteDigEvery ?? ''}
                onChange={(e) => {
                  setMinuteDigEvery(parseInt(e.target.value));
                  setIsConfirmed(false);
                }}
                disabled={!totalDuration}
                required
              >
                <option value="">Dig For?</option>
                {digIntervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="helper-text">How frequent DNS digging?</span>
            </div>
          </div>

          {/* Confirm & Proceed Button */}
          <div className="confirm-proceed-wrapper">
            <button type="button" className="confirm-proceed-btn" onClick={handleConfirmProceed}>
              Confirm & Proceed
            </button>
          </div>
        </div>

        {/* Submit DNS Dig Section */}
        <div className="submit-section" ref={submitSectionRef}>
          <h2 className="submit-section-title">Submit DNS Dig</h2>

          {/* Task Information */}
          <div className="task-info">
            <p className="task-info-title">Task Information:</p>
            {isConfirmed && domain && totalDuration && minuteDigEvery ? (
              <p className="task-info-text">
                Run DNS Dig for domain <span className="highlight">{domain}</span> every{' '}
                <span className="highlight">
                  {minuteDigEvery} minute{minuteDigEvery !== 1 ? 's' : ''}
                </span>{' '}
                for{' '}
                <span className="highlight">
                  {totalDuration >= 60 ? `${totalDuration / 60} hour${totalDuration / 60 !== 1 ? 's' : ''}` : `${totalDuration} minute${totalDuration !== 1 ? 's' : ''}`}
                </span>{' '}
                collecting A and NS records
              </p>
            ) : (
              <p className="task-info-text" style={{ color: '#64748b', fontStyle: 'italic' }}>
                Please fill in the form and click "Confirm & Proceed" to see task details
              </p>
            )}
          </div>

          {/* Email Input (Optional) */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Notification (Optional):</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sentinelflux@gmail.com"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-digging-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Digging Task'}
          </button>

          {/* Output Section */}
          <div className="output-section">
            <p className="output-label">Output:</p>
            
            {/* Status Container - Hidden by default, appears after submission */}
            {statusVisible && (
              <div className={`status-container ${error ? 'error' : 'success'}`}>
                {/* Error Status */}
                {error && (
                  <>
                    <h3 className="status-title error">
                      ❌ Error
                    </h3>
                    <p className="status-text">
                      <strong>Status:</strong> {error}
                    </p>
                    <p className="status-text">
                      <strong>Details:</strong> {errorRemark}
                    </p>
                  </>
                )}

                {/* Success Status */}
                {response && response.success && (
                  <>
                    <h3 className="status-title success">
                      ✅ Success! DNS Dig Task Created
                    </h3>

                    {/* Task ID - Most Important */}
                    {response.task_ids && response.task_ids.length > 0 && (
                      <div className="task-id-box">
                        <p className="task-id-label">
                          📋 Task ID:
                        </p>
                        <p className="task-id-value">
                          {response.task_ids[0]}
                        </p>
                        <p className="task-id-warning">
                          ⚠️ <strong>Please save this Task ID!</strong> You will need it to check the results after the task is finished.
                        </p>
                      </div>
                    )}

                    {/* Task Details */}
                    <div className="task-details">
                      <p className="status-text">
                        <strong>Domain{response.domains && response.domains.length > 1 ? 's' : ''}:</strong>{' '}
                        {response.domains ? response.domains.join(', ') : 'N/A'}
                      </p>

                      {response.user_request_info && (
                        <>
                          <p className="status-text">
                            <strong>Total Expected Runs:</strong>{' '}
                            {response.user_request_info.total_expected_run} times
                          </p>
                          <p className="status-text">
                            <strong>Total Duration:</strong>{' '}
                            {response.user_request_info.total_duration} minute{response.user_request_info.total_duration !== 1 ? 's' : ''}
                          </p>
                          <p className="status-text">
                            <strong>Dig Every:</strong>{' '}
                            {response.user_request_info.minute_dig_every} minute{response.user_request_info.minute_dig_every !== 1 ? 's' : ''}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Close/Reset Button */}
                    <div className="close-btn-wrapper">
                      <button 
                        type="button"
                        onClick={resetStatus}
                        className="close-btn"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* 
 * ============================================================================
 * HOW TO USE THIS MODULE
 * ============================================================================
 * 
 * This module provides a hook and component for submitting DNS dig requests.
 * It includes a status container that appears after submission showing either
 * success or error information.
 * 
 * HOOK USAGE: useSubmitDNSDig()
 * ------------------------------
 * const { 
 *   submitDigRequest, 
 *   loading, 
 *   error,           // 'error' if failed, null if success
 *   errorRemark,     // Error message from server
 *   response,        // Success response data
 *   statusVisible,   // Whether status container is visible
 *   resetStatus      // Function to hide status container
 * } = useSubmitDNSDig();
 * 
 * await submitDigRequest({
 *   domain: "x.com",
 *   total_duration: 60,      // in minutes
 *   minute_dig_every: 10,    // in minutes
 *   email: "user@example.com" // optional
 * });
 * 
 * 
 * COMPONENT USAGE: DNSDigRequestForm
 * -----------------------------------
 * import { DNSDigRequestForm } from './submitDigRequest';
 * 
 * function MyPage() {
 *   return <DNSDigRequestForm />;
 * }
 * 
 * The form includes:
 * - Domain input field (required)
 * - Duration dropdown: "Run For?" (required)
 * - Dig interval dropdown: "Dig Domain Every?" (disabled until duration selected)
 * - Email input field (optional)
 * - Status container (hidden, appears after submission)
 * 
 * 
 * STATUS CONTAINER BEHAVIOR
 * -------------------------
 * Hidden by default. Appears after form submission with either:
 * 
 * ERROR STATUS:
 * - Shows error status and remark from server
 * - Example: "Task creation failed: Invalid domain format"
 * 
 * SUCCESS STATUS:
 * - Highlights Task ID prominently (user must save this!)
 * - Shows domain(s) being monitored
 * - Displays task configuration (total runs, duration, interval)
 * - Includes "Close" button to hide status
 * 
 * 
 * HELPER FUNCTIONS
 * ----------------
 * - DURATION_OPTIONS: Array of available duration options (30 min to 1 day)
 * - getDigIntervalOptions(totalDurationMinutes): Get valid dig intervals for a duration
 * 
 * 
 * API RESPONSE FORMATS
 * --------------------
 * Error Response:
 * {
 *   "status": "error",
 *   "remark": "Task creation failed: Invalid domain format",
 *   "data": {}
 * }
 * 
 * Success Response:
 * {
 *   "status": "good",
 *   "remark": "Successfully created 1 tasks",
 *   "data": {
 *     "success": true,
 *     "task_ids": ["019a75c9-3b55-7756-a444-e0f6e984fb62"],
 *     "domains": ["x.com"],
 *     "user_request_info": {
 *       "total_expected_run": 3,
 *       "total_duration": 3,
 *       "minute_dig_every": 1
 *     }
 *   }
 * }
 * 
 * 
 * EXAMPLE: Custom form using the hook
 * ------------------------------------
 * import { useSubmitDNSDig } from './submitDigRequest';
 * 
 * function CustomForm() {
 *   const [domain, setDomain] = useState('');
 *   const { submitDigRequest, loading, statusVisible, response, error } = useSubmitDNSDig();
 * 
 *   const handleSubmit = async () => {
 *     try {
 *       await submitDigRequest({
 *         domain,
 *         total_duration: 60,
 *         minute_dig_every: 10
 *       });
 *     } catch (err) {
 *       // Error already handled by hook
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <input value={domain} onChange={e => setDomain(e.target.value)} />
 *       <button onClick={handleSubmit} disabled={loading}>
 *         {loading ? 'Submitting...' : 'Submit'}
 *       </button>
 *       
 *       {statusVisible && (
 *         <div>
 *           {error && <p>Error: {error}</p>}
 *           {response && <p>Task ID: {response.task_ids?.[0]}</p>}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */