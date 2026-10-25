import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyGraphQL } from '@/hooks/useGraphQL';
import apiClient from "@/services/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants";
import { GetApiResponse } from "@/types/restapi";
import { exportDigResultAsTXT } from '@/utils/exportData';
import { DOMAIN_FLUX_LOOKUP } from '@/constants/graphql';
import { DomainFluxLookupData } from '@/types/graphql';
import './getDR.css';

// Type definitions for DNS Dig Result
export interface TaskMetadata {
  domain_name: string;
  start_time: string;
  end_time: string;
  execution_duration: string;
}

export interface DNSDigResultData {
  task_id: string;
  found_in_history: boolean;
  remark?: string;
  task_metadata?: TaskMetadata;
  result_data?: string;
  total_runs?: number;
}

export interface DNSDigResultResponse {
  status: 'good' | 'normal' | 'error';
  remark: string;
  data: DNSDigResultData;
}

// Hook for fetching DNS Dig Result
export function useGetDNSDigResult() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<DNSDigResultResponse | null>(null);

  const fetchDigResult = async (taskId: string) => {
    if (!taskId.trim()) {
      setError('Task ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const url = `${API_BASE_URL}${API_ENDPOINTS.GET_DNS_DIG_RESULT}?task_id=${encodeURIComponent(taskId.trim())}`;
      console.log('Fetching DNS Dig result from URL:', url);

      const apiResponse = await apiClient.request(url, {
        method: 'GET',
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const result: GetApiResponse<DNSDigResultData> = await apiResponse.json();

      // Store the full response with status
      const fullResponse: DNSDigResultResponse = {
        status: result.status as 'good' | 'normal' | 'error',
        remark: result.remark,
        data: result.data,
      };

      setResponse(fullResponse);
      return fullResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching DNS dig result:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetResult = () => {
    setResponse(null);
    setError(null);
  };

  return { fetchDigResult, loading, error, response, resetResult };
}

// Helper function to format result_data with proper newlines
function formatResultData(resultData: string): string {
  // Replace \\n with actual newlines
  return resultData.replace(/\\n/g, '\n');
}

// Component for DNS Dig Result Fetch
export function DNSDigResultFetch() {
  const [taskId, setTaskId] = useState<string>('');
  const { fetchDigResult, loading, error, response, resetResult } = useGetDNSDigResult();
  const navigate = useNavigate();
  
  // GraphQL hook for domain lookup
  const [executeDomainLookup, { loading: lookupLoading }] = useLazyGraphQL<DomainFluxLookupData>(
    DOMAIN_FLUX_LOOKUP,
    {
      onCompleted: (result) => {
        if (result?.domainFluxLookup?.domainId) {
          // Navigate to domain details page with the domain ID
          navigate(`/domain-details?dom_id=${result.domainFluxLookup.domainId}`);
        } else {
          alert('Domain ID not found. The domain may not exist in the database.');
        }
      },
      onError: (err) => {
        console.error('Domain lookup error:', err);
        alert('Failed to lookup domain. Please try again.');
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskId.trim()) {
      alert('Task ID is required');
      return;
    }

    try {
      await fetchDigResult(taskId);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleReset = () => {
    resetResult();
    setTaskId('');
  };

  const handleViewDomainDetails = async () => {
    if (!response?.data.task_metadata?.domain_name) {
      alert('Domain name not available');
      return;
    }

    // Use GraphQL to get domain ID from domain name
    await executeDomainLookup({ 
      variables: { 
        domainName: response.data.task_metadata.domain_name 
      } 
    });
  };

  const handleExportTXT = () => {
    if (!response?.data.result_data || !response?.data.task_metadata?.domain_name) {
      alert('No data available to export');
      return;
    }

    try {
      exportDigResultAsTXT(
        response.data.result_data,
        response.data.task_metadata.domain_name,
        taskId
      );
    } catch (error) {
      console.error('Error exporting TXT:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="dns-dig-result-wrapper">
      <div className="dns-dig-card">
        <h2 className="section-header">Check DNS Digging Task</h2>
        
        <form onSubmit={handleSubmit} className="task-form">
          {/* Task ID Input */}
          <div className="form-group">
            <label htmlFor="task-id" className="form-label">Enter Task ID:</label>
            <input
              id="task-id"
              type="text"
              className="task-input"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter your task id here"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span> Checking...
                </>
              ) : (
                'Check Task ID'
              )}
            </button>
            {response && (
              <button 
                type="button" 
                onClick={handleReset}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="output-section">
            <h3 className="output-header">Output:</h3>
            <div className="status-card error">
              <h3 className="status-title">
                ❌ Error
              </h3>
              <div className="status-info">
                <div className="info-row">
                  <span className="info-label">Error:</span>
                  <span className="info-value">{error}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="output-section">
            <h3 className="output-header">Output:</h3>
            
            {/* Task Metadata Container */}
            <div className={`status-card ${response.status === 'error' ? 'error' : response.status === 'normal' ? 'warning' : 'success'}`}>
              <h3 className="status-title">
                {response.status === 'error' && '❌ Task Not Found'}
                {response.status === 'normal' && '⏳ Task In Progress'}
                {response.status === 'good' && '✅ Task Completed'}
              </h3>

              <div className="status-info">
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{response.remark}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Domain Name:</span>
                  <span className="info-value">{response.data.task_metadata?.domain_name || 'N/A'}</span>
                </div>

                {/* In Progress - Show Progress */}
                {response.status === 'normal' && response.data.remark && (
                  <div className="info-row">
                    <span className="info-label">Progress:</span>
                    <span className="info-value">{response.data.remark}</span>
                  </div>
                )}

                {/* Not Found */}
                {response.status === 'error' && !response.data.found_in_history && (
                  <div className="info-row">
                    <span className="info-value" style={{ color: '#ef4444' }}>
                      This task was not found or has not been processed yet.
                    </span>
                  </div>
                )}

                {/* Task Metadata - Only show for completed tasks */}
                {response.status === 'good' && response.data.task_metadata && (
                  <>
                    <div className="metadata-divider"></div>
                    
                    <div className="info-row">
                      <span className="info-label">Total Duration:</span>
                      <span className="info-value">1 day</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Dig Frequency:</span>
                      <span className="info-value">Every 3 hour</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Start Timestamp:</span>
                      <span className="info-value">
                        {new Date(response.data.task_metadata.start_time).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} ({new Date(response.data.task_metadata.start_time).toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()})
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">End Timestamp:</span>
                      <span className="info-value">
                        {new Date(response.data.task_metadata.end_time).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} ({new Date(response.data.task_metadata.end_time).toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()})
                      </span>
                    </div>
                    
                    <div className="info-row">
                      <span className="info-label">Result Expired at:</span>
                      <span className="info-value">
                        {new Date(new Date(response.data.task_metadata.end_time).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} ({new Date(response.data.task_metadata.end_time).toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()})
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Result Data Container - Only show for completed tasks */}
            {response.status === 'good' && response.data.result_data && (
              <div className="digging-output-section">
                <div className="digging-header">
                  <h3 className="digging-title">Digging Output</h3>
                  <div className="digging-actions">
                    <p className="export-label">Want a Deeper Analysis?</p>
                    <button 
                      className="deeper-analysis-btn"
                      onClick={handleViewDomainDetails}
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? 'Loading...' : 'View at Domain Details'}
                    </button>
                    <div className="export-section">
                      <span className="export-label">Export as:</span>
                      <button 
                        className="export-btn"
                        onClick={handleExportTXT}
                      >
                        TXT
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="result-display">
                  {formatResultData(response.data.result_data)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* 
 * ============================================================================
 * HOW TO USE THIS MODULE
 * ============================================================================
 * 
 * This module provides functionality to fetch DNS dig task results by Task ID.
 * It displays task metadata and results in separate containers with proper
 * formatting.
 * 
 * HOOK USAGE: useGetDNSDigResult()
 * --------------------------------
 * const { 
 *   fetchDigResult,  // Function to fetch results by task ID
 *   loading,         // Loading state
 *   error,           // Error message (network/HTTP errors)
 *   response,        // Full API response with status
 *   resetResult      // Function to clear results
 * } = useGetDNSDigResult();
 * 
 * await fetchDigResult('019a75e1-8872-7d8e-86a6-42e11fe2a2fa');
 * 
 * 
 * COMPONENT USAGE: DNSDigResultFetch
 * ----------------------------------
 * import { DNSDigResultFetch } from './getDigRequest';
 * 
 * function MyPage() {
 *   return <DNSDigResultFetch />;
 * }
 * 
 * 
 * RESPONSE STATES
 * ---------------
 * 
 * 1. ERROR STATE (status: "error")
 *    - Task not found or not processed yet
 *    - Shows error message in metadata container
 *    - No result data container shown
 * 
 * 2. IN PROGRESS STATE (status: "normal")
 *    - Task is currently being processed
 *    - Shows progress (e.g., "5/12" = 5 runs out of 12 completed)
 *    - No result data container shown yet
 * 
 * 3. SUCCESS STATE (status: "good")
 *    - Task completed successfully
 *    - Shows full task metadata (domain, times, duration)
 *    - Shows result data in scrollable text container
 *    - Displays "7 days deletion" notice
 * 
 * 
 * CONTAINERS
 * ----------
 * 
 * Task Metadata Container:
 * - Always shown when there's a response
 * - Color-coded border (red=error, amber=progress, green=success)
 * - Shows task ID, status, and relevant metadata
 * - For completed tasks: includes domain, timestamps, duration
 * 
 * Result Data Container:
 * - Only shown for completed tasks (status: "good")
 * - Scrollable textarea-style display (max height: 500px)
 * - Monospace font for proper alignment
 * - Converts \\n to actual newlines for readability
 * 
 * 
 * API RESPONSE EXAMPLES
 * ---------------------
 * 
 * Not Found:
 * {
 *   "status": "error",
 *   "remark": "Task not found or yet to be processed",
 *   "data": {
 *     "task_id": "...",
 *     "found_in_history": false
 *   }
 * }
 * 
 * In Progress:
 * {
 *   "status": "normal",
 *   "remark": "Task currently being processed",
 *   "data": {
 *     "task_id": "...",
 *     "found_in_history": true,
 *     "remark": "5/12",  // 5 runs completed out of 12 total
 *     "task_metadata": {...}
 *   }
 * }
 * 
 * Completed:
 * {
 *   "status": "good",
 *   "remark": "Task completed",
 *   "data": {
 *     "task_id": "...",
 *     "found_in_history": true,
 *     "remark": "user done",
 *     "task_metadata": {
 *       "domain_name": "x.com",
 *       "start_time": "2025-11-11T02:33:30.534463+00:00",
 *       "end_time": "2025-11-11T02:36:25.721341+00:00",
 *       "execution_duration": "00:02:55"
 *     },
 *     "result_data": "\\n\\n================...\\n",
 *     "total_runs": 3
 *   }
 * }
 * 
 * 
 * EXAMPLE: Custom implementation
 * -------------------------------
 * import { useGetDNSDigResult } from './getDigRequest';
 * 
 * function CustomComponent() {
 *   const [taskId, setTaskId] = useState('');
 *   const { fetchDigResult, loading, response } = useGetDNSDigResult();
 * 
 *   const handleFetch = async () => {
 *     await fetchDigResult(taskId);
 *   };
 * 
 *   return (
 *     <div>
 *       <input value={taskId} onChange={e => setTaskId(e.target.value)} />
 *       <button onClick={handleFetch} disabled={loading}>Fetch</button>
 *       
 *       {response?.status === 'good' && (
 *         <div>
 *           <p>Domain: {response.data.task_metadata?.domain_name}</p>
 *           <pre>{response.data.result_data}</pre>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
