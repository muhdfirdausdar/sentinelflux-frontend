export interface GetApiResponse<T = Record<string, unknown>> {
    data: T;
    remark: string;
    status: string;
}

/**
 * SSE Response format - same structure as GetApiResponse but includes metadata
 * The data field is generic and can be any type depending on the endpoint
 */
export interface SSEResponse<T = Record<string, unknown>> {
    _meta: {
        lastUpdated: string | null;
        _sse_id: string | null;
    };
    data: T;
    remark: string;
    status?: string;
}