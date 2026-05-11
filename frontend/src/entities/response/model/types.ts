export interface ReviewerResponse {
    id: number;
    comment_id: number;
    response_md: string;
    approved: boolean;
    created_at: string;
}

export interface ResponseSaveDto {
    response_md: string;
}

export interface ResponseApproveDto {
    approved: boolean;
}

export interface ExportDTO {
    reviewerId: number; 
    commentId: number; 
    format: ExportFormat
}

export interface AIResponse {
    response: string;
}

export type ExportFormat = 'pdf' | 'docx' | 'latex';