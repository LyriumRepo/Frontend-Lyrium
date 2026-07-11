export interface SellerTraining {
    id: number;
    title: string;
    description: string;
    url: string;
    platform: string;
    thumbnail: string | null;
    category: string | null;
    sort_order: number;
    is_required: boolean;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface SellerTrainingStats {
    total: number;
    completed: number;
    required: number;
    required_completed: number;
}
